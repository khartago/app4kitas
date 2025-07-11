import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000/api';

// Helper function to handle errors with German messages
const handleApiError = (error: any, defaultMessage: string): never => {
  let errorMessage = defaultMessage;
  
  if (error.response?.data?.error) {
    errorMessage = error.response.data.error;
  } else if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        errorMessage = 'Ungültige Anfrage';
        break;
      case 401:
        errorMessage = 'Nicht autorisiert';
        break;
      case 403:
        errorMessage = 'Zugriff verweigert';
        break;
      case 404:
        errorMessage = 'Ressource nicht gefunden';
        break;
      case 500:
        errorMessage = 'Serverfehler';
        break;
      default:
        errorMessage = defaultMessage;
    }
  }
  
  throw new Error(errorMessage);
};

// Types
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

export interface Channel {
  id: string;
  name: string;
  type: 'GROUP_CHAT' | 'INSTITUTION_CHAT' | 'DIRECT_MESSAGE';
  otherUserId?: string;
  otherUserName?: string;
  otherUserRole?: string;
  avatarUrl?: string;
  lastMessage?: Message;
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

export interface Message {
  id: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
  editedAt?: string;
  isEdited?: boolean;
  sender: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  reactions?: MessageReaction[];
}

export interface DirectMessageResponse {
  directMessageId: string;
  otherUser: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
  messages: Message[];
}

// Get all accessible channels for the current user
export const getChannels = async (): Promise<Channel[]> => {
  try {
    const res = await axios.get(`${API_URL}/channels`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Kanäle');
  }
};

// Get messages for a specific channel
export const getChannelMessages = async (channelId: string): Promise<Message[]> => {
  try {
    const res = await axios.get(`${API_URL}/channels/${channelId}/messages`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Nachrichten');
  }
};

// Get or create direct message conversation
export const getDirectMessages = async (otherUserId: string): Promise<DirectMessageResponse> => {
  try {
    const res = await axios.get(`${API_URL}/direct-messages/${otherUserId}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Direktnachrichten');
  }
};

// Get all users in the same institution for direct messaging
export const getInstitutionUsers = async (): Promise<User[]> => {
  try {
    const res = await axios.get(`${API_URL}/users/institution`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Benutzer');
  }
};

// Send message to channel or direct message (with optional reply support)
export const sendMessage = async (data: FormData): Promise<Message> => {
  try {
    const res = await axios.post(`${API_URL}/message`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Senden der Nachricht');
  }
};

// Toggle message reaction
export const toggleReaction = async (messageId: string, emoji: string): Promise<{ success: boolean; action: 'added' | 'removed' }> => {
  try {
    const res = await axios.post(`${API_URL}/messages/${messageId}/reactions`, 
      { emoji }, 
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Verarbeiten der Reaktion');
  }
};

// Edit message
export const editMessage = async (messageId: string, content: string): Promise<Message> => {
  try {
    const res = await axios.put(`${API_URL}/messages/${messageId}`, 
      { content }, 
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Bearbeiten der Nachricht');
  }
};

// Legacy functions for backward compatibility
export const fetchMessages = async (childId?: string, groupId?: string): Promise<Message[]> => {
  try {
    let url = `${API_URL}/messages`;
    if (childId) url += `/child/${childId}`;
    else if (groupId) url += `/group/${groupId}`;
    const res = await axios.get(url, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Nachrichten');
  }
}; 