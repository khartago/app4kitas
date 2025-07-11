// API-Services für Benachrichtigungen (Deutsch)

import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000/api';

// Helper function to handle errors with German messages
const handleApiError = (error: any, defaultMessage: string): never => {
  let errorMessage = defaultMessage;
  
  if (error.response?.data?.error) {
    errorMessage = error.response.data.error;
  } else if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
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
export interface Notification {
  id: string;
  title: string;
  body: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  userId: string;
}

export interface Recipient {
  id: string;
  name: string;
  email?: string;
  type: 'parent' | 'educator' | 'group';
}

export interface NotificationStats {
  total: number;
  unread: number;
  sentToday: number;
  sentThisWeek: number;
  sentThisMonth: number;
}

export interface NotificationRecipients {
  parents: Recipient[];
  educators: Recipient[];
  children: Recipient[];
  groups: Recipient[];
}

export interface SendNotificationData {
  recipientType: 'single_child' | 'single_educator' | 'whole_group' | 'all_educators' | 'all_children' | 'global';
  recipientId: string;
  title: string;
  body: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  recipientCount?: number;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Empfänger abrufen (Eltern, Erzieher, Gruppen)
 */
export async function fetchRecipients(): Promise<NotificationRecipients> {
  try {
    const res = await axios.get(`${API_URL}/notifications/recipients`, { 
      withCredentials: true 
    });
    return res.data.recipients;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Empfänger');
  }
}

/**
 * Benachrichtigungen für einen Benutzer abrufen
 */
export async function fetchNotifications(
  userId: string, 
  page: number = 1, 
  limit: number = 20, 
  filter: 'all' | 'unread' | 'read' = 'all'
): Promise<NotificationResponse> {
  try {
    const res = await axios.get(`${API_URL}/notifications/${userId}`, { 
      withCredentials: true,
      params: { page, limit, filter }
    });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Benachrichtigungen');
  }
}

/**
 * Admin Benachrichtigungen abrufen (alle gesendeten Benachrichtigungen)
 */
export async function fetchAdminNotifications(
  page: number = 1, 
  limit: number = 20, 
  filter: 'all' | 'unread' | 'read' = 'all'
): Promise<NotificationResponse> {
  try {
    const res = await axios.get(`${API_URL}/notifications/admin`, { 
      withCredentials: true,
      params: { page, limit, filter }
    });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Admin-Benachrichtigungen');
  }
}

/**
 * Benachrichtigungsstatistiken abrufen
 */
export async function fetchNotificationStats(userId: string): Promise<NotificationStats> {
  try {
    const res = await axios.get(`${API_URL}/notifications/stats/${userId}`, { 
      withCredentials: true 
    });
    return res.data.stats;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Statistiken');
  }
}

/**
 * Benachrichtigung senden
 */
export async function sendNotification(data: SendNotificationData): Promise<NotificationResponse> {
  try {
    const res = await axios.post(`${API_URL}/notifications/send`, data, { 
      withCredentials: true 
    });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Senden der Benachrichtigung');
  }
}

/**
 * Benachrichtigung als gelesen markieren
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await axios.patch(`${API_URL}/notifications/${notificationId}`, {}, { 
      withCredentials: true 
    });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren der Benachrichtigung');
  }
}

/**
 * Mehrere Benachrichtigungen als gelesen markieren
 */
export async function markMultipleNotificationsAsRead(notificationIds: string[]): Promise<void> {
  try {
    await axios.patch(`${API_URL}/notifications/bulk-read`, { 
      notificationIds 
    }, { 
      withCredentials: true 
    });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Markieren der Benachrichtigungen');
  }
}

/**
 * Benachrichtigung löschen
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/notifications/${notificationId}`, { 
      withCredentials: true 
    });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen der Benachrichtigung');
  }
}

/**
 * Helper function to filter users/groups by institutionId for admins
 */
export function filterByInstitution<T extends { institutionId?: string }>(items: T[], user: any): T[] {
  if (user.role === 'ADMIN' && user.institutionId) {
    return items.filter(item => item.institutionId === user.institutionId);
  }
  return items;
}

/**
 * Notification templates
 */
export const NOTIFICATION_TEMPLATES = {
  welcome: {
    title: 'Willkommen in der Kita',
    body: 'Herzlich willkommen! Wir freuen uns, dass Sie Teil unserer Kita-Gemeinschaft sind.',
    priority: 'normal' as const
  },
  reminder: {
    title: 'Erinnerung',
    body: 'Bitte denken Sie daran, wichtige Unterlagen mitzubringen.',
    priority: 'normal' as const
  },
  event: {
    title: 'Anstehende Veranstaltung',
    body: 'Wir laden Sie herzlich zu unserer nächsten Veranstaltung ein.',
    priority: 'high' as const
  },
  emergency: {
    title: 'Wichtige Mitteilung',
    body: 'Bitte beachten Sie diese wichtige Information für die Sicherheit aller.',
    priority: 'urgent' as const
  },
  daily_update: {
    title: 'Tagesrückblick',
    body: 'Hier ist ein kurzer Überblick über die Aktivitäten des heutigen Tages.',
    priority: 'normal' as const
  },
  health_notice: {
    title: 'Gesundheitshinweis',
    body: 'Bitte beachten Sie die aktuellen Gesundheitsrichtlinien.',
    priority: 'high' as const
  },
  weather_alert: {
    title: 'Wetterhinweis',
    body: 'Aufgrund der Wetterbedingungen bitten wir um besondere Vorsicht.',
    priority: 'normal' as const
  },
  maintenance: {
    title: 'Wartungsarbeiten',
    body: 'Wir führen Wartungsarbeiten durch. Bitte beachten Sie die Hinweise.',
    priority: 'normal' as const
  }
};

/**
 * Priority options with colors
 */
export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Niedrig', color: '#4CAF50' },
  { value: 'normal', label: 'Normal', color: '#2196F3' },
  { value: 'high', label: 'Hoch', color: '#FF9800' },
  { value: 'urgent', label: 'Dringend', color: '#F44336' }
];

/**
 * Recipient type options
 */
export const RECIPIENT_TYPE_OPTIONS = [
  { value: 'single_child', label: 'Einzelnes Kind' },
  { value: 'single_educator', label: 'Einzelner Erzieher' },
  { value: 'whole_group', label: 'Ganze Gruppe' },
  { value: 'all_educators', label: 'Alle Erzieher' },
  { value: 'all_children', label: 'Alle Kinder' },
  { value: 'global', label: 'Alle Institution (Global)' }
]; 