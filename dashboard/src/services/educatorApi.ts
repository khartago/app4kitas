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

// Holt alle Gruppen für Erzieher
export const getGruppen = async () => {
  try {
    const res = await axios.get(`${API_URL}/groups`, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der Gruppen');
  }
};

// Holt alle Kinder einer Gruppe
export const getKinderByGruppe = async (groupId: string) => {
  try {
    const res = await axios.get(`${API_URL}/groups/${groupId}/children`, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der Kinder');
  }
};

// Check-in/out für ein Kind
export const checkinKind = async (childId: string, type: 'IN' | 'OUT', method: 'QR' | 'MANUAL') => {
  try {
    const res = await axios.post(`${API_URL}/checkin`, { childId, type, method }, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Check-in/out');
  }
};

// Holt die heutigen Kinder der Erziehergruppe
export const fetchTodaysChildren = async (educatorId: string) => {
  try {
    // First get the educator's groups
    const groupRes = await axios.get(`${API_URL}/educators/${educatorId}/groups`, { withCredentials: true });
    const groups = groupRes.data;
    
    if (!groups || groups.length === 0) {
      return [];
    }
    
    // Get today's children for the first group (for backward compatibility)
    const group = groups[0];
    const res = await axios.get(`${API_URL}/groups/${group.id}/children/today`, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der heutigen Kinder');
  }
};

// Holt ausstehende Check-ins
export const fetchPendingCheckins = async (educatorId: string) => {
  try {
    // First get the educator's groups
    const groupRes = await axios.get(`${API_URL}/educators/${educatorId}/groups`, { withCredentials: true });
    const groups = groupRes.data;
    
    if (!groups || groups.length === 0) {
      return [];
    }
    
    // For now, return children who haven't checked in today from the first group
    const group = groups[0];
    const children = group.children || [];
    return children.filter((child: any) => !child.checkedIn);
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der ausstehenden Check-ins');
  }
};

// Holt zugewiesene Kinder
export const fetchAssignedChildren = async (educatorId: string) => {
  try {
    const res = await axios.get(`${API_URL}/educators/${educatorId}/children`, { withCredentials: true });
    return res.data.children || [];
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der zugewiesenen Kinder');
  }
};

// Holt die eigenen Gruppen (für Erzieher mit mehreren Gruppen)
export const fetchMyGroups = async (educatorId: string) => {
  try {
    const res = await axios.get(`${API_URL}/educators/${educatorId}/groups`, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der Gruppen');
  }
};

// Holt die eigene Gruppe (für Kompatibilität - gibt erste Gruppe zurück)
export const fetchMyGroup = async (educatorId: string) => {
  try {
    const res = await axios.get(`${API_URL}/educators/${educatorId}/groups`, { withCredentials: true });
    // Return first group for backward compatibility
    return Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der Gruppe');
  }
};

// Holt Nachrichten
export const fetchMessages = async (childId?: string, groupId?: string) => {
  try {
    let url = `${API_URL}/messages`;
    if (childId) url += `/child/${childId}`;
    else if (groupId) url += `/group/${groupId}`;
    const res = await axios.get(url, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der Nachrichten');
  }
};

// Sendet eine Nachricht
export const sendMessage = async (data: { content?: string; childId?: string; groupId?: string; file?: File }) => {
  try {
    const formData = new FormData();
    if (data.content) formData.append('content', data.content);
    if (data.childId) formData.append('childId', data.childId);
    if (data.groupId) formData.append('groupId', data.groupId);
    if (data.file) formData.append('file', data.file);
    const res = await axios.post(`${API_URL}/message`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Senden der Nachricht');
  }
};

/**
 * Notizen eines Kindes abrufen
 * @param {string} childId
 * @returns {Promise<any[]>}
 */
export async function fetchChildrenNotes(childId: string): Promise<any[]> {
  try {
    const res = await axios.get(`${API_URL}/notes/child/${childId}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Notizen');
  }
}

/**
 * Neue Notiz für ein Kind anlegen
 * @param {string} childId
 * @param {string} content
 * @param {File | null} [file]
 * @returns {Promise<any>}
 */
export async function addNote(childId: string, content: string, file?: File | null): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('childId', childId);
    formData.append('content', content);
    if (file) formData.append('file', file);
    const res = await axios.post(`${API_URL}/notes`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen der Notiz');
  }
}

/**
 * Notiz aktualisieren
 * @param {string} noteId
 * @param {string} content
 * @param {File | null} [file]
 * @returns {Promise<any>}
 */
export async function updateNote(noteId: string, content: string, file?: File | null): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('content', content);
    if (file) formData.append('file', file);
    const res = await axios.put(`${API_URL}/notes/${noteId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren der Notiz');
  }
}

/**
 * Notiz löschen
 * @param {string} noteId
 * @returns {Promise<any>}
 */
export async function deleteNote(noteId: string): Promise<any> {
  try {
    const res = await axios.delete(`${API_URL}/notes/${noteId}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen der Notiz');
  }
}

// Missing functions that are being imported
export const fetchTodaysCheckins = async (educatorId: string) => {
  try {
    // First get the educator's group
    const groupRes = await axios.get(`${API_URL}/educators/${educatorId}/groups`, { withCredentials: true });
    const groups = groupRes.data;
    
    if (!groups || groups.length === 0) {
      return [];
    }
    
    // Use the first group for today's check-ins
    const groupId = groups[0].id;
    const res = await axios.get(`${API_URL}/checkin/group/${groupId}/today`, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der heutigen Check-ins');
  }
};

export const fetchEducatorCheckinStats = async (educatorId: string) => {
  try {
    const res = await axios.get(`${API_URL}/checkin/educator/${educatorId}/stats`, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der Check-in Statistiken');
  }
};

export const fetchChildHistory = async (childId: string) => {
  try {
    const res = await axios.get(`${API_URL}/checkin/child/${childId}/history`, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der Kind-Historie');
  }
};

export const correctCheckinTime = async (childId: string, newTime: string) => {
  try {
    const res = await axios.put(`${API_URL}/checkin/correct-time`, { childId, newTime }, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Korrigieren der Check-in Zeit');
  }
};

export const fetchRecentActivity = async (educatorId: string) => {
  try {
    const res = await axios.get(`${API_URL}/activity/recent`, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der letzten Aktivitäten');
  }
};