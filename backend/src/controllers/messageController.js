const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sanitizeText, sanitizeFileName, detectMalware } = require('../utils/sanitizer');
const { logActivity } = require('./activityController');
const fs = require('fs');
const path = require('path');

// Helper function to create educator-only group chat
async function createEducatorGroupChat(institutionId, institutionName) {
  try {
    const educatorChannel = await prisma.chatChannel.create({
      data: {
        name: `${institutionName} - Erzieher Chat`,
        type: 'GROUP_CHAT',
        institutionId: institutionId,
        // No groupId since this is for all educators in the institution
      },
    });
    return educatorChannel;
  } catch (error) {
    console.error('Error creating educator group chat:', error);
    return null;
  }
}

// Helper function to get user's accessible channels
async function getUserChannelsHelper(userId, userRole, institutionId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      groups: {
        include: {
          channel: true,
          institution: true
        }
      },
      children: {
        include: {
          group: {
            include: {
              channel: true,
              institution: true
            }
          }
        }
      },
      channels: {
        include: {
          institution: true,
          group: true
        }
      },
      directMessages1: {
        include: {
          user2: {
            include: { children: true }
          }
        }
      },
      directMessages2: {
        include: {
          user1: {
            include: { children: true }
          }
        }
      }
    }
  });

  const channels = [];

  // Add group channels for educators and parents only
  if (userRole === 'EDUCATOR' || userRole === 'PARENT') {
    if (user.groups && Array.isArray(user.groups)) {
      user.groups.forEach(group => {
        if (group && group.channel) {
          channels.push({
            id: group.channel.id,
            name: `${group.name} Chat`,
            type: 'GROUP_CHAT',
            groupId: group.id,
            groupName: group.name,
            institutionId: group.institutionId,
            institutionName: group.institution?.name || 'Institution',
            lastMessage: null,
            unreadCount: 0
          });
        }
      });
    }
  }

  // Add educator-only group chat for educators
  if (userRole === 'EDUCATOR' && institutionId) {
    const educatorChannel = await prisma.chatChannel.findFirst({
      where: {
        institutionId,
        type: 'GROUP_CHAT',
        groupId: null // Educator-only channels have no groupId
      },
      include: {
        institution: true
      }
    });

    if (educatorChannel) {
      channels.push({
        id: educatorChannel.id,
        name: educatorChannel.name,
        type: 'GROUP_CHAT',
        institutionId,
        institutionName: educatorChannel.institution?.name || 'Institution',
        lastMessage: null,
        unreadCount: 0
      });
    }
  }

  // Add institution-wide channel for all users except admins
  if (institutionId && (userRole === 'EDUCATOR' || userRole === 'PARENT')) {
    const institutionChannel = await prisma.chatChannel.findFirst({
      where: {
        institutionId,
        type: 'INSTITUTION_CHAT'
      },
      include: {
        institution: true
      }
    });

    if (institutionChannel) {
      channels.push({
        id: institutionChannel.id,
        name: `${institutionChannel.institution?.name || 'Institution'} Chat`,
        type: 'INSTITUTION_CHAT',
        institutionId,
        institutionName: institutionChannel.institution?.name || 'Institution',
        lastMessage: null,
        unreadCount: 0
      });
    }
  }

  // Add direct messages (only between parents and educators, not admins)
  const allDirectMessages = [...user.directMessages1, ...user.directMessages2];
  for (const dm of allDirectMessages) {
    const otherUser = dm.user1Id === userId ? dm.user2 : dm.user1;
    // Only allow DMs if both are parent or educator (not admin/super_admin)
    if (["PARENT", "EDUCATOR"].includes(otherUser.role) && ["PARENT", "EDUCATOR"].includes(userRole)) {
      // For parents, we need to create separate entries for each child
      if (otherUser.role === 'PARENT' && otherUser.children && otherUser.children.length > 0) {
        for (const child of otherUser.children) {
          const displayName = `${child.name} (${otherUser.name})`;
          const avatarUrl = child.photoUrl || otherUser.avatarUrl;
          const childUserId = `${otherUser.id}_${child.id}`;
          
          channels.push({
            id: dm.id,
            name: displayName,
            type: 'DIRECT_MESSAGE',
            otherUserId: childUserId,
            otherUserName: displayName,
            otherUserRole: otherUser.role,
            avatarUrl,
            lastMessage: null,
            unreadCount: 0
          });
        }
      } else {
        // For educators or parents without children, show as single user
        let displayName = otherUser.name;
        let avatarUrl = otherUser.avatarUrl;
        if (otherUser.role === 'PARENT') {
          const childNames = (otherUser.children || []).map(c => c.name).join(', ');
          displayName = childNames ? `${childNames} (${otherUser.name})` : otherUser.name;
          // Prefer child photo as avatar if available
          if (otherUser.children && otherUser.children[0] && otherUser.children[0].photoUrl) {
            avatarUrl = otherUser.children[0].photoUrl;
          }
        }
        channels.push({
          id: dm.id,
          name: displayName,
          type: 'DIRECT_MESSAGE',
          otherUserId: otherUser.id,
          otherUserName: displayName,
          otherUserRole: otherUser.role,
          avatarUrl,
          lastMessage: null,
          unreadCount: 0
        });
      }
    }
  }

  return channels;
}

// GET /channels - Get all accessible channels for user
async function getUserChannels(req, res) {
  const userId = req.user.id;
  const userRole = req.user.role;
  const institutionId = req.user.institutionId;

  try {
    const channels = await getUserChannelsHelper(userId, userRole, institutionId);
    
    // Get last message and unread count for each channel
    for (let channel of channels) {
      if (channel.type === 'DIRECT_MESSAGE') {
        const lastMessage = await prisma.message.findFirst({
          where: { directMessageId: channel.id },
          orderBy: { createdAt: 'desc' },
          include: { sender: true }
        });
        channel.lastMessage = lastMessage;
      } else {
        const lastMessage = await prisma.message.findFirst({
          where: { channelId: channel.id },
          orderBy: { createdAt: 'desc' },
          include: { sender: true }
        });
        channel.lastMessage = lastMessage;
      }
    }

    // Sort by last message time
    channels.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.json(channels);
  } catch (err) {
    console.error('Error in getUserChannels:', err);
    res.status(500).json({ success: false, message: 'Fehler beim Laden der Kanäle' });
  }
}

// GET /channels/:channelId/messages - Get messages for a specific channel
async function getChannelMessages(req, res) {
  const { channelId } = req.params;
  const userId = req.user.id;

  try {
    const channel = await prisma.chatChannel.findUnique({
      where: { id: channelId },
      include: {
        institution: true,
        group: true,
        participants: true
      }
    });

    if (!channel) {
      return res.status(404).json({ success: false, message: 'Kanal nicht gefunden' });
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        groups: true,
        children: {
          include: { group: true }
        }
      }
    });

    let hasAccess = false;

    if (channel.type === 'GROUP_CHAT') {
      if (channel.groupId === null) {
        // Educator-only chat - check if user is educator in same institution
        hasAccess = user.role === 'EDUCATOR' && user.institutionId === channel.institutionId;
      } else {
        // Regular group chat - check if user belongs to the group
        hasAccess = user.groups.some(g => g.id === channel.groupId);
      }
    } else if (channel.type === 'INSTITUTION_CHAT') {
      hasAccess = user.institutionId === channel.institutionId;
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung für diesen Kanal' });
    }

    const messages = await prisma.message.findMany({
      where: { channelId },
      include: { 
        sender: true,
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Transform messages to match frontend expectations
    const transformedMessages = messages.map(message => {
      // Group reactions by emoji
      const reactionGroups = {};
      message.reactions.forEach(reaction => {
        if (!reactionGroups[reaction.emoji]) {
          reactionGroups[reaction.emoji] = {
            id: reaction.emoji,
            emoji: reaction.emoji,
            count: 0,
            users: [],
            hasReacted: false
          };
        }
        reactionGroups[reaction.emoji].count++;
        reactionGroups[reaction.emoji].users.push(reaction.user.id);
        if (reaction.userId === userId) {
          reactionGroups[reaction.emoji].hasReacted = true;
        }
      });

      return {
        id: message.id,
        content: message.content || '',
        attachmentUrl: message.fileUrl,
        attachmentName: message.fileUrl ? message.fileUrl.split('/').pop() : null,
        createdAt: message.createdAt,
        editedAt: message.editedAt,
        isEdited: message.isEdited,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          role: message.sender.role,
          avatarUrl: message.sender.avatarUrl
        },
        replyTo: message.replyTo ? {
          id: message.replyTo.id,
          content: message.replyTo.content,
          senderName: message.replyTo.sender.name
        } : undefined,
        reactions: Object.values(reactionGroups)
      };
    });

    res.json(transformedMessages);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Fehler beim Laden der Nachrichten' });
  }
}

// GET /direct-messages/:otherUserId - Get or create direct message conversation
async function getDirectMessages(req, res) {
  const { otherUserId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Check if both users are in the same institution
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { institution: true, children: true }
    });

    // Handle child-parent user IDs (format: parentId_childId)
    let actualOtherUserId = otherUserId;
    if (otherUserId.includes('_')) {
      const [parentId, childId] = otherUserId.split('_');
      actualOtherUserId = parentId; // Use the parent's ID for the actual user
    }

    const otherUser = await prisma.user.findUnique({
      where: { id: actualOtherUserId },
      include: { institution: true, children: true }
    });

    if (!otherUser) {
      return res.status(404).json({ success: false, message: 'Benutzer nicht gefunden' });
    }

    if (user.institutionId !== otherUser.institutionId) {
      return res.status(403).json({ success: false, message: 'Nur Benutzer der gleichen Institution können chatten' });
    }

    // Only allow DMs if both are parent or educator (not admin/super_admin)
    if (!(["PARENT", "EDUCATOR"].includes(user.role) && ["PARENT", "EDUCATOR"].includes(otherUser.role))) {
      return res.status(403).json({ success: false, message: 'Nur Eltern und Erzieher können chatten' });
    }

    // Find or create direct message conversation
    let directMessage = await prisma.directMessage.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: actualOtherUserId },
          { user1Id: actualOtherUserId, user2Id: userId }
        ]
      }
    });

    if (!directMessage) {
      directMessage = await prisma.directMessage.create({
        data: {
          user1Id: userId,
          user2Id: actualOtherUserId
        }
      });
    }

    const messages = await prisma.message.findMany({
      where: { directMessageId: directMessage.id },
      include: { 
        sender: true,
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Transform messages to match frontend expectations
    const transformedMessages = messages.map(message => {
      // Group reactions by emoji
      const reactionGroups = {};
      message.reactions.forEach(reaction => {
        if (!reactionGroups[reaction.emoji]) {
          reactionGroups[reaction.emoji] = {
            id: reaction.emoji,
            emoji: reaction.emoji,
            count: 0,
            users: [],
            hasReacted: false
          };
        }
        reactionGroups[reaction.emoji].count++;
        reactionGroups[reaction.emoji].users.push(reaction.user.id);
        if (reaction.userId === userId) {
          reactionGroups[reaction.emoji].hasReacted = true;
        }
      });

      return {
        id: message.id,
        content: message.content || '',
        attachmentUrl: message.fileUrl,
        attachmentName: message.fileUrl ? message.fileUrl.split('/').pop() : null,
        createdAt: message.createdAt,
        editedAt: message.editedAt,
        isEdited: message.isEdited,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          role: message.sender.role,
          avatarUrl: message.sender.avatarUrl
        },
        replyTo: message.replyTo ? {
          id: message.replyTo.id,
          content: message.replyTo.content,
          senderName: message.replyTo.sender.name
        } : undefined,
        reactions: Object.values(reactionGroups)
      };
    });

    // For child-parent combinations, show the specific child name
    let displayName = otherUser.name;
    let avatarUrl = otherUser.avatarUrl;
    
    if (otherUserId.includes('_')) {
      const [parentId, childId] = otherUserId.split('_');
      const child = otherUser.children?.find(c => c.id === childId);
      if (child) {
        displayName = `${child.name} (${otherUser.name})`;
        avatarUrl = child.photoUrl || otherUser.avatarUrl;
      }
    } else if (otherUser.role === 'PARENT') {
      // For regular parent (without specific child), show all children
      const childNames = (otherUser.children || []).map(c => c.name).join(', ');
      displayName = childNames ? `${childNames} (${otherUser.name})` : otherUser.name;
      if (otherUser.children && otherUser.children[0] && otherUser.children[0].photoUrl) {
        avatarUrl = otherUser.children[0].photoUrl;
      }
    }

    res.json({
      directMessageId: directMessage.id,
      otherUser: {
        id: otherUserId, // Keep the original ID for frontend reference
        name: displayName,
        role: otherUser.role,
        avatarUrl
      },
      messages: transformedMessages
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Fehler beim Laden der Direktnachrichten' });
  }
}

// POST /message - Send message to channel or direct message
async function sendMessage(req, res) {
  const { content, channelId, directMessageId, replyToId } = req.body;
  const senderId = req.user.id;
  const user = req.user;
  let fileUrl = null;
  let fileType = null;

  if (req.file) {
    // Check for malware before processing
    if (detectMalware(req.file.buffer, req.file.originalname)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Suspicious file content detected. Upload rejected for security reasons.' 
      });
    }
    
    // Save file to disk after malware check passes
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const safeFileName = sanitizeFileName(req.file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = unique + '-' + safeFileName;
    const filePath = path.join(uploadsDir, fileName);
    
    fs.writeFileSync(filePath, req.file.buffer);
    fileUrl = `/uploads/${fileName}`;
    
    if (req.file.mimetype.startsWith('image/')) {
      fileType = 'IMAGE';
    } else if (req.file.mimetype === 'application/pdf') {
      fileType = 'PDF';
    } else {
      // For other file types (word, text, etc.), set fileType to null
      fileType = null;
    }
  }

  if (!content && !fileUrl) {
    return res.status(400).json({ success: false, message: 'Nachricht oder Datei erforderlich' });
  }

  if (!channelId && !directMessageId) {
    return res.status(400).json({ success: false, message: 'channelId oder directMessageId erforderlich' });
  }

  try {
    let messageData = {
      senderId,
      content: content ? sanitizeText(content) : '', // Sanitize content to prevent XSS
      fileUrl,
      fileType,
      replyToId: replyToId || undefined,
      institutionId: user.institutionId // Set institutionId from user
    };

    if (channelId) {
      // Check channel permissions
      const channel = await prisma.chatChannel.findUnique({
        where: { id: channelId },
        include: {
          institution: true,
          group: true,
          participants: true
        }
      });

      if (!channel) {
        return res.status(404).json({ success: false, message: 'Kanal nicht gefunden' });
      }

      // Check if user has access to this channel
      const userGroups = await prisma.user.findUnique({
        where: { id: senderId },
        include: { groups: true }
      });

      let hasAccess = false;

      if (channel.type === 'GROUP_CHAT') {
        if (channel.groupId === null) {
          // Educator-only chat - check if user is educator in same institution
          hasAccess = user.role === 'EDUCATOR' && user.institutionId === channel.institutionId;
        } else {
          // Regular group chat - check if user belongs to the group
          hasAccess = userGroups.groups.some(g => g.id === channel.groupId);
        }
      } else if (channel.type === 'INSTITUTION_CHAT') {
        hasAccess = user.institutionId === channel.institutionId;
      }

      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Keine Berechtigung für diesen Kanal' });
      }

      messageData.channelId = channelId;
    } else if (directMessageId) {
      // Check direct message permissions
      const directMessage = await prisma.directMessage.findUnique({
        where: { id: directMessageId },
        include: { user1: true, user2: true }
      });

      if (!directMessage) {
        return res.status(404).json({ success: false, message: 'Direktnachricht nicht gefunden' });
      }

      if (directMessage.user1Id !== senderId && directMessage.user2Id !== senderId) {
        return res.status(403).json({ success: false, message: 'Keine Berechtigung für diese Direktnachricht' });
      }

      messageData.directMessageId = directMessageId;
    }

    const message = await prisma.message.create({
      data: messageData,
      include: { 
        sender: true,
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Transform response to match frontend expectations
    const responseMessage = {
      id: message.id,
      content: message.content || '',
      attachmentUrl: message.fileUrl,
      attachmentName: message.fileUrl ? message.fileUrl.split('/').pop() : null,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      isEdited: message.isEdited,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        role: message.sender.role,
        avatarUrl: message.sender.avatarUrl
      },
      replyTo: message.replyTo ? {
        id: message.replyTo.id,
        content: message.replyTo.content,
        senderName: message.replyTo.sender.name
      } : undefined,
      reactions: []
    };

    // Log activity
    const messageType = channelId ? 'channel' : 'direct';
    const messageTarget = channelId || directMessageId;
    
    await logActivity(
      senderId,
      'MESSAGE_SENT',
      'Message',
      messageTarget,
      `Sent message to ${messageType}: ${content ? content.substring(0, 50) + (content.length > 50 ? '...' : '') : 'with attachment'}`,
      user.institutionId,
      null
    );

    res.status(201).json(responseMessage);
  } catch (err) {
    console.error('Error in sendMessage:', err);
    res.status(400).json({ success: false, message: 'Fehler beim Senden der Nachricht' });
  }
}

// GET /users/institution - Get all users in the same institution for direct messaging
async function getInstitutionUsers(req, res) {
  const userId = req.user.id;
  const institutionId = req.user.institutionId;

  try {
    const users = await prisma.user.findMany({
      where: {
        institutionId,
        id: { not: userId }
      },
      select: {
        id: true,
        name: true,
        role: true,
        avatarUrl: true,
        children: {
          select: {
            id: true,
            name: true,
            photoUrl: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform users to create separate entries for each child of parents
    const result = [];
    
    for (const user of users) {
      if (user.role === 'PARENT' && user.children && user.children.length > 0) {
        // Create a separate user entry for each child
        for (const child of user.children) {
          result.push({
            id: `${user.id}_${child.id}`, // Unique ID for child-parent combination
            name: `${child.name} (${user.name})`,
            role: 'PARENT',
            avatarUrl: child.photoUrl || user.avatarUrl,
            parentId: user.id,
            childId: child.id,
            childName: child.name,
            parentName: user.name
          });
        }
      } else if (user.role === 'EDUCATOR') {
        // Educators remain as single users
        result.push({
          id: user.id,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl
        });
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Fehler beim Laden der Benutzer' });
  }
}

// Legacy functions for backward compatibility
async function getMessagesByChild(req, res) {
  const { childId } = req.params;
  const user = req.user;
  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: { parents: true, group: { include: { educators: true, institution: true } } }
    });
    if (!child) return res.status(404).json({ error: 'Kind nicht gefunden' });
    
    if (
      user.role !== 'SUPER_ADMIN' &&
      child.group && child.group.institutionId !== user.institutionId
    ) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung (Institution)' });
    }
    
    const isParent = child.parents.some(p => p.id === user.id);
    const isEducator = child.group && child.group.educators.some(e => e.id === user.id);
    if (!(isParent || isEducator || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
    }
    
    const messages = await prisma.message.findMany({
      where: { childId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim Laden der Nachrichten' });
  }
}

async function getMessagesByGroup(req, res) {
  const { groupId } = req.params;
  const user = req.user;
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { educators: true, institution: true }
    });
    if (!group) return res.status(404).json({ error: 'Gruppe nicht gefunden' });
    
    if (
      user.role !== 'SUPER_ADMIN' &&
      group.institutionId !== user.institutionId
    ) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung (Institution)' });
    }
    
    const isEducator = group.educators.some(e => e.id === user.id);
    if (!(isEducator || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
    }
    
    const messages = await prisma.message.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim Laden der Nachrichten' });
  }
}

// POST /messages/:messageId/reactions - Add or remove reaction
async function toggleReaction(req, res) {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user.id;

  try {
    // Validate emoji
    if (!emoji || typeof emoji !== 'string' || emoji.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Gültiges Emoji erforderlich' });
    }

    // Check if message exists and user has access
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        channel: {
          include: {
            institution: true,
            group: true
          }
        },
        directMessage: {
          include: {
            user1: true,
            user2: true
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Nachricht nicht gefunden' });
    }

    // Check permissions (simplified - user must have access to the channel/DM)
    let hasAccess = false;
    if (message.channelId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { groups: true }
      });

      if (message.channel.type === 'GROUP_CHAT') {
        if (message.channel.groupId === null) {
          hasAccess = user.role === 'EDUCATOR' && user.institutionId === message.channel.institutionId;
        } else {
          hasAccess = user.groups.some(g => g.id === message.channel.groupId);
        }
      } else if (message.channel.type === 'INSTITUTION_CHAT') {
        hasAccess = user.institutionId === message.channel.institutionId;
      }
    } else if (message.directMessageId) {
      hasAccess = message.directMessage.user1Id === userId || message.directMessage.user2Id === userId;
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
    }

    // Check if reaction already exists
    const existingReaction = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji: emoji.trim()
        }
      }
    });

    if (existingReaction) {
      // Remove reaction
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id }
      });
      res.json({ success: true, action: 'removed' });
    } else {
      // Add reaction
      await prisma.messageReaction.create({
        data: {
          messageId,
          userId,
          emoji: emoji.trim()
        }
      });
      res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error('Error toggling reaction:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Verarbeiten der Reaktion' });
  }
}

// PUT /messages/:messageId - Edit message
async function editMessage(req, res) {
  const { messageId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Nachricht nicht gefunden' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ success: false, message: 'Nur der Absender kann die Nachricht bearbeiten' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: content ? sanitizeText(content) : '', // Sanitize content to prevent XSS
        isEdited: true,
        editedAt: new Date()
      },
      include: {
        sender: true,
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Group reactions by emoji
    const reactionGroups = {};
    updatedMessage.reactions.forEach(reaction => {
      if (!reactionGroups[reaction.emoji]) {
        reactionGroups[reaction.emoji] = {
          id: reaction.emoji,
          emoji: reaction.emoji,
          count: 0,
          users: [],
          hasReacted: false
        };
      }
      reactionGroups[reaction.emoji].count++;
      reactionGroups[reaction.emoji].users.push(reaction.user.id);
      if (reaction.userId === userId) {
        reactionGroups[reaction.emoji].hasReacted = true;
      }
    });

    const responseMessage = {
      id: updatedMessage.id,
      content: updatedMessage.content || '',
      attachmentUrl: updatedMessage.fileUrl,
      attachmentName: updatedMessage.fileUrl ? updatedMessage.fileUrl.split('/').pop() : null,
      createdAt: updatedMessage.createdAt,
      editedAt: updatedMessage.editedAt,
      isEdited: updatedMessage.isEdited,
      sender: {
        id: updatedMessage.sender.id,
        name: updatedMessage.sender.name,
        role: updatedMessage.sender.role,
        avatarUrl: updatedMessage.sender.avatarUrl
      },
      replyTo: updatedMessage.replyTo ? {
        id: updatedMessage.replyTo.id,
        content: updatedMessage.replyTo.content,
        senderName: updatedMessage.replyTo.sender.name
      } : undefined,
      reactions: Object.values(reactionGroups)
    };

    res.json(responseMessage);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Bearbeiten der Nachricht' });
  }
}

module.exports = { 
  sendMessage, 
  getMessagesByChild, 
  getMessagesByGroup, 
  getUserChannels,
  getChannelMessages,
  getDirectMessages,
  getInstitutionUsers,
  toggleReaction,
  editMessage
}; 