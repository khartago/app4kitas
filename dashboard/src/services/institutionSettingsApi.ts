import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000/api';

// Helper function to handle errors with German messages
const handleApiError = (error: any, defaultMessage: string): never => {
  let errorMessage = defaultMessage;
  
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.response?.data?.error) {
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
export interface InstitutionSettings {
  id: string;
  name: string;
  address?: string;
  openingTime?: string;
  closingTime?: string;
  createdAt: string;
  closedDays: ClosedDay[];
  repeatedClosedDays?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  admins: Admin[];
  groups: Group[];
  _count: {
    children: number;
    groups: number;
    admins: number;
  };
}

export interface ClosedDay {
  id: string;
  date?: string; // Legacy single day
  fromDate?: string; // Start of date range
  toDate?: string; // End of date range
  reason?: string;
  recurrence?: string; // 'ONCE' | 'YEARLY'
  institutionId: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Group {
  id: string;
  name: string;
  _count: {
    children: number;
    educators: number;
  };
}

export interface InstitutionStats {
  childrenCount: number;
  educatorsCount: number;
  parentsCount: number;
  groupsCount: number;
  recentCheckIns: number;
  recentMessages: number;
}

export interface UpdateInstitutionData {
  name: string;
  address?: string;
  openingTime?: string;
  closingTime?: string;
  repeatedClosedDays?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

export interface AddClosedDayData {
  date?: string; // For single day
  fromDate?: string; // For date range
  toDate?: string; // For date range
  reason?: string;
  recurrence?: string; // 'ONCE' | 'YEARLY'
}

/**
 * Institutionseinstellungen abrufen
 */
export async function getInstitutionSettings(institutionId: string): Promise<InstitutionSettings> {
  try {
    const res = await axios.get(`${API_URL}/institution-settings/${institutionId}`, { 
      withCredentials: true 
    });
    return res.data.institution;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Institutionseinstellungen');
  }
}

/**
 * Institutionseinstellungen aktualisieren
 */
export async function updateInstitutionSettings(
  institutionId: string, 
  data: UpdateInstitutionData
): Promise<InstitutionSettings> {
  try {
    const res = await axios.put(`${API_URL}/institution-settings/${institutionId}`, data, { 
      withCredentials: true 
    });
    return res.data.institution;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren der Institutionseinstellungen');
  }
}

/**
 * Geschlossenen Tag hinzufügen
 */
export async function addClosedDay(
  institutionId: string, 
  data: AddClosedDayData
): Promise<ClosedDay> {
  try {
    const res = await axios.post(`${API_URL}/institution-settings/${institutionId}/closed-days`, data, { 
      withCredentials: true 
    });
    return res.data.closedDay;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Hinzufügen des geschlossenen Tages');
  }
}

/**
 * Geschlossenen Tag entfernen
 */
export async function removeClosedDay(
  institutionId: string, 
  closedDayId: string
): Promise<void> {
  try {
    await axios.delete(`${API_URL}/institution-settings/${institutionId}/closed-days/${closedDayId}`, { 
      withCredentials: true 
    });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Entfernen des geschlossenen Tages');
  }
}

/**
 * Institution Statistiken abrufen
 */
export async function getInstitutionStats(institutionId: string): Promise<InstitutionStats> {
  try {
    const res = await axios.get(`${API_URL}/institution-settings/${institutionId}/stats`, { 
      withCredentials: true 
    });
    return res.data.stats;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Statistiken');
  }
} 