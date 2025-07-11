// API-Services für Super Admin Dashboard (Deutsch)

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
 * Alle Institutionen (Admins) abrufen
 */
export async function fetchInstitutionenAdmins(): Promise<any[]> {
  try {
    const res = await axios.get(`${API_URL}/users?role=ADMIN`, { withCredentials: true });
    return res.data.users || [];
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Institutionen (Admins)');
  }
}

/**
 * Alle Erzieher abrufen
 */
export async function fetchEducators(): Promise<any[]> {
  try {
    const res = await axios.get(`${API_URL}/users?role=EDUCATOR`, { withCredentials: true });
    return res.data.educators || [];
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Erzieher');
  }
}

/**
 * Alle Eltern abrufen
 */
export async function fetchParents(): Promise<any[]> {
  try {
    const res = await axios.get(`${API_URL}/users?role=PARENT`, { withCredentials: true });
    return res.data.users || [];
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Eltern');
  }
}

/**
 * Neue Institution anlegen
 */
export async function addKita(data: { name: string; address: string }): Promise<any> {
  try {
    const res = await axios.post(`${API_URL}/institutionen`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Anlegen der Institution');
  }
}

/**
 * Nutzerübersicht für Super Admin
 */
export async function fetchAllUsers(): Promise<any[]> {
  try {
    const res = await axios.get(`${API_URL}/users`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Nutzer');
  }
}

/**
 * Statistiken abrufen
 */
export async function fetchSuperAdminStats(): Promise<any> {
  try {
    const res = await axios.get(`${API_URL}/stats`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Statistiken');
  }
}

/**
 * Alias für Super Admin Statistiken (getSuperAdminStats)
 */
export const getSuperAdminStats = fetchSuperAdminStats;

/**
 * Alle Plattform-Admins abrufen
 */
export async function fetchPlatformAdmin(): Promise<any[]> {
  try {
    const res = await axios.get(`${API_URL}/users?role=SUPER_ADMIN`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Plattform-Admins');
  }
}

/**
 * Admin einer Kita zuweisen
 * @param {string} kitaId - Die ID der Kita
 * @param {string} adminId - Die ID des Admins
 */
export async function assignAdmin(kitaId: string, adminId: string): Promise<any> {
  try {
    const res = await axios.post(`${API_URL}/institutions/${kitaId}/assign-admin`, { adminId }, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Zuweisen des Admins');
  }
}

/**
 * Erzieher anlegen
 */
export async function addEducator(data: { name: string; email: string; password: string; institutionId: string; groupIds?: string[] }): Promise<any> {
  try {
    const res = await axios.post(`${API_URL}/users`, { ...data, role: 'EDUCATOR' }, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Anlegen des Erziehers');
  }
}

/**
 * Erzieher bearbeiten
 */
export async function editEducator(id: string, data: { name?: string; email?: string; password?: string; institutionId?: string; groupIds?: string[] }): Promise<any> {
  try {
    const res = await axios.put(`${API_URL}/users/${id}`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Bearbeiten des Erziehers');
  }
}

/**
 * Erzieher löschen
 */
export async function deleteEducator(id: string): Promise<any> {
  try {
    const res = await axios.delete(`${API_URL}/users/${id}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen des Erziehers');
  }
}

/**
 * Eltern löschen
 */
export async function deleteParent(id: string): Promise<any> {
  try {
    const res = await axios.delete(`${API_URL}/users/${id}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen des Elternteils');
  }
}

/**
 * Neuen Elternteil hinzufügen (nur Super Admin)
 */
export async function addParent(data: { name: string; email: string; password: string; phone?: string }): Promise<any> {
  try {
    const res = await axios.post(`${API_URL}/users`, { ...data, role: 'PARENT' }, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Hinzufügen des Elternteils');
  }
}

/**
 * Elternteil bearbeiten (nur Super Admin)
 */
export async function editParent(id: string, data: { name?: string; email?: string; password?: string; phone?: string }): Promise<any> {
  try {
    const res = await axios.put(`${API_URL}/users/${id}`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Bearbeiten des Elternteils');
  }
}

/**
 * Institution (Kita) bearbeiten
 */
export async function editKita(id: string, data: { name?: string; address?: string }): Promise<any> {
  try {
    const res = await axios.put(`${API_URL}/institutionen/${id}`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Bearbeiten der Institution');
  }
}

/**
 * Institution (Kita) löschen
 */
export async function deleteKita(id: string): Promise<any> {
  try {
    const res = await axios.delete(`${API_URL}/institutionen/${id}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen der Institution');
  }
}

/**
 * Passwort zurücksetzen
 */
export async function resetPassword(userId: string, newPassword: string): Promise<any> {
  try {
    const res = await axios.post(`${API_URL}/users/${userId}/reset-password`, { newPassword }, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Zurücksetzen des Passworts');
  }
}

/**
 * Alle Institutionen abrufen
 */
export async function fetchInstitutionen(): Promise<any[]> {
  try {
    const res = await axios.get(`${API_URL}/institutionen`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Institutionen');
  }
}

/**
 * Admin registrieren
 */
export async function registerAdmin(data: { name: string; email: string; password: string; role: string; institutionId: string }): Promise<any> {
  try {
    const res = await axios.post(`${API_URL}/register`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Registrieren des Admins');
  }
}

/**
 * Admin bearbeiten
 */
export async function editAdmin(id: string, data: { name?: string; email?: string; password?: string }): Promise<any> {
  try {
    const res = await axios.put(`${API_URL}/users/${id}`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Bearbeiten des Admins');
  }
}

/**
 * Admin löschen
 */
export async function deleteAdmin(id: string): Promise<any> {
  try {
    const res = await axios.delete(`${API_URL}/users/${id}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen des Admins');
  }
}

export async function fetchPlatformStats() {
  try {
    const res = await axios.get(`${API_URL}/stats`, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der Plattformstatistiken');
  }
}

// Weitere Funktionen können nach Bedarf ergänzt werden 