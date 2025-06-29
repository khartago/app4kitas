// API-Services für Benutzerprofil (Deutsch)

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
 * Benutzerprofil abrufen
 */
export async function fetchProfile(): Promise<any> {
  try {
    const res = await axios.get(`${API_URL}/profile`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Profil konnte nicht geladen werden');
  }
}

/**
 * Benutzerprofil aktualisieren
 */
export async function updateProfile(data: { name?: string; email?: string; password?: string }): Promise<any> {
  try {
    const res = await axios.put(`${API_URL}/profile`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Speichern des Profils');
  }
}

/**
 * Avatar hochladen
 */
export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await axios.post(`${API_URL}/profile/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Hochladen des Avatars');
  }
} 