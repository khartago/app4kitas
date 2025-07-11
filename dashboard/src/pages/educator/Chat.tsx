import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useUser } from '../../components/UserContext';
import { 
  getChannels, 
  getChannelMessages, 
  getDirectMessages, 
  getInstitutionUsers, 
  sendMessage,
  toggleReaction,
  Channel, 
  Message as ApiMessage, 
  User
} from '../../services/messagingApi';
import { 
  useDragAndDrop,
  useMentions,
  useTypingIndicator,
  useMessageCache,
  useInfiniteScroll,
  useKeyboardNavigation
} from '../../hooks/useChatEnhancements';
import {
  ChatContainer,
  ChatSidebar,
  ChatMain,
  SidebarHeader,
  SidebarTitle,
  NewChatButton,
  SearchContainer,
  SearchInput,
  ChannelList, 
  ChannelItem, 
  ChannelAvatar,
  ChannelInfo, 
  ChannelName, 
  ChannelLastMessage, 
  ChannelMeta,
  ChannelTime,
  UnreadBadge,
  ChatHeader,
  BackButton,
  MobileOverlay,
  ChatHeaderAvatar,
  ChatHeaderInfo,
  ChatHeaderTitle,
  ChatHeaderSubtitle,
  MessagesContainer,
  MessageGroup,
  MessageContent,
  MessageAvatar,
  MessageBubble,
  MessageSender,
  MessageTime,
  MessageAttachment,
  AttachmentIcon,
  AttachmentInfo,
  AttachmentName,
  AttachmentSize,
  AttachmentType,
  DownloadIcon,
  MessageReactions,
  ReactionButton,
  ReactionEmoji,
  ReactionCount,
  AddReactionButton,
  ReplyPreview,
  ReplyToMessage,
  ReplyAuthor,
  ReplyContent,
  CloseReplyButton,
  TypingIndicator,
  TypingDots,
  TypingDot,
  DropZone,
  DropZoneContent,
  DropZoneIcon,
  MentionDropdown,
  MentionItem,
  MentionAvatar,
  MentionInfo,
  MentionName,
  MentionRole,
  MessageActions,
  MessageActionButton,

  MessageInputContainer,
  MessageInputRow,
  MessageTextArea,
  AttachButton,
  SendButton,
  FileInput,
  FilePreview,
  FilePreviewInfo,
  FileName,
  FileSize,
  RemoveFileButton,
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  NewChatModal,
  NewChatDropdown,
  NewChatHeader,
  NewChatTitle,
  NewChatSearch,
  NewChatUserList,
  NewChatUserItem,
  NewChatUserAvatar,
  NewChatUserInfo,
  NewChatUserName,
  NewChatUserRole,
  NewChatEmpty,
  getChannelIcon,
  formatMessageTime,
  formatLastMessageTime,
  formatFileSize,
  DEFAULT_AVATAR,
  Message,
  MessageReaction
} from '../../components/ui/ChatUI';
import { AnimatedMascotsLoader } from '../../components/ui/LoadingSpinner';
import Header from '../../components/Header';
import { 
  FaPaperPlane, 
  FaFile, 
  FaDownload, 
  FaImage, 
  FaFileAlt,
  FaUsers,
  FaBuilding,
  FaUser,
  FaPlus,
  FaSearch,
  FaComments,
  FaArrowLeft,
  FaTimes,
  FaSmile,
  FaReply,
  FaHeart,
  FaThumbsUp,
  FaLaugh,
  FaChevronDown,
  FaUpload,
  FaKeyboard,
  FaArrowDown
} from 'react-icons/fa';

interface ChatState {
  channels: Channel[];
  activeChannel: Channel | null;
  messages: Message[];
  users: User[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  newMessage: string;
  selectedFile: File | null;
  sidebarOpen: boolean;
  sending: boolean;
  // Enhanced features
  replyingTo: Message | null;
  hasMoreMessages: boolean;
  loadingMore: boolean;
  cursorPosition: number;
  selectedFiles: File[];
  showNewChatDialog: boolean;
  newChatDropdownPosition: { x: number; y: number };
  newChatSearchTerm: string;
  reactionPicker: {
    messageId: string | null;
    position: { x: number; y: number } | null;
  };
  showReactionsFor: string | null;
}

const Chat: React.FC = () => {
  const { benutzer } = useUser();
  const [state, setState] = useState<ChatState>({
    channels: [],
    activeChannel: null,
    messages: [],
    users: [],
    loading: true,
    error: null,
    searchTerm: '',
    newMessage: '',
    selectedFile: null,
    sidebarOpen: true, // Start with sidebar open so users can select chats
    sending: false,
    // Enhanced features
    replyingTo: null,
    hasMoreMessages: true,
    loadingMore: false,
    cursorPosition: 0,
    selectedFiles: [],
    showNewChatDialog: false,
    newChatDropdownPosition: { x: 0, y: 0 },
    newChatSearchTerm: '',
    reactionPicker: { messageId: null, position: null },
    showReactionsFor: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const newChatButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const addReactionButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Enhanced hooks
  const { isDragOver } = useDragAndDrop((files) => {
    setState(prev => ({ ...prev, selectedFiles: Array.from(files).slice(0, 5) }));
  });

  // Get participants for the current chat
  const getChatParticipants = (): User[] => {
    if (!state.activeChannel) return [];
    
    if (state.activeChannel.type === 'DIRECT_MESSAGE') {
      // For direct messages, include only the other user
      return state.users.filter(user => 
        user.id === state.activeChannel?.otherUserId
      );
    } else {
      // For group/institution chats, return all users in the institution
      return state.users.filter(u => u.id !== benutzer?.id);
    }
  };

  const mentions = useMentions(getChatParticipants(), (user) => {
    const currentMessage = state.newMessage;
    const beforeCursor = currentMessage.slice(0, state.cursorPosition);
    const afterCursor = currentMessage.slice(state.cursorPosition);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const beforeMention = beforeCursor.slice(0, mentionMatch.index);
      const newMessage = beforeMention + `@${user.name} ` + afterCursor;
      const newCursorPosition = beforeMention.length + user.name.length + 2;
      
      setState(prev => ({ 
        ...prev, 
        newMessage, 
        cursorPosition: newCursorPosition 
      }));
      
      // Set cursor position in the textarea after state update
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          textAreaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    }
  });

  const { typingUsers, handleTyping } = useTypingIndicator(state.activeChannel?.id || '');
  const { getCachedMessages, setCachedMessages, addMessageToCache } = useMessageCache();
  const { registerElement } = useKeyboardNavigation();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { containerRef: infiniteScrollRef, isFetching } = useInfiniteScroll(
    async () => {
      if (state.activeChannel && state.hasMoreMessages) {
        setState(prev => ({ ...prev, loadingMore: true }));
        // In a real app, load more messages here
        setTimeout(() => {
          setState(prev => ({ ...prev, loadingMore: false }));
        }, 1000);
      }
    },
    state.hasMoreMessages,
    state.loading
  );

  // Simple scroll to bottom function
  const scrollToBottom = useCallback(() => {
    // Use setTimeout to ensure scroll happens after DOM update and only within container
    setTimeout(() => {
      if (infiniteScrollRef.current) {
        infiniteScrollRef.current.scrollTop = infiniteScrollRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [state.messages, scrollToBottom]);

  // Load channels on component mount
  useEffect(() => {
    loadChannels();
    loadUsers();
  }, []);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        // Desktop - always show sidebar
        setState(prev => ({ ...prev, sidebarOpen: true }));
      } else if (!state.activeChannel) {
        // Mobile with no active chat - show sidebar so user can select
        setState(prev => ({ ...prev, sidebarOpen: true }));
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, [state.activeChannel]);

  // Auto-resize textarea
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = 'auto';
      textArea.style.height = Math.min(textArea.scrollHeight, 120) + 'px';
    }
  }, [state.newMessage]);

  // Auto-dismiss error messages after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  const loadChannels = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const channels = await getChannels();
      setState(prev => ({ ...prev, channels, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Fehler beim Laden der Kanäle',
        loading: false 
      }));
    }
  };

  const loadUsers = async () => {
    try {
      const users = await getInstitutionUsers();
      setState(prev => ({ ...prev, users }));
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
    }
  };



  const loadMessages = async (channel: Channel) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Check cache first
      const cachedMessages = getCachedMessages(channel.id);
      if (cachedMessages.length > 0) {
        setState(prev => ({ 
          ...prev, 
          messages: cachedMessages, 
          activeChannel: channel,
          loading: false,
          sidebarOpen: window.innerWidth > 768
        }));
        return;
      }
      
      let apiMessages: ApiMessage[];
      if (channel.type === 'DIRECT_MESSAGE') {
        // For direct messages, use the direct message endpoint
        if (!channel.otherUserId) {
          throw new Error('Keine Benutzer-ID für Direktnachricht');
        }
        const dmData = await getDirectMessages(channel.otherUserId);
        apiMessages = dmData.messages;
      } else {
        // For channel messages (GROUP_CHAT, INSTITUTION_CHAT)
        apiMessages = await getChannelMessages(channel.id);
      }

      // Cache the messages
      setCachedMessages(channel.id, apiMessages);
      
      setState(prev => ({ 
        ...prev, 
        messages: apiMessages, 
        activeChannel: channel,
        loading: false,
        sidebarOpen: window.innerWidth > 768 // Close sidebar on mobile when selecting channel
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Fehler beim Laden der Nachrichten',
        loading: false 
      }));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.activeChannel || (!state.newMessage.trim() && !state.selectedFile && state.selectedFiles.length === 0) || state.sending) {
      return;
    }

    setState(prev => ({ ...prev, sending: true }));

    try {
      const formData = new FormData();
      
      if (state.activeChannel.type === 'DIRECT_MESSAGE') {
        formData.append('directMessageId', state.activeChannel.id);
      } else {
        formData.append('channelId', state.activeChannel.id);
      }
      
      if (state.newMessage.trim()) {
        formData.append('content', state.newMessage.trim());
      }
      
      // Add reply information if replying to a message
      if (state.replyingTo) {
        formData.append('replyToId', state.replyingTo.id);
      }
      
      // Handle file attachment (single file takes priority, then first from multiple files)
      const fileToSend = state.selectedFile || state.selectedFiles[0];
      if (fileToSend) {
        formData.append('file', fileToSend);
      }

      const apiMessage = await sendMessage(formData);
      
      // Add to cache
      if (state.activeChannel) {
        addMessageToCache(state.activeChannel.id, apiMessage);
      }
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, apiMessage],
        newMessage: '',
        selectedFile: null,
        selectedFiles: [],
        replyingTo: null,
        sending: false
      }));

      // Refresh channels to update last message
      loadChannels();

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Fehler beim Senden der Nachricht',
        sending: false 
      }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setState(prev => ({ 
          ...prev, 
          error: 'Datei ist zu groß. Maximum: 10MB' 
        }));
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setState(prev => ({ 
          ...prev, 
          error: 'Dateityp nicht unterstützt. Erlaubt: Bilder, PDF, Word, Text' 
        }));
        return;
      }
      
      setState(prev => ({ ...prev, selectedFile: file, error: null }));
    }
  };

  const handleRemoveFile = () => {
    setState(prev => ({ ...prev, selectedFile: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Handle mention autocomplete first
    if (mentions.handleKeyDown(e.nativeEvent, () => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    })) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Enhanced input handling
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    setState(prev => ({ 
      ...prev, 
      newMessage: value,
      cursorPosition: cursorPos
    }));
    
    // Handle mentions - use the current cursor position directly
    if (textAreaRef.current) {
      mentions.handleTextInput(value, cursorPos, textAreaRef.current);
    }
    
    // Handle typing indicator
    handleTyping();
  };

  // Message reactions
  // Enhanced reaction handling with better UX
  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      // Optimistically update UI first
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => {
          if (msg.id === messageId) {
            const existingReactions = msg.reactions || [];
            const existingReaction = existingReactions.find(r => r.emoji === emoji);
            
            if (existingReaction) {
              // Toggle existing reaction
              const updatedReactions = existingReactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count - 1, hasReacted: !r.hasReacted }
                  : r
              ).filter(r => r.count > 0);
              
              return { ...msg, reactions: updatedReactions };
            } else {
              // Add new reaction
              const newReaction = {
                id: emoji,
                emoji,
                count: 1,
                users: [benutzer?.id || ''],
                hasReacted: true
              };
              
              return { 
                ...msg, 
                reactions: [...existingReactions, newReaction]
              };
            }
          }
          return msg;
        })
      }));
      
      // Then sync with backend
      await toggleReaction(messageId, emoji);
      
      // Reload messages to ensure consistency
      if (state.activeChannel) {
        const apiMessages = state.activeChannel.type === 'DIRECT_MESSAGE' 
          ? (await getDirectMessages(state.activeChannel.otherUserId!)).messages
          : await getChannelMessages(state.activeChannel.id);
        
        setState(prev => ({ ...prev, messages: apiMessages }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Fehler beim Verarbeiten der Reaktion'
      }));
    }
  };

  // Reply functionality
  const handleReply = (message: Message) => {
    setState(prev => ({ ...prev, replyingTo: message }));
    textAreaRef.current?.focus();
  };

  const closeReply = () => {
    setState(prev => ({ ...prev, replyingTo: null }));
  };

  const handleNewChatClick = () => {
    if (newChatButtonRef.current && sidebarRef.current) {
      const btnRect = newChatButtonRef.current.getBoundingClientRect();
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      // Position dropdown below the + button, aligned to its left edge, within the sidebar
      const x = btnRect.left - sidebarRect.left;
      const y = btnRect.bottom - sidebarRect.top + 8; // 8px gap below button
      setState(prev => ({
        ...prev,
        showNewChatDialog: true,
        newChatDropdownPosition: { x, y }
      }));
    }
  };

  const closeNewChatDialog = () => {
    setState(prev => ({
      ...prev,
      showNewChatDialog: false,
      newChatSearchTerm: ''
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (state.showNewChatDialog && newChatButtonRef.current) {
        const target = event.target as Node;
        if (!newChatButtonRef.current.contains(target)) {
          // Check if click is outside the dropdown
          const dropdownElement = document.querySelector('[data-new-chat-dropdown]');
          if (dropdownElement && !dropdownElement.contains(target)) {
            closeNewChatDialog();
          }
        }
      }
    };

    if (state.showNewChatDialog) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [state.showNewChatDialog]);

  const startDirectMessage = async (targetUser: User) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const dmData = await getDirectMessages(targetUser.id);
      
      const dmChannel: Channel = {
        id: dmData.directMessageId,
        name: targetUser.name,
        type: 'DIRECT_MESSAGE',
        otherUserId: targetUser.id,
        otherUserName: targetUser.name,
        otherUserRole: targetUser.role,
        avatarUrl: targetUser.avatarUrl,
        unreadCount: 0
      };

      setState(prev => ({
        ...prev,
        activeChannel: dmChannel,
        messages: dmData.messages,
        loading: false,
        sidebarOpen: window.innerWidth > 768
      }));

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Fehler beim Starten der Direktnachricht',
        loading: false 
      }));
    }
  };

  const filteredChannels = state.channels.filter(channel =>
    channel.name.toLowerCase().includes(state.searchTerm.toLowerCase())
  );

      const filteredUsers = state.users.filter(u => 
    u.id !== benutzer?.id && 
    u.name.toLowerCase().includes(state.searchTerm.toLowerCase())
  );

  const renderChannelIcon = (channel: Channel) => {
    const IconComponent = getChannelIcon(channel.type);
    return <IconComponent />;
  };

  const getFileTypeInfo = (fileName?: string) => {
    if (!fileName) return { type: 'Dokument', icon: FaFile };
    
    const ext = fileName.toLowerCase().split('.').pop();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) {
      return { type: 'Bild', icon: FaImage };
    }
    
    if (['pdf'].includes(ext || '')) {
      return { type: 'PDF', icon: FaFileAlt };
    }
    
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext || '')) {
      return { type: 'Dokument', icon: FaFileAlt };
    }
    
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
      return { type: 'Tabelle', icon: FaFileAlt };
    }
    
    if (['ppt', 'pptx'].includes(ext || '')) {
      return { type: 'Präsentation', icon: FaFileAlt };
    }
    
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
      return { type: 'Archiv', icon: FaFile };
    }
    
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext || '')) {
      return { type: 'Audio', icon: FaFile };
    }
    
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext || '')) {
      return { type: 'Video', icon: FaFile };
    }
    
    return { type: 'Datei', icon: FaFile };
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.sender.id === benutzer?.id;
    const showAvatar = !isOwn && (index === 0 || state.messages[index - 1]?.sender.id !== message.sender.id);
    const showSender = !isOwn && (index === 0 || state.messages[index - 1]?.sender.id !== message.sender.id);
    const isTouch = typeof window !== 'undefined' && window.innerWidth <= 900;
    const showReactions = state.showReactionsFor === message.id;

    return (
      <MessageGroup $isOwn={isOwn} key={message.id} className={`message-group${showReactions ? ' show-reactions' : ''}`}
        onClick={e => {
          if (isTouch) {
            setState(prev => ({ ...prev, showReactionsFor: prev.showReactionsFor === message.id ? null : message.id }));
            e.stopPropagation();
          }
        }}
        tabIndex={0}
        style={{ position: 'relative' }}
      >
        {showAvatar && (
          <MessageAvatar $avatarUrl={message.sender.avatarUrl || DEFAULT_AVATAR} />
        )}
        {!showAvatar && !isOwn && (
          <div style={{ width: '32px' }} />
        )}
        <MessageContent $isOwn={isOwn}>
          {showSender && !isOwn && (
            <MessageSender>{message.sender.name}</MessageSender>
          )}
          {/* Reply preview */}
          {message.replyTo && (
            <ReplyToMessage>
              <ReplyAuthor>{message.replyTo.senderName}</ReplyAuthor>
              <ReplyContent>{message.replyTo.content}</ReplyContent>
            </ReplyToMessage>
          )}
          {/* Only show message bubble if there's content */}
          {message.content && (
            <MessageBubble $isOwn={isOwn}>
              {message.content}
            </MessageBubble>
          )}
          {/* File attachment */}
          {message.attachmentUrl && (
            <MessageAttachment
              as="a"
              href={`http://localhost:4000${message.attachmentUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
            >
              <AttachmentIcon>
                {React.createElement(getFileTypeInfo(message.attachmentName).icon)}
              </AttachmentIcon>
              <AttachmentInfo>
                <AttachmentName>
                  {message.attachmentName || 'Datei'}
                </AttachmentName>
                <AttachmentType>
                  {getFileTypeInfo(message.attachmentName).type}
                </AttachmentType>
              </AttachmentInfo>
              <DownloadIcon>
                <FaDownload />
              </DownloadIcon>
            </MessageAttachment>
          )}
          {/* Message reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <MessageReactions>
              {message.reactions.map((reaction: MessageReaction, reactionIndex: number) => (
                <ReactionButton
                  key={`${reaction.emoji}-${reactionIndex}`}
                  $hasReacted={reaction.hasReacted}
                  onClick={() => handleReaction(message.id, reaction.emoji)}
                >
                  <ReactionEmoji>{reaction.emoji}</ReactionEmoji>
                  <ReactionCount>{reaction.count}</ReactionCount>
                </ReactionButton>
              ))}
              <AddReactionButton
                ref={el => addReactionButtonRefs.current[message.id] = el}
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setState(prev => ({
                    ...prev,
                    reactionPicker: {
                      messageId: message.id,
                      position: { x: rect.left, y: rect.bottom }
                    }
                  }));
                }}
              >
                <FaPlus />
              </AddReactionButton>
            </MessageReactions>
          )}
          {/* Message time and edit indicator */}
          <MessageTime>
            {formatMessageTime(message.createdAt)}
            {message.isEdited && <span style={{ marginLeft: '8px', fontStyle: 'italic' }}>(bearbeitet)</span>}
          </MessageTime>
        </MessageContent>
        {/* Message actions */}
        <MessageActions $isOwn={isOwn} className="message-actions">
          <MessageActionButton
            onClick={() => handleReaction(message.id, '👍')}
            title="Daumen hoch"
            $active={message.reactions?.some(r => r.emoji === '👍' && r.hasReacted)}
          >
            <FaThumbsUp />
          </MessageActionButton>
          <MessageActionButton
            onClick={() => handleReaction(message.id, '❤️')}
            title="Herz"
            $active={message.reactions?.some(r => r.emoji === '❤️' && r.hasReacted)}
          >
            <FaHeart />
          </MessageActionButton>
          <MessageActionButton
            onClick={() => handleReaction(message.id, '😄')}
            title="Lachen"
            $active={message.reactions?.some(r => r.emoji === '😄' && r.hasReacted)}
          >
            <FaSmile />
          </MessageActionButton>
          <MessageActionButton
            onClick={() => handleReply(message)}
            title="Antworten"
          >
            <FaReply />
          </MessageActionButton>
        </MessageActions>
        {/* Reaction picker (if open for this message) */}
        {state.reactionPicker.messageId === message.id && state.reactionPicker.position && (
          <div
            style={{
              position: 'absolute',
              left: isOwn ? 'auto' : '0',
              right: isOwn ? '0' : 'auto',
              top: '100%',
              marginTop: '4px',
              zIndex: 10,
              background: '#232B36',
              borderRadius: 16,
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              padding: '8px 12px',
              display: 'flex',
              gap: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              minWidth: 'fit-content'
            }}
          >
            {['👍','❤️','😄','🎉','😢','😮'].map(emoji => (
              <button
                key={emoji}
                style={{ 
                  fontSize: 20, 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: 'white',
                  padding: '4px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  height: '32px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={() => {
                  handleReaction(message.id, emoji);
                  setState(prev => ({ ...prev, reactionPicker: { messageId: null, position: null } }));
                }}
              >{emoji}</button>
            ))}
          </div>
        )}
      </MessageGroup>
    );
  };

  if (state.loading && !state.activeChannel) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedMascotsLoader />
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <Header title="Chat" />
      <ChatContainer data-chat-container>
          {/* Sidebar */}
        <ChatSidebar ref={sidebarRef} $isOpen={state.sidebarOpen}>
            <SidebarHeader>
              <SidebarTitle>
              Nachrichten
              <NewChatButton ref={newChatButtonRef} onClick={handleNewChatClick}>
                <FaPlus />
              </NewChatButton>
            </SidebarTitle>
            </SidebarHeader>
            
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Kanäle und Personen suchen..."
              value={state.searchTerm}
              onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
            />
          </SearchContainer>

              <ChannelList>
            {/* Channels */}
            {filteredChannels.map((channel) => (
                    <ChannelItem
                      key={channel.id}
                $active={state.activeChannel?.id === channel.id}
                onClick={() => loadMessages(channel)}
              >
                <ChannelAvatar $type={channel.type} $avatarUrl={channel.avatarUrl}>
                  {!channel.avatarUrl && channel.type !== 'DIRECT_MESSAGE' && renderChannelIcon(channel)}
                </ChannelAvatar>
                      <ChannelInfo>
                  <ChannelName $hasUnread={channel.unreadCount > 0}>{channel.name}</ChannelName>
                  <ChannelLastMessage $hasUnread={channel.unreadCount > 0}>
                    {channel.lastMessage?.content || 'Keine Nachrichten'}
                        </ChannelLastMessage>
                      </ChannelInfo>
                <ChannelMeta>
                      {channel.lastMessage && (
                        <ChannelTime>
                      {formatLastMessageTime(channel.lastMessage.createdAt)}
                        </ChannelTime>
                      )}
                  {channel.unreadCount > 0 && (
                    <UnreadBadge>{channel.unreadCount}</UnreadBadge>
                  )}
                </ChannelMeta>
                    </ChannelItem>
            ))}

            {/* Direct Message Users - only show when searching */}
            {state.searchTerm && filteredUsers.map((targetUser) => (
              <ChannelItem
                key={`user-${targetUser.id}`}
                onClick={() => {
                  startDirectMessage(targetUser);
                }}
              >
                <ChannelAvatar $type="DIRECT_MESSAGE" $avatarUrl={targetUser.avatarUrl}>
                </ChannelAvatar>
                <ChannelInfo>
                  <ChannelName>{targetUser.name}</ChannelName>
                  <ChannelLastMessage>
                    {targetUser.role === 'PARENT' ? 'Elternteil' : 'Erzieher'}
                  </ChannelLastMessage>
                </ChannelInfo>
              </ChannelItem>
            ))}
              </ChannelList>
        </ChatSidebar>

        {/* Main Chat Area */}
        <ChatMain style={{ position: 'relative' }}>
          {/* Drag & Drop Overlay */}
          <DropZone $isDragOver={isDragOver}>
            <DropZoneContent>
              <DropZoneIcon>
                <FaUpload />
              </DropZoneIcon>
              <div>
                <strong>Dateien hier ablegen</strong>
                <div style={{ marginTop: '8px', fontSize: '14px', opacity: 0.8 }}>
                  Unterstützt: Bilder, PDF, Dokumente (max. 10MB pro Datei)
                </div>
              </div>
            </DropZoneContent>
          </DropZone>
          {state.activeChannel ? (
            <>
              {/* Chat Header */}
                <ChatHeader>
                <BackButton onClick={() => setState(prev => ({ ...prev, sidebarOpen: true }))}>
                  <FaArrowLeft />
                </BackButton>
                <ChatHeaderAvatar $type={state.activeChannel.type} $avatarUrl={state.activeChannel.avatarUrl}>
                  {!state.activeChannel.avatarUrl && state.activeChannel.type !== 'DIRECT_MESSAGE' && renderChannelIcon(state.activeChannel)}
                </ChatHeaderAvatar>
                <ChatHeaderInfo>
                  <ChatHeaderTitle>{state.activeChannel.name}</ChatHeaderTitle>
                  <ChatHeaderSubtitle>
                    {state.activeChannel.type === 'GROUP_CHAT' && 'Gruppenchat'}
                    {state.activeChannel.type === 'INSTITUTION_CHAT' && 'Einrichtungschat'}
                    {state.activeChannel.type === 'DIRECT_MESSAGE' && 'Direktnachricht'}
                  </ChatHeaderSubtitle>
                </ChatHeaderInfo>
              </ChatHeader>

              {/* Messages */}
              <MessagesContainer ref={infiniteScrollRef}>
                {/* Loading more messages indicator */}
                {state.loadingMore && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                    <AnimatedMascotsLoader />
                  </div>
                )}

                {state.loading && !state.messages.length ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <AnimatedMascotsLoader />
                  </div>
                ) : state.messages.length > 0 ? (
                  state.messages.map(renderMessage)
                ) : (
                  <EmptyState>
                    <EmptyStateIcon>
                      <FaComments />
                    </EmptyStateIcon>
                    <EmptyStateTitle>Noch keine Nachrichten</EmptyStateTitle>
                    <EmptyStateDescription>
                      Schreibe die erste Nachricht in diesem Chat!
                    </EmptyStateDescription>
                  </EmptyState>
                )}

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <TypingIndicator>
                    <TypingDots>
                      <TypingDot $delay={0} />
                      <TypingDot $delay={0.2} />
                      <TypingDot $delay={0.4} />
                    </TypingDots>
                    {typingUsers.length === 1 
                      ? `${typingUsers[0].name} schreibt...`
                      : `${typingUsers.length} Personen schreiben...`
                    }
                  </TypingIndicator>
                )}

                <div ref={messagesEndRef} />
              </MessagesContainer>

              {/* Message Input */}
              <MessageInputContainer>
                {/* Reply preview */}
                {state.replyingTo && (
                  <ReplyPreview>
                    <div style={{ flex: 1 }}>
                      <ReplyAuthor>Antwort an {state.replyingTo.sender.name}</ReplyAuthor>
                      <ReplyContent>{state.replyingTo.content}</ReplyContent>
                  </div>
                    <CloseReplyButton onClick={closeReply}>
                      <FaTimes />
                    </CloseReplyButton>
                  </ReplyPreview>
                )}

                {/* Selected files preview */}
                {state.selectedFiles.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {state.selectedFiles.map((file, index) => (
                      <FilePreview key={index}>
                        <AttachmentIcon>
                          {React.createElement(getFileTypeInfo(file.name).icon)}
                        </AttachmentIcon>
                        <FilePreviewInfo>
                          <FileName>{file.name}</FileName>
                          <FileSize>
                            {formatFileSize(file.size)} • {getFileTypeInfo(file.name).type}
                          </FileSize>
                        </FilePreviewInfo>
                        <RemoveFileButton onClick={() => {
                          setState(prev => ({
                            ...prev,
                            selectedFiles: prev.selectedFiles.filter((_, i) => i !== index)
                          }));
                        }}>
                          <FaTimes />
                        </RemoveFileButton>
                      </FilePreview>
                    ))}
                  </div>
                )}

                {/* Legacy single file support */}
                {state.selectedFile && state.selectedFiles.length === 0 && (
                  <FilePreview>
                                <AttachmentIcon>
                      {React.createElement(getFileTypeInfo(state.selectedFile.name).icon)}
                                </AttachmentIcon>
                    <FilePreviewInfo>
                      <FileName>{state.selectedFile.name}</FileName>
                      <FileSize>
                        {formatFileSize(state.selectedFile.size)} • {getFileTypeInfo(state.selectedFile.name).type}
                      </FileSize>
                    </FilePreviewInfo>
                    <RemoveFileButton onClick={handleRemoveFile}>
                      <FaTimes />
                    </RemoveFileButton>
                  </FilePreview>
                )}

                <form onSubmit={handleSendMessage}>
                  <MessageInputRow>
                    <AttachButton 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      title="Datei anhängen"
                    >
                    <FaFile />
                    </AttachButton>
                    
                    <div style={{ position: 'relative', flex: 1 }}>
                      <MessageTextArea
                        ref={textAreaRef}
                        value={state.newMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        placeholder={
                          state.replyingTo 
                            ? `Antwort an ${state.replyingTo.sender.name}...`
                            : "Nachricht schreiben... (@Benutzername für Erwähnungen)"
                        }
                        disabled={state.sending}
                    rows={1}
                  />
                      
                      {/* Mention autocomplete dropdown */}
                      {mentions.showMentions && mentions.mentionPosition && (
                        <MentionDropdown $position={{
                          x: mentions.mentionPosition.left,
                          y: mentions.mentionPosition.top
                        }}>
                          {mentions.filteredUsers.map((user, index) => (
                            <MentionItem
                              key={user.id}
                              $selected={index === mentions.selectedMentionIndex}
                              onClick={() => mentions.selectMention(user)}
                            >
                              <MentionAvatar $avatarUrl={user.avatarUrl} />
                              <MentionInfo>
                                <MentionName>{user.name}</MentionName>
                                <MentionRole>
                                  {user.role === 'PARENT' ? 'Elternteil' : 'Erzieher'}
                                </MentionRole>
                              </MentionInfo>
                            </MentionItem>
                          ))}
                        </MentionDropdown>
                      )}
                    </div>
                    
                    <SendButton 
                      type="submit" 
                      $disabled={(!state.newMessage.trim() && !state.selectedFile && state.selectedFiles.length === 0) || state.sending}
                      disabled={(!state.newMessage.trim() && !state.selectedFile && state.selectedFiles.length === 0) || state.sending}
                      title="Nachricht senden"
                    >
                    <FaPaperPlane />
                    </SendButton>
                  </MessageInputRow>
                </form>

                <FileInput
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  multiple
                />
              </MessageInputContainer>
              </>
            ) : (
            <EmptyState>
              <EmptyStateIcon>
                  <FaComments />
              </EmptyStateIcon>
              <EmptyStateTitle>Wähle einen Chat aus</EmptyStateTitle>
              <EmptyStateDescription>
                {window.innerWidth <= 768 
                  ? "Tippe auf das Menü-Symbol oben links, um deine Chats zu sehen."
                  : "Wähle einen Kanal oder starte eine neue Direktnachricht, um zu beginnen."
                }
              </EmptyStateDescription>
            </EmptyState>
          )}
        </ChatMain>

        {/* Mobile Overlay */}
        <MobileOverlay 
          $isOpen={state.sidebarOpen}
          onClick={() => setState(prev => ({ ...prev, sidebarOpen: false }))}
        />

        {/* New Chat Dropdown */}
        <NewChatDropdown 
          $isOpen={state.showNewChatDialog}
          $position={state.newChatDropdownPosition}
          data-new-chat-dropdown
        >
          <NewChatHeader>
            <NewChatTitle>Neue Nachricht</NewChatTitle>
            <NewChatSearch
              type="text"
              placeholder="Personen suchen..."
              value={state.newChatSearchTerm}
              onChange={(e) => setState(prev => ({ ...prev, newChatSearchTerm: e.target.value }))}
              autoFocus
            />
          </NewChatHeader>
          <NewChatUserList>
            {state.users
              .filter(user => 
                user.id !== benutzer?.id && 
                user.name.toLowerCase().includes(state.newChatSearchTerm.toLowerCase())
              )
              .map((user) => (
                <NewChatUserItem
                  key={user.id}
                  onClick={() => {
                    startDirectMessage(user);
                    closeNewChatDialog();
                  }}
                >
                  <NewChatUserAvatar $avatarUrl={user.avatarUrl} />
                  <NewChatUserInfo>
                    <NewChatUserName>{user.name}</NewChatUserName>
                    <NewChatUserRole>
                      {user.role === 'PARENT' ? 'Elternteil' : 'Erzieher'}
                    </NewChatUserRole>
                  </NewChatUserInfo>
                </NewChatUserItem>
              ))}
            {state.users.filter(user => 
              user.id !== benutzer?.id && 
              user.name.toLowerCase().includes(state.newChatSearchTerm.toLowerCase())
            ).length === 0 && (
              <NewChatEmpty>
                {state.newChatSearchTerm ? 'Keine Personen gefunden' : 'Keine Personen verfügbar'}
              </NewChatEmpty>
            )}
          </NewChatUserList>
        </NewChatDropdown>
      </ChatContainer>

      {/* Error notification */}
      {state.error && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#f44336',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          maxWidth: '300px',
          cursor: 'pointer'
        }}
        onClick={() => setState(prev => ({ ...prev, error: null }))}
        >
          {state.error}
          <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
            Klicken zum Schließen
          </div>
        </div>
      )}


    </div>
  );
};

export default Chat; 