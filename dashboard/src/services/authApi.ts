// API-Services für Authentifizierung (Deutsch)

import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000/api';

// Helper function for making authenticated API requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle 204 No Content (e.g., successful DELETE)
    if (response.status === 204) return;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Netzwerkfehler');
  }
};

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
 * Benutzer anmelden
 */
export async function login(email: string, password: string): Promise<{ token: string; user: any }> {
  try {
    const res = await axios.post(
      `${API_URL}/login`,
      { email, password },
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Login');
  }
}

/**
 * Benutzer abmelden
 */
export async function logout(): Promise<void> {
  try {
    await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
  } catch (error) {
    return handleApiError(error, 'Abmeldung fehlgeschlagen');
  }
}

/**
 * JWT Token validieren
 */
export async function validateToken(): Promise<any> {
  try {
    const res = await axios.get(`${API_URL}/validate-token`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Token ungültig');
  }
} 

/**
 * Profil aktualisieren
 */
export async function updateProfile(profileData: { name?: string; email?: string; phone?: string }): Promise<any> {
  try {
    const res = await axios.put(`${API_URL}/profile`, profileData, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren des Profils');
  }
}

/**
 * Passwort ändern
 */
export async function changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
  try {
    await axios.put(`${API_URL}/profile/password`, passwordData, { withCredentials: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Ändern des Passworts');
  }
} 