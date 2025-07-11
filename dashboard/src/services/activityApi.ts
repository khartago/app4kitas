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

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export interface ActivityResponse {
  activities: ActivityLog[];
}

// Fetch recent activity logs
export const fetchRecentActivity = async (limit: number = 50): Promise<ActivityLog[]> => {
  try {
    const response = await axios.get<ActivityResponse>(`${API_URL}/activity/recent?limit=${limit}`, { 
      withCredentials: true 
    });
    return response.data.activities;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return handleApiError(error, 'Fehler beim Laden der Aktivitäten');
  }
};

// Fetch activity logs for admin dashboard (institution-specific)
export const fetchAdminActivity = async (limit: number = 50): Promise<ActivityLog[]> => {
  try {
    const response = await axios.get<ActivityResponse>(`${API_URL}/activity/recent?limit=${limit}`, { 
      withCredentials: true 
    });
    return response.data.activities;
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    return handleApiError(error, 'Fehler beim Laden der Aktivitäten');
  }
};

// Fetch activity logs for educator dashboard (group-specific)
export const fetchEducatorActivity = async (limit: number = 50): Promise<ActivityLog[]> => {
  try {
    const response = await axios.get<ActivityResponse>(`${API_URL}/activity/recent?limit=${limit}`, { 
      withCredentials: true 
    });
    return response.data.activities;
  } catch (error) {
    console.error('Error fetching educator activity:', error);
    return handleApiError(error, 'Fehler beim Laden der Aktivitäten');
  }
};

// Fetch activity logs for a specific user
export const fetchUserActivity = async (userId: string, limit: number = 20): Promise<ActivityLog[]> => {
  try {
    const response = await axios.get<ActivityResponse>(`${API_URL}/activity/user/${userId}?limit=${limit}`, { 
      withCredentials: true 
    });
    return response.data.activities;
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return handleApiError(error, 'Fehler beim Laden der Benutzeraktivitäten');
  }
};

// Get activity action display text
export const getActivityActionText = (action: string): string => {
  const actionMap: { [key: string]: string } = {
    'USER_CREATED': 'Benutzer erstellt',
    'USER_LOGIN': 'Anmeldung',
    'USER_LOGOUT': 'Abmeldung',
    'CHILD_CREATED': 'Kind hinzugefügt',
    'CHILD_UPDATED': 'Kind bearbeitet',
    'CHILD_DELETED': 'Kind gelöscht',
    'GROUP_CREATED': 'Gruppe erstellt',
    'GROUP_UPDATED': 'Gruppe bearbeitet',
    'GROUP_DELETED': 'Gruppe gelöscht',
    'MESSAGE_SENT': 'Nachricht gesendet',
    'CHECKIN_RECORDED': 'Check-in erfasst',
    'INSTITUTION_CREATED': 'Institution erstellt',
    'INSTITUTION_UPDATED': 'Institution bearbeitet',
    'INSTITUTION_DELETED': 'Institution gelöscht',
  };
  
  return actionMap[action] || action;
};

// Get activity icon based on action
export const getActivityIcon = (action: string): string => {
  const iconMap: { [key: string]: string } = {
    'USER_CREATED': '👤',
    'USER_LOGIN': '🔑',
    'USER_LOGOUT': '🚪',
    'CHILD_CREATED': '👶',
    'CHILD_UPDATED': '✏️',
    'CHILD_DELETED': '🗑️',
    'GROUP_CREATED': '👥',
    'GROUP_UPDATED': '✏️',
    'GROUP_DELETED': '🗑️',
    'MESSAGE_SENT': '💬',
    'CHECKIN_RECORDED': '✅',
    'INSTITUTION_CREATED': '🏢',
    'INSTITUTION_UPDATED': '✏️',
    'INSTITUTION_DELETED': '🗑️',
  };
  
  return iconMap[action] || '📝';
}; 