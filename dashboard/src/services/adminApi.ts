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

// Holt Admin-Statistiken
export async function getAdminStats() {
  try {
    const res = await axios.get(`${API_URL}/stats`, { withCredentials: true });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der Statistiken');
  }
}

// Holt alle Gruppen
export const fetchGroups = async () => {
  try {
    const res = await axios.get(`${API_URL}/groups`, { withCredentials: true });
    return res.data.groups || [];
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Gruppen');
  }
};

// Fügt eine neue Gruppe hinzu
export const addGroup = async (data: any) => {
  try {
    const res = await axios.post(`${API_URL}/groups`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Hinzufügen der Gruppe');
  }
};

// Weist Erzieher einer Gruppe zu
export const assignEducators = async (groupId: string, educatorIds: string[]) => {
  try {
    const res = await axios.put(`${API_URL}/groups/${groupId}/educators`, { educatorIds }, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Zuweisen der Erzieher');
  }
};

// Holt alle Kinder
export const fetchChildren = async () => {
  try {
    const res = await axios.get(`${API_URL}/children`, { withCredentials: true });
    return { children: res.data.children || [] };
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Kinder');
  }
};

// Fügt ein neues Kind hinzu
export const addChild = async (data: any) => {
  try {
    const res = await axios.post(`${API_URL}/children`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Hinzufügen des Kindes');
  }
};

// Bearbeitet ein Kind
export const editChild = async (childId: string, data: any) => {
  try {
    const res = await axios.put(`${API_URL}/children/${childId}`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Bearbeiten des Kindes');
  }
};

// Bereits vorhandene Funktionen
export const getKinder = fetchChildren;
export const getGruppen = fetchGroups;
export const createKind = addChild;
export const createGruppe = addGroup;

// Lädt ein Kinderfoto hoch
export const uploadChildPhoto = async (childId: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await axios.put(`${API_URL}/children/${childId}/photo`, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Hochladen des Fotos');
  }
};

// Holt alle Erzieher
export const fetchEducators = async () => {
  try {
    const res = await axios.get(`${API_URL}/users?role=EDUCATOR`, { withCredentials: true });
    return { educators: res.data.educators || res.data.users || [] };
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Erzieher');
  }
};

// Holt alle Eltern
export const fetchParents = async () => {
  try {
    const res = await axios.get(`${API_URL}/users?role=PARENT`, { withCredentials: true });
    return { users: res.data.parents || res.data.users || [] };
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Eltern');
  }
};

// Export groups (CSV/PDF)
export const exportGroups = (format: 'csv' | 'pdf') => {
  window.open(`${API_URL}/groups/export?format=${format}`, '_blank');
};

// Export children (CSV/PDF)
export const exportChildren = (format: 'csv' | 'pdf') => {
  window.open(`${API_URL}/children/export?format=${format}`, '_blank');
};

// Export educators (CSV/PDF)
export const exportEducators = (format: 'csv' | 'pdf') => {
  window.open(`${API_URL}/educators/export?format=${format}`, '_blank');
};

// Check-in statistics
export const fetchCheckinStats = async () => {
  try {
    const res = await axios.get(`${API_URL}/checkin/stats`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Check-in Statistiken');
  }
};

// --- GROUPS ---
// Edit a group
export const editGroup = async (groupId: string, data: any) => {
  try {
    const res = await axios.put(`${API_URL}/groups/${groupId}`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Bearbeiten der Gruppe');
  }
};

// Delete a group
export const deleteGroup = async (groupId: string) => {
  try {
    const res = await axios.delete(`${API_URL}/groups/${groupId}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen der Gruppe');
  }
};

// --- CHILDREN ---
// Delete a child
export const deleteChild = async (childId: string) => {
  try {
    const res = await axios.delete(`${API_URL}/children/${childId}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen des Kindes');
  }
};

// --- EDUCATORS (STAFF) ---
// Add educator
export const addEducator = async (data: { name: string; email: string; password: string; institutionId: string }) => {
  try {
    const res = await axios.post(`${API_URL}/register`, {
      ...data,
      role: 'EDUCATOR',
      institutionId: data.institutionId
    }, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Hinzufügen des Erziehers');
  }
};

// Edit educator
export const editEducator = async (educatorId: string, data: any) => {
  try {
    const res = await axios.put(`${API_URL}/users/${educatorId}`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Bearbeiten des Erziehers');
  }
};

// Delete educator
export const deleteEducator = async (educatorId: string) => {
  try {
    const res = await axios.delete(`${API_URL}/users/${educatorId}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen des Erziehers');
  }
};

// Holt den QR-Code eines Kindes als Bild (PNG)
export const fetchChildQRCode = async (childId: string): Promise<Blob> => {
  try {
    const res = await axios.get(`${API_URL}/children/${childId}/qrcode`, {
      withCredentials: true,
      responseType: 'blob',
    });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden des QR-Codes');
  }
};

// Weitere Admin-APIs können hier ergänzt werden 