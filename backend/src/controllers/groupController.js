const prisma = require('../models/prismaClient');
const { logActivity } = require('./activityController');

// GET /groups/:id
async function getGroup(req, res) {
  const { id } = req.params;
  const user = req.user;
  try {
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        children: { include: { parents: true } },
        educators: true,
        institution: true,
      },
    });
    if (!group) return res.status(404).json({ error: 'Gruppe nicht gefunden' });
    // Access: educator in group, admin, super_admin, or parent of a child in group
    const isEducator = group.educators.some(e => e.id === user.id);
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const isParent = group.children.some(child => child.parents.some(p => p.id === user.id));
    // Institution check for admin/educator
    if (
      user.role !== 'SUPER_ADMIN' &&
      group.institutionId !== user.institutionId
    ) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    if (!(isEducator || isAdmin || isParent)) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Laden der Gruppe' });
  }
}

// POST /groups (Admin only)
async function createGroup(req, res) {
  const user = req.user;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Admin kann Gruppen anlegen' });
  }
  const { name, educatorIds } = req.body;
  if (!name) return res.status(400).json({ error: 'Name erforderlich' });
  try {
    // Only allow educators from same institution
    let connectEducators = undefined;
    if (educatorIds && educatorIds.length) {
      const validEducators = await prisma.user.findMany({
        where: {
          id: { in: educatorIds },
          role: 'EDUCATOR',
          institutionId: user.institutionId,
        },
      });
      connectEducators = { connect: validEducators.map(e => ({ id: e.id })) };
    }
    const group = await prisma.group.create({
      data: {
        name,
        institutionId: user.institutionId, // Always set from token
        educators: connectEducators,
      },
    });
    // Create group chat channel
    await prisma.chatChannel.create({
      data: {
        name: `${name} Chat`,
        type: 'GROUP_CHAT',
        institutionId: user.institutionId,
        groupId: group.id,
        participants: {
          connect: [
            ...(await prisma.user.findMany({ where: { groups: { some: { id: group.id } } } })).map(u => ({ id: u.id })),
            ...(await prisma.user.findMany({ where: { role: 'ADMIN', institutionId: user.institutionId } })).map(u => ({ id: u.id }))
          ]
        }
      }
    });
    // Log activity
    await logActivity(
      user.id,
      'GROUP_CREATED',
      'Group',
      group.id,
      `Created group: ${name}`,
      user.institutionId || null,
      group.id
    );
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Anlegen der Gruppe' });
  }
}

// PUT /groups/:id (Admin only)
async function updateGroup(req, res) {
  const user = req.user;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Admin kann Gruppen bearbeiten' });
  }
  const { id } = req.params;
  const { name, educatorIds } = req.body;
  
  try {
    // Check if group exists and user has permission
    const existingGroup = await prisma.group.findUnique({
      where: { id }
    });
    
    if (!existingGroup) {
      return res.status(404).json({ error: 'Gruppe nicht gefunden' });
    }
    
    if (user.role !== 'SUPER_ADMIN' && existingGroup.institutionId !== user.institutionId) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    
    // Only allow educators from same institution
    let connectEducators = undefined;
    if (educatorIds && educatorIds.length) {
      const validEducators = await prisma.user.findMany({
        where: {
          id: { in: educatorIds },
          role: 'EDUCATOR',
          institutionId: user.institutionId,
        },
      });
      connectEducators = { set: validEducators.map(e => ({ id: e.id })) };
    }
    
    const group = await prisma.group.update({
      where: { id },
      data: {
        name: name || undefined,
        educators: connectEducators,
      },
      include: {
        educators: true,
        children: true
      }
    });
    
    // Log activity
    await logActivity(
      user.id,
      'GROUP_UPDATED',
      'Group',
      group.id,
      `Updated group: ${group.name}`,
      user.institutionId || null,
      group.id
    );
    
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Bearbeiten der Gruppe' });
  }
}

// DELETE /groups/:id (Admin only)
async function deleteGroup(req, res) {
  const user = req.user;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Admin kann Gruppen löschen' });
  }
  const { id } = req.params;
  try {
    // Check if group exists and user has permission
    const existingGroup = await prisma.group.findUnique({
      where: { id },
      include: { children: true }
    });
    if (!existingGroup) {
      return res.status(404).json({ error: 'Gruppe nicht gefunden' });
    }
    if (user.role !== 'SUPER_ADMIN' && existingGroup.institutionId !== user.institutionId) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    // Check if group has children
    if (existingGroup.children && existingGroup.children.length > 0) {
      return res.status(400).json({ error: 'Gruppe kann nicht gelöscht werden, da sie noch Kinder enthält' });
    }
    // Delete group chat channel
    await prisma.chatChannel.deleteMany({ where: { groupId: id } });
    await prisma.group.delete({
      where: { id }
    });
    // Log activity
    await logActivity(
      user.id,
      'GROUP_DELETED',
      'Group',
      id,
      `Deleted group: ${existingGroup.name}`,
      user.institutionId || null,
      existingGroup.id
    );
    res.json({ message: 'Gruppe erfolgreich gelöscht' });
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Löschen der Gruppe' });
  }
}

// PUT /groups/:id/educators (Admin only)
async function assignEducators(req, res) {
  const user = req.user;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Admin kann Erzieher zuweisen' });
  }
  const { id } = req.params;
  const { educatorIds } = req.body;
  
  try {
    // Check if group exists and user has permission
    const existingGroup = await prisma.group.findUnique({
      where: { id }
    });
    
    if (!existingGroup) {
      return res.status(404).json({ error: 'Gruppe nicht gefunden' });
    }
    
    if (user.role !== 'SUPER_ADMIN' && existingGroup.institutionId !== user.institutionId) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    
    // Only allow educators from same institution
    let connectEducators = undefined;
    if (educatorIds && educatorIds.length) {
      const validEducators = await prisma.user.findMany({
        where: {
          id: { in: educatorIds },
          role: 'EDUCATOR',
          institutionId: user.institutionId,
        },
      });
      connectEducators = { set: validEducators.map(e => ({ id: e.id })) };
    } else {
      connectEducators = { set: [] };
    }
    
    const group = await prisma.group.update({
      where: { id },
      data: {
        educators: connectEducators,
      },
      include: {
        educators: true
      }
    });
    
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Zuweisen der Erzieher' });
  }
}

// GET /educators/:educatorId/groups - Get educator's assigned groups
async function getEducatorGroups(req, res) {
  const { educatorId } = req.params;
  const user = req.user;
  
  try {
    // Check if user is requesting their own groups or has admin access
    if (user.id !== educatorId && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    
    const groups = await prisma.group.findMany({
      where: {
        educators: {
          some: {
            id: educatorId
          }
        }
      },
      include: {
        children: {
          include: {
            parents: true
          }
        },
        educators: true,
        institution: true
      }
    });
    
    if (!groups || groups.length === 0) {
      return res.status(404).json({ error: 'Keine Gruppen für diesen Erzieher gefunden' });
    }
    
    // Calculate age for each child
    const groupsWithAge = groups.map(group => ({
      ...group,
      children: group.children.map(child => ({
        ...child,
        age: calculateAge(child.birthdate)
      }))
    }));
    
    // Institution check for admin
    if (user.role !== 'SUPER_ADMIN') {
      const validGroups = groupsWithAge.filter(group => group.institutionId === user.institutionId);
      if (validGroups.length === 0) {
        return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
      }
      return res.json(validGroups);
    }
    
    res.json(groupsWithAge);
  } catch (err) {
    console.error('Error getting educator groups:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Gruppen' });
  }
}

// GET /groups/:groupId/children - Get children in a group
async function getGroupChildren(req, res) {
  const { groupId } = req.params;
  const user = req.user;
  
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        children: {
          include: {
            parents: true
          }
        },
        educators: true
      }
    });
    
    if (!group) {
      return res.status(404).json({ error: 'Gruppe nicht gefunden' });
    }
    
    // Check if user is educator in this group or has admin access
    const isEducator = group.educators.some(e => e.id === user.id);
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    
    if (!isEducator && !isAdmin) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    
    // Institution check for admin
    if (user.role !== 'SUPER_ADMIN' && group.institutionId !== user.institutionId) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    
    // Calculate age for each child
    const childrenWithAge = group.children.map(child => ({
      ...child,
      age: calculateAge(child.birthdate)
    }));
    
    res.json(childrenWithAge);
  } catch (err) {
    console.error('Error getting group children:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Kinder' });
  }
}

// GET /groups/:groupId/children?date=heute - Get today's children
async function getTodaysChildren(req, res) {
  const { groupId } = req.params;
  const { date } = req.query;
  const user = req.user;
  
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        children: {
          include: {
            parents: true
          }
        },
        educators: true
      }
    });
    
    if (!group) {
      return res.status(404).json({ error: 'Gruppe nicht gefunden' });
    }
    
    // Check if user is educator in this group or has admin access
    const isEducator = group.educators.some(e => e.id === user.id);
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    
    if (!isEducator && !isAdmin) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    
    // Institution check for admin
    if (user.role !== 'SUPER_ADMIN' && group.institutionId !== user.institutionId) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    
    // For now, return all children. In a real app, you'd filter by attendance
    const children = group.children.map(child => ({
      id: child.id,
      name: child.name,
      age: calculateAge(child.birthdate),
      checkedIn: false, // This would be determined by check-in status
      lastCheckin: null,
      lastCheckout: null
    }));
    
    res.json(children);
  } catch (err) {
    console.error('Error getting today\'s children:', err);
    res.status(500).json({ error: 'Fehler beim Laden der heutigen Kinder' });
  }
}

// Helper function to calculate age
function calculateAge(birthdate) {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

module.exports = { 
  getGroup, 
  createGroup, 
  updateGroup, 
  deleteGroup, 
  assignEducators,
  getEducatorGroups,
  getGroupChildren,
  getTodaysChildren
}; 