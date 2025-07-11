import React from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaFile, FaDownload, FaUsers, FaUser, FaBuilding, FaClock, FaPlus, FaSearch } from 'react-icons/fa';

// Default avatar for fallback
export const DEFAULT_AVATAR = '/avatar-default.png';

// Types
export interface Channel {
  id: string;
  name: string;
  type: 'GROUP_CHAT' | 'INSTITUTION_CHAT' | 'DIRECT_MESSAGE';
  otherUserId?: string;
  otherUserName?: string;
  otherUserRole?: string;
  avatarUrl?: string;
  lastMessage?: BaseMessage;
  unreadCount: number;
  memberCount?: number;
}

export interface MessageReaction {
  id: string;
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

// Base message interface from API
export interface BaseMessage {
  id: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
}

// Extended message interface for UI with enhanced features
export interface Message extends BaseMessage {
  editedAt?: string;
  isEdited?: boolean;
  reactions?: MessageReaction[];
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
}

export interface User {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  parentId?: string;
  childId?: string;
  childName?: string;
  parentName?: string;
}

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export const ChatContainer = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  height: calc(100vh - 56px - 16px); /* Subtract header height and margins */
  background: ${({ theme }) => theme.colors.background};
  max-width: 100vw;
  overflow: hidden;
  position: relative;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  margin: 8px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: calc(100vh - 48px - 8px); /* Smaller header on mobile */
    margin: 4px;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    height: calc(100vh - 40px - 4px); /* Even smaller header on small phones */
    margin: 2px;
    border-radius: 8px;
  }
`;

export const ChatSidebar = styled.div<{ $isOpen?: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border-right: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 16px 0 0 16px;
  min-height: 0; /* Important for flex child */
  
  @media (max-width: 768px) {
    display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }
`;

export const ChatMain = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  position: relative;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 0 16px 16px 0;
  min-height: 0; /* Important for flex child */
  overflow: hidden;

  @media (max-width: 768px) {
    border-radius: 0;
  }
`;

// ============================================================================
// SIDEBAR COMPONENTS
// ============================================================================

export const SidebarHeader = styled.div`
  padding: 16px 20px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
  border-radius: 16px 0 0 0;

  @media (max-width: 768px) {
    padding: 12px 16px;
    border-radius: 0;
  }
`;

export const SidebarTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.headline4.fontSize};
  font-weight: ${({ theme }) => theme.typography.headline4.fontWeight};
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.body1.fontSize};
  }
`;

export const NewChatButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  flex-shrink: 0;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

export const SearchContainer = styled.div`
  padding: 12px 20px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 8px 16px;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  max-width: 100%;
  padding: 10px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  outline: none;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  box-sizing: border-box;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: ${({ theme }) => theme.typography.caption.fontSize};
  }
`;

export const ChannelList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  border-radius: 0 0 0 16px;
  min-height: 0; /* Important for flex child */

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textSecondary};
  }

  @media (max-width: 768px) {
    border-radius: 0;
  }
`;

// ============================================================================
// CHANNEL COMPONENTS
// ============================================================================

export const ChannelItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '10' : 'transparent'};
  border-left: 3px solid ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  position: relative;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt || theme.colors.primary + '08'};
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    gap: 10px;
  }
`;

export const ChannelAvatar = styled.div<{ $type: string; $avatarUrl?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $type, $avatarUrl, theme }) => {
    if ($avatarUrl) return `url(${$avatarUrl}) center/cover`;
    if ($type === 'DIRECT_MESSAGE') return `url(${DEFAULT_AVATAR}) center/cover`;
    switch ($type) {
      case 'GROUP_CHAT':
        return theme.colors.primary + '15';
      case 'INSTITUTION_CHAT':
        return theme.colors.accent + '15';
      default:
        return theme.colors.surfaceAlt || theme.colors.primary + '10';
    }
  }};
  color: ${({ $type, $avatarUrl, theme }) => {
    if ($avatarUrl || $type === 'DIRECT_MESSAGE') return 'transparent';
    switch ($type) {
      case 'GROUP_CHAT':
        return theme.colors.primary;
      case 'INSTITUTION_CHAT':
        return theme.colors.accent;
      default:
        return theme.colors.textSecondary;
    }
  }};
  font-size: 18px;
  flex-shrink: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
`;

export const ChannelInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ChannelName = styled.div<{ $hasUnread?: boolean }>`
  font-weight: ${({ $hasUnread }) => $hasUnread ? 700 : 600};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ChannelLastMessage = styled.div<{ $hasUnread?: boolean }>`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ $hasUnread }) => $hasUnread ? 600 : 400};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ChannelMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
`;

export const ChannelTime = styled.div`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

export const UnreadBadge = styled.div`
  min-width: 20px;
  height: 20px;
  background: ${({ theme }) => theme.colors.error};
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
`;

// ============================================================================
// CHAT HEADER COMPONENTS
// ============================================================================

export const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.surface};
  min-height: 56px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
  border-radius: 0 16px 0 0;

  @media (max-width: 768px) {
    padding: 10px 12px;
    min-height: 48px;
    gap: 10px;
    border-radius: 0;
  }
`;

export const BackButton = styled.button`
  display: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt || theme.colors.primary + '10'};
  }

  @media (max-width: 768px) {
    display: flex;
    width: 32px;
    height: 32px;
  }
`;

export const MobileMenuButton = styled.button`
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 100;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt || theme.colors.primary + '10'};
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

export const MobileOverlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  
  @media (max-width: 768px) {
    display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  }
`;

export const ChatHeaderAvatar = styled.div<{ $type: string; $avatarUrl?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $type, $avatarUrl, theme }) => {
    if ($avatarUrl) return `url(${$avatarUrl}) center/cover`;
    if ($type === 'DIRECT_MESSAGE') return `url(${DEFAULT_AVATAR}) center/cover`;
    switch ($type) {
      case 'GROUP_CHAT':
        return theme.colors.primary + '15';
      case 'INSTITUTION_CHAT':
        return theme.colors.accent + '15';
      default:
        return theme.colors.surfaceAlt || theme.colors.primary + '10';
    }
  }};
  color: ${({ $type, $avatarUrl, theme }) => {
    if ($avatarUrl || $type === 'DIRECT_MESSAGE') return 'transparent';
    switch ($type) {
      case 'GROUP_CHAT':
        return theme.colors.primary;
      case 'INSTITUTION_CHAT':
        return theme.colors.accent;
      default:
        return theme.colors.textSecondary;
    }
  }};
  font-size: 18px;
  overflow: hidden;
`;

export const ChatHeaderInfo = styled.div`
  flex: 1;
`;

export const ChatHeaderTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.headline4.fontSize};
  font-weight: ${({ theme }) => theme.typography.headline4.fontWeight};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 1px;
`;

export const ChatHeaderSubtitle = styled.div`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// ============================================================================
// MESSAGE COMPONENTS
// ============================================================================

export const MessagesContainer = styled.div`
  flex: 1;
  padding: 16px 24px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 0 0 0 16px;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textSecondary};
  }

  @media (max-width: 768px) {
    padding: 12px 20px;
    gap: 12px;
    border-radius: 0;
  }
`;

export const MessageGroup = styled.div<{ $isOwn: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 10px;
  max-width: 100%;
  align-self: ${({ $isOwn }) => $isOwn ? 'flex-end' : 'flex-start'};
  margin-bottom: 16px;
  position: relative;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;

  &.show-reactions ${/* sc-selector */'~ div'} {
    opacity: 1 !important;
    pointer-events: auto !important;
  }

  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 12px;
  }

  &:hover .message-actions,
  &:focus-within .message-actions {
    opacity: 1;
    pointer-events: auto;
  }
`;

export const MessageContent = styled.div<{ $isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isOwn }) => $isOwn ? 'flex-end' : 'flex-start'};
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

export const MessageAvatar = styled.div<{ $avatarUrl?: string }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${({ $avatarUrl, theme }) => 
    $avatarUrl 
      ? `url(${$avatarUrl}) center/cover` 
      : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
  };
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.colors.surface};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`;

export const MessageBubble = styled.div<{ $isOwn: boolean; $hasAttachment?: boolean }>`
  background: ${({ $isOwn, theme }) => 
    $isOwn ? theme.colors.primary : theme.colors.surface
  };
  color: ${({ $isOwn, theme }) => 
    $isOwn ? 'white' : theme.colors.textPrimary
  };
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  min-width: 0;
  box-sizing: border-box;

  ${({ $isOwn }) => $isOwn ? `
    border-bottom-right-radius: 4px;
  ` : `
    border-bottom-left-radius: 4px;
  `}

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 14px;
  }
`;

export const MessageSender = styled.div`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  margin-bottom: 4px;
  padding: 0 4px;
`;

export const MessageTime = styled.div`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
  padding: 0 4px;
`;

export const MessageAttachment = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  margin-top: 8px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  text-decoration: none;
  color: inherit;
  max-width: 320px;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt || theme.colors.primary + '08'};
    border-color: ${({ theme }) => theme.colors.primary + '40'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const AttachmentIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.primary + '15'};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -2px;
    right: -2px;
    width: 14px;
    height: 14px;
    background: ${({ theme }) => theme.colors.success};
    border-radius: 50%;
    border: 2px solid ${({ theme }) => theme.colors.surface};
    opacity: 0;
    transform: scale(0);
    transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  }

  ${MessageAttachment}:hover &::after {
    opacity: 1;
    transform: scale(1);
  }
`;

export const AttachmentInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const AttachmentName = styled.div`
  font-weight: 600;
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
`;

export const AttachmentSize = styled.div`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

export const AttachmentType = styled.div`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const DownloadIcon = styled.div`
  width: 24px;
  height: 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  font-size: 14px;

  ${MessageAttachment}:hover & {
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }
`;

// ============================================================================
// MESSAGE REACTIONS COMPONENTS
// ============================================================================

export const MessageReactions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  align-items: center;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ReactionButton = styled.button<{ $hasReacted?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid ${({ theme, $hasReacted }) => 
    $hasReacted ? theme.colors.primary : theme.colors.border
  };
  background: ${({ theme, $hasReacted }) => 
    $hasReacted ? theme.colors.primary + '15' : theme.colors.surface
  };
  color: ${({ theme, $hasReacted }) => 
    $hasReacted ? theme.colors.primary : theme.colors.textSecondary
  };
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  font-size: 12px;
  font-weight: 500;
  min-height: 24px;

  &:hover {
    background: ${({ theme, $hasReacted }) => 
      $hasReacted ? theme.colors.primary + '25' : theme.colors.surfaceAlt || theme.colors.primary + '08'
    };
    border-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const ReactionEmoji = styled.span`
  font-size: 14px;
  line-height: 1;
`;

export const ReactionCount = styled.span`
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
`;

export const AddReactionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  font-size: 12px;
  opacity: 0;
  transform: scale(0.8);

  ${MessageGroup}:hover & {
    opacity: 1;
    transform: scale(1);
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primary + '15'};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.1);
  }
`;

// ============================================================================
// REPLY MESSAGE COMPONENTS
// ============================================================================

export const ReplyPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.surfaceAlt || theme.colors.primary + '08'};
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;

export const ReplyToMessage = styled.div`
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
  padding-left: 12px;
  margin-bottom: 8px;
  background: ${({ theme }) => theme.colors.surfaceAlt || theme.colors.primary + '05'};
  border-radius: 0 8px 8px 0;
  padding: 8px 12px;
`;

export const ReplyAuthor = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  margin-bottom: 2px;
`;

export const ReplyContent = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
`;

export const CloseReplyButton = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.error + '20'};
  color: ${({ theme }) => theme.colors.error};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  margin-left: auto;

  &:hover {
    background: ${({ theme }) => theme.colors.error};
    color: white;
  }
`;

// ============================================================================
// TYPING INDICATOR COMPONENTS
// ============================================================================

export const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  font-style: italic;
`;

export const TypingDots = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const TypingDot = styled.div<{ $delay: number }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  animation: typing 1.4s infinite ease-in-out;
  animation-delay: ${({ $delay }) => $delay}s;

  @keyframes typing {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

// ============================================================================
// DRAG & DROP COMPONENTS
// ============================================================================

export const DropZone = styled.div<{ $isDragOver: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme, $isDragOver }) => 
    $isDragOver ? theme.colors.primary + '15' : 'transparent'
  };
  border: ${({ theme, $isDragOver }) => 
    $isDragOver ? `2px dashed ${theme.colors.primary}` : 'none'
  };
  border-radius: 12px;
  display: ${({ $isDragOver }) => $isDragOver ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
`;

export const DropZoneContent = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

export const DropZoneIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary + '20'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: ${({ theme }) => theme.colors.primary};
`;

// ============================================================================
// MENTION AUTOCOMPLETE COMPONENTS
// ============================================================================

export const MentionDropdown = styled.div<{ $position: { x: number; y: number } }>`
  position: absolute;
  top: ${({ $position }) => $position.y}px;
  left: ${({ $position }) => $position.x}px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  max-width: 200px;
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 2px;
  }
`;

export const MentionItem = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  background: ${({ theme, $selected }) => 
    $selected ? theme.colors.primary + '15' : 'transparent'
  };
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  min-height: 60px;

  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
    transform: translateX(2px);
  }

  &:first-child {
    border-radius: 12px 12px 0 0;
  }

  &:last-child {
    border-radius: 0 0 12px 12px;
  }
  
  /* Single item styling */
  &:only-child {
    border-radius: 12px;
  }
`;

export const MentionAvatar = styled.div<{ $avatarUrl?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $avatarUrl, theme }) => 
    $avatarUrl ? `url(${$avatarUrl}) center/cover` : `url(${DEFAULT_AVATAR}) center/cover`
  };
  flex-shrink: 0;
  border: 2px solid ${({ theme }) => theme.colors.border};
`;

export const MentionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const MentionName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
`;

export const MentionRole = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

// ============================================================================
// MESSAGE ACTIONS COMPONENTS
// ============================================================================

export const MessageActions = styled.div<{ $isOwn: boolean }>`
  position: absolute;
  bottom: -36px;
  ${({ $isOwn }) => $isOwn ? 'right: 12px;' : 'left: 12px;'}
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  padding: 4px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s;
  z-index: 10;

  &.message-actions {
    /* For targeting in JS/CSS */
  }
`;

export const MessageActionButton = styled.button<{ $active?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: ${({ $active, theme }) => 
    $active ? theme.colors.primary + '20' : 'transparent'
  };
  color: ${({ $active, theme }) => 
    $active ? theme.colors.primary : theme.colors.textSecondary
  };
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.colors.primary + '15'};
    color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// ============================================================================
// ENHANCED SCROLL COMPONENTS
// ============================================================================

export const ScrollToBottomButton = styled.button<{ $visible: boolean }>`
  position: absolute;
  bottom: 80px;
  right: 16px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  z-index: 100;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  transform: ${({ $visible }) => $visible ? 'scale(1)' : 'scale(0.8)'};
  pointer-events: ${({ $visible }) => $visible ? 'auto' : 'none'};

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const UnreadMessagesBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  background: ${({ theme }) => theme.colors.error};
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  padding: 0 6px;
  border: 2px solid ${({ theme }) => theme.colors.surface};
`;

// ============================================================================
// MESSAGE INPUT COMPONENTS
// ============================================================================

export const MessageInputContainer = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  border-radius: 0 0 16px 0;

  @media (max-width: 768px) {
    padding: 10px 12px;
    border-radius: 0;
  }
`;

export const MessageInputRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
  min-width: 0;
`;

export const MessageTextArea = styled.textarea`
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 10px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  outline: none;
  resize: none;
  min-height: 40px;
  max-height: 100px;
  line-height: 1.4;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  box-sizing: border-box;
  overflow: hidden;
  word-wrap: break-word;
  white-space: pre-wrap;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}15;
    background: ${({ theme }) => theme.colors.surface};
    transform: translateY(-1px);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 400;
  }
`;

export const AttachButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt || theme.colors.primary + '10'};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const SendButton = styled.button<{ $disabled?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${({ $disabled, theme }) => 
    $disabled ? theme.colors.disabled : theme.colors.primary
  };
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  opacity: ${({ $disabled }) => $disabled ? 0.6 : 1};
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

export const FileInput = styled.input`
  display: none;
`;

export const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-bottom: 8px;
`;

export const FilePreviewInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const FileName = styled.div`
  font-weight: 500;
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FileSize = styled.div`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const RemoveFileButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.error + '20'};
  color: ${({ theme }) => theme.colors.error};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.error};
    color: white;
  }
`;

// ============================================================================
// EMPTY STATE COMPONENTS
// ============================================================================

export const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

export const EmptyStateIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary + '15'};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 16px;
`;

export const EmptyStateTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: ${({ theme }) => theme.typography.headline3.fontSize};
  font-weight: ${({ theme }) => theme.typography.headline3.fontWeight};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const EmptyStateDescription = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 400px;
  line-height: 1.5;
`;

// ============================================================================
// NEW CHAT MODAL/DROPDOWN COMPONENTS
// ============================================================================

export const NewChatModal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${({ $isOpen }) => $isOpen ? 'fadeIn 0.2s ease-out' : 'none'};

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const NewChatDropdown = styled.div<{ $isOpen: boolean; $position: { x: number; y: number } }>`
  position: absolute;
  top: ${({ $position }) => $position.y}px;
  left: ${({ $position }) => $position.x}px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  min-width: 260px;
  max-width: 320px;
  width: 90%;
  max-height: 400px;
  overflow: hidden;
  z-index: 1000;
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  animation: ${({ $isOpen }) => $isOpen ? 'slideIn 0.2s ease-out' : 'none'};

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export const NewChatHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

export const NewChatTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.headline4.fontSize};
  font-weight: ${({ theme }) => theme.typography.headline4.fontWeight};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const NewChatSearch = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.components.input.borderRadius};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  outline: none;
  margin-top: 12px;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const NewChatUserList = styled.div`
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const NewChatUserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.defaultDuration}ms ease;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt || theme.colors.primary + '08'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const NewChatUserAvatar = styled.div<{ $avatarUrl?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $avatarUrl, theme }) => 
    $avatarUrl 
      ? `url(${$avatarUrl}) center/cover` 
      : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
  };
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.colors.surface};
`;

export const NewChatUserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const NewChatUserName = styled.div`
  font-weight: 500;
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const NewChatUserRole = styled.div`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`;

export const NewChatEmpty = styled.div`
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getChannelIcon = (type: string) => {
  switch (type) {
    case 'GROUP_CHAT':
      return FaUsers;
    case 'INSTITUTION_CHAT':
      return FaBuilding;
    case 'DIRECT_MESSAGE':
      return FaUser;
    default:
      return FaUsers;
  }
};

export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 168) { // Less than a week
    return date.toLocaleDateString('de-DE', { 
      weekday: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export const formatLastMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.abs(now.getTime() - date.getTime()) / (1000 * 60);

  if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)}m`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h`;
  } else if (diffInMinutes < 10080) {
    return `${Math.floor(diffInMinutes / 1440)}d`;
  } else {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit'
    });
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}; 