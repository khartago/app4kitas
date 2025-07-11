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

// Helper function to download PDF
const downloadPDF = async (url: string, filename: string) => {
  try {
    // Ensure url is absolute using API_URL if not already
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    const response = await fetch(fullUrl, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Export fehlgeschlagen: ${response.status} - ${errorText}`);
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('PDF Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    alert(`PDF Export fehlgeschlagen: ${errorMessage}`);
  }
};

// Helper to trigger file download via fetch
export async function handleExport(url: string, filename: string) {
  try {
    // Ensure url is absolute using API_URL if not already
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    const res = await fetch(fullUrl, { credentials: 'include' });
    if (!res.ok) {
      const text = await res.text();
      alert('Export fehlgeschlagen: ' + (text || res.status));
      return;
    }
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (e) {
    alert('Export fehlgeschlagen: ' + (e as Error).message);
  }
}

export async function fetchDailyReport(date: string, groupId?: string, institutionId?: string) {
  try {
    const params = new URLSearchParams({ date });
    if (groupId) params.append('groupId', groupId);
    if (institutionId) params.append('institutionId', institutionId);
    const res = await axios.get(`${API_URL}/reports/daily?${params.toString()}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden des Tagesberichts');
  }
}

export function exportDailyReport(date: string, groupId?: string, institutionId?: string) {
  const params = new URLSearchParams({ date, format: 'csv' });
  if (groupId) params.append('groupId', groupId);
  if (institutionId) params.append('institutionId', institutionId);
  window.open(`${API_URL}/reports/daily/export?${params.toString()}`);
}

export async function exportDailyReportPDF(date: string, groupId?: string, institutionId?: string) {
  const params = new URLSearchParams({ date, format: 'pdf' });
  if (groupId) params.append('groupId', groupId);
  if (institutionId) params.append('institutionId', institutionId);
  await downloadPDF(`${API_URL}/reports/daily/export?${params.toString()}`, `tagesbericht-${date}.pdf`);
}

export async function fetchMonthlyReport(month: string, groupId?: string, institutionId?: string) {
  try {
    const params = new URLSearchParams({ month });
    if (groupId) params.append('groupId', groupId);
    if (institutionId) params.append('institutionId', institutionId);
    const res = await axios.get(`${API_URL}/reports/monthly?${params.toString()}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden des Monatsberichts');
  }
}

export function exportMonthlyReport(month: string, groupId?: string, institutionId?: string) {
  const params = new URLSearchParams({ month, format: 'csv' });
  if (groupId) params.append('groupId', groupId);
  if (institutionId) params.append('institutionId', institutionId);
  window.open(`${API_URL}/reports/monthly/export?${params.toString()}`);
}

export async function exportMonthlyReportPDF(month: string, groupId?: string, institutionId?: string) {
  const params = new URLSearchParams({ month, format: 'pdf' });
  if (groupId) params.append('groupId', groupId);
  if (institutionId) params.append('institutionId', institutionId);
  await downloadPDF(`${API_URL}/reports/monthly/export?${params.toString()}`, `monatsbericht-${month}.pdf`);
}

export async function fetchLatePickupsReport(date: string, groupId?: string, institutionId?: string) {
  try {
    const params = new URLSearchParams({ date });
    if (groupId) params.append('groupId', groupId);
    if (institutionId) params.append('institutionId', institutionId);
    const res = await axios.get(`${API_URL}/reports/late-pickups?${params.toString()}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden des Verspätungsberichts');
  }
}

export function exportLatePickupsReport(date: string, groupId?: string, institutionId?: string) {
  const params = new URLSearchParams({ date });
  if (groupId) params.append('groupId', groupId);
  if (institutionId) params.append('institutionId', institutionId);
  window.open(`${API_URL}/reports/late-pickups/export?${params.toString()}`);
}

// Entity export functions
export async function exportEntityPDF(entityName: string) {
  // Map entity names to correct backend API endpoints
  const endpointMap: { [key: string]: string } = {
    'Kinder': 'children',
    'Kind': 'children',
    'Gruppen': 'groups',
    'Gruppe': 'groups', 
    'Erzieher': 'educators',
    'Erzieherin': 'educators',
    'Eltern': 'parents',
    'Elternteil': 'parents',
    'Institutionen': 'institutionen',
    'Institution': 'institutionen'
  };
  
  const apiEndpoint = endpointMap[entityName] || entityName.toLowerCase();
  await downloadPDF(`${API_URL}/${apiEndpoint}/export?format=pdf`, `${entityName}_export.pdf`);
}

export function exportEntityCSV(entityName: string) {
  // Map entity names to correct backend API endpoints
  const endpointMap: { [key: string]: string } = {
    'Kinder': 'children',
    'Kind': 'children',
    'Gruppen': 'groups',
    'Gruppe': 'groups', 
    'Erzieher': 'educators',
    'Erzieherin': 'educators',
    'Eltern': 'parents',
    'Elternteil': 'parents',
    'Institutionen': 'institutionen',
    'Institution': 'institutionen'
  };
  
  const apiEndpoint = endpointMap[entityName] || entityName.toLowerCase();
  window.open(`${API_URL}/${apiEndpoint}/export?format=csv`, '_blank');
}

export async function fetchPlatformStats(): Promise<any> {
  try {
    const res = await axios.get(`${API_URL}/stats`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Statistiken');
  }
}

export const reportApi = {
  getLatePickups: (institutionId: string, params: any) => {
    const { from, to, ...otherParams } = params;
    return axios.get(`${API_URL}/reports/late-pickups`, { 
      params: { 
        startDate: from, 
        endDate: to, 
        ...otherParams, 
        institutionId 
      }, 
      withCredentials: true 
    });
  },
  exportLatePickups: (params: any, format: 'csv' | 'pdf') => {
    const { from, to, ...otherParams } = params;
    const exportParams = { 
      startDate: from, 
      endDate: to, 
      ...otherParams, 
      format 
    };
    window.open(`${API_URL}/reports/late-pickups?${new URLSearchParams(exportParams)}`);
  },

  getAbsencePatterns: (institutionId: string, params: any) => {
    const { from, to, ...otherParams } = params;
    return axios.get(`${API_URL}/reports/absence-patterns`, { 
      params: { 
        startDate: from, 
        endDate: to, 
        ...otherParams, 
        institutionId 
      }, 
      withCredentials: true 
    });
  },
  exportAbsencePatterns: (params: any, format: 'csv' | 'pdf') => {
    const { from, to, ...otherParams } = params;
    const exportParams = { 
      startDate: from, 
      endDate: to, 
      ...otherParams, 
      format 
    };
    window.open(`${API_URL}/reports/absence-patterns?${new URLSearchParams(exportParams)}`);
  },

  getGroupAttendance: (params: any) =>
    axios.get(`${API_URL}/reports/group-attendance`, { params, withCredentials: true }),
  exportGroupAttendance: (params: any, format: 'csv' | 'pdf') =>
    window.open(`${API_URL}/reports/group-attendance?${new URLSearchParams({ ...params, format })}`),

  getCheckinTrends: (params: any) =>
    axios.get(`${API_URL}/reports/checkin-trends`, { params, withCredentials: true }),
  exportCheckinTrends: (params: any, format: 'csv' | 'pdf') =>
    window.open(`${API_URL}/reports/checkin-trends?${new URLSearchParams({ ...params, format })}`),

  getCheckinMethods: (params: any) =>
    axios.get(`${API_URL}/reports/checkin-methods`, { params, withCredentials: true }),
  exportCheckinMethods: (params: any, format: 'csv' | 'pdf') =>
    window.open(`${API_URL}/reports/checkin-methods?${new URLSearchParams({ ...params, format })}`),

  getCustomAttendance: (params: any) =>
    axios.get(`${API_URL}/reports/custom-attendance`, { params, withCredentials: true }),
  exportCustomAttendance: (params: any, format: 'csv' | 'pdf') =>
    window.open(`${API_URL}/reports/custom-attendance?${new URLSearchParams({ ...params, format })}`),

  getActiveEducators: (params: any) =>
    axios.get(`${API_URL}/reports/active-educators`, { params, withCredentials: true }),
  exportActiveEducators: (params: any, format: 'csv' | 'pdf') =>
    window.open(`${API_URL}/reports/active-educators?${new URLSearchParams({ ...params, format })}`),
}; 