// API-Services für Benachrichtigungen (Deutsch)

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

/**
 * Benachrichtigungen für einen Benutzer abrufen
 */
export async function fetchNotifications(userId: string): Promise<any[]> {
  try {
    const res = await axios.get(`${API_URL}/notifications/${userId}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Benachrichtigungen konnten nicht geladen werden');
  }
}

/**
 * Benachrichtigung als gelesen markieren
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await axios.patch(`${API_URL}/notifications/${notificationId}`, {}, { withCredentials: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren der Benachrichtigung');
  }
}

/**
 * Benachrichtigung senden
 */
export async function sendNotification(data: { recipientId: string; message: string; type?: string }): Promise<any> {
  try {
    const res = await axios.post(`${API_URL}/notifications/send`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Senden der Benachrichtigung');
  }
}

// Add a helper to filter users/groups by institutionId for admins
export function filterByInstitution<T extends { institutionId?: string }>(items: T[], user: any): T[] {
  if (user.role === 'ADMIN' && user.institutionId) {
    return items.filter(item => item.institutionId === user.institutionId);
  }
  return items;
} 