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
export const fetchTodaysChildren = async (groupId: string) => {
  try {
    const res = await axios.get(`${API_URL}/groups/${groupId}/children?date=heute`, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der heutigen Kinder');
  }
};

// Holt ausstehende Check-ins
export const fetchPendingCheckins = async (groupId: string) => {
  try {
    const res = await axios.get(`${API_URL}/groups/${groupId}/pending-checkins`, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der ausstehenden Check-ins');
  }
};

// Holt zugewiesene Kinder
export const fetchAssignedChildren = async (educatorId: string) => {
  try {
    const res = await axios.get(`${API_URL}/educators/${educatorId}/children`, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der zugewiesenen Kinder');
  }
};

// Holt die eigene Gruppe
export const fetchMyGroup = async (educatorId: string) => {
  try {
    const res = await axios.get(`${API_URL}/educators/${educatorId}/group`, { withCredentials: true });
    return res.data;
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
    return handleApiError(error, 'Fehler beim Speichern der Notiz');
  }
}

// Weitere Erzieher-APIs können hier ergänzt werden 