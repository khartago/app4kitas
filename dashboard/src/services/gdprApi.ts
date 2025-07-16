/**
 * GDPR API Service - Frontend service for GDPR operations
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export interface PendingDeletion {
  id: string;
  type: string;
  name: string;
  email?: string;
  deletedAt: string;
  retentionDate: string;
  daysUntilPermanentDeletion: number;
  institution: string;
  group?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export interface RetentionPeriods {
  USER: number;
  CHILD: number;
  GROUP: number;
  INSTITUTION: number;
  PERSONAL_TASK: number;
  NOTE: number;
  NOTIFICATION: number;
  CLOSED_DAY: number;
  MESSAGE: number;
  ACTIVITY_LOG: number;
  FAILED_LOGIN: number;
}

export interface CleanupResult {
  success: boolean;
  deletedCount: number;
  message: string;
}

export interface ComplianceReport {
  dataProcessingCount: number;
  dataDeletionCount: number;
  dataExportCount: number;
  privacyComplaintsCount: number;
  anomalies: Array<{
    type: string;
    date: string;
    count: number;
    threshold: number;
    severity: string;
  }>;
  reportPeriod: {
    start: string;
    end: string;
    range: string;
  };
  generatedAt: string;
  complianceScore: number;
  recommendations: Array<{
    priority: string;
    category: string;
    recommendation: string;
    action: string;
  }>;
}

export interface BackupVerification {
  success: boolean;
  verificationResults: Array<{
    type: string;
    success: boolean;
    details: any;
    timestamp: string;
  }>;
  timestamp: string;
}

export interface ComplianceMonitoring {
  processingActivities: number;
  deletionActivities: number;
  privacyComplaints: number;
  timestamp: string;
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
}

/**
 * Get pending deletions for GDPR dashboard
 */
export const getPendingDeletions = async (): Promise<PendingDeletion[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/pending-deletions`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der ausstehenden Löschungen');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching pending deletions:', error);
    throw error;
  }
};

/**
 * Get GDPR audit logs
 */
export const getGDPRAuditLogs = async (limit: number = 100): Promise<AuditLog[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/audit-logs?limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der GDPR-Audit-Logs');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching GDPR audit logs:', error);
    throw error;
  }
};

/**
 * Get retention periods
 */
export const getRetentionPeriods = async (): Promise<RetentionPeriods> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/retention-periods`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Aufbewahrungsfristen');
    }

    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error('Error fetching retention periods:', error);
    throw error;
  }
};

/**
 * Trigger GDPR cleanup
 */
export const triggerCleanup = async (): Promise<CleanupResult> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/cleanup`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler bei der Bereinigung');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error triggering cleanup:', error);
    throw error;
  }
};

/**
 * Soft delete a user
 */
export const softDeleteUser = async (userId: string, reason: string = 'User requested deletion'): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/soft-delete/user/${userId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error('Fehler bei der Benutzerlöschung');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error soft deleting user:', error);
    throw error;
  }
};

/**
 * Soft delete a child
 */
export const softDeleteChild = async (childId: string, reason: string = 'Child left institution'): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/soft-delete/child/${childId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error('Fehler bei der Kinderlöschung');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error soft deleting child:', error);
    throw error;
  }
};

/**
 * Soft delete a group
 */
export const softDeleteGroup = async (groupId: string, reason: string = 'Group deleted'): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/soft-delete/group/${groupId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error('Fehler bei der Gruppenlöschung');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error soft deleting group:', error);
    throw error;
  }
};

/**
 * Soft delete an institution
 */
export const softDeleteInstitution = async (institutionId: string, reason: string = 'Institution closed'): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/soft-delete/institution/${institutionId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error('Fehler bei der Institutionslöschung');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error soft deleting institution:', error);
    throw error;
  }
};

/**
 * Get deletion requests
 */
export const getDeletionRequests = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/requests`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Löschungsanfragen');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching deletion requests:', error);
    throw error;
  }
};

/**
 * Approve deletion request
 */
export const approveDeletionRequest = async (requestId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/requests/${requestId}/approve`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler bei der Genehmigung der Löschungsanfrage');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error approving deletion request:', error);
    throw error;
  }
};

/**
 * Reject deletion request
 */
export const rejectDeletionRequest = async (requestId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/requests/${requestId}/reject`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler bei der Ablehnung der Löschungsanfrage');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error rejecting deletion request:', error);
    throw error;
  }
};

/**
 * Export user data
 */
export const exportUserData = async (userId: string): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/export/${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler beim Datenexport');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};

/**
 * Generate automated compliance report
 */
export const generateComplianceReport = async (institutionId?: string, dateRange: string = 'month'): Promise<ComplianceReport> => {
  try {
    const params = new URLSearchParams();
    if (institutionId) params.append('institutionId', institutionId);
    params.append('dateRange', dateRange);

    const response = await fetch(`${API_BASE}/api/gdpr/compliance-report?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler beim Generieren des Compliance-Reports');
    }

    const data = await response.json();
    return data.report;
  } catch (error) {
    console.error('Error generating compliance report:', error);
    throw error;
  }
};

/**
 * Verify backup integrity
 */
export const verifyBackupIntegrity = async (): Promise<BackupVerification> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/verify-backup`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler bei der Backup-Verifizierung');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying backup integrity:', error);
    throw error;
  }
};

/**
 * Implement privacy-by-design measures
 */
export const implementPrivacyByDesign = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/privacy-by-design`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler bei der Privacy-by-Design Implementierung');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error implementing privacy-by-design:', error);
    throw error;
  }
};

/**
 * Monitor compliance in real-time
 */
export const monitorComplianceRealTime = async (): Promise<ComplianceMonitoring> => {
  try {
    const response = await fetch(`${API_BASE}/api/gdpr/monitor-compliance`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler beim Compliance-Monitoring');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error monitoring compliance:', error);
    throw error;
  }
};

/**
 * Get anomaly detection results
 */
export const getAnomalyDetection = async (institutionId?: string, dateRange: string = 'week'): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (institutionId) params.append('institutionId', institutionId);
    params.append('dateRange', dateRange);

    const response = await fetch(`${API_BASE}/api/gdpr/anomaly-detection?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler bei der Anomalie-Erkennung');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting anomaly detection:', error);
    throw error;
  }
};

/**
 * Get compliance recommendations
 */
export const getComplianceRecommendations = async (institutionId?: string): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (institutionId) params.append('institutionId', institutionId);

    const response = await fetch(`${API_BASE}/api/gdpr/recommendations?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Compliance-Empfehlungen');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting compliance recommendations:', error);
    throw error;
  }
};

/**
 * Get compliance score
 */
export const getComplianceScore = async (institutionId?: string): Promise<number> => {
  try {
    const params = new URLSearchParams();
    if (institutionId) params.append('institutionId', institutionId);

    const response = await fetch(`${API_BASE}/api/gdpr/compliance-score?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Fehler beim Abrufen des Compliance-Scores');
    }

    const data = await response.json();
    return data.score;
  } catch (error) {
    console.error('Error getting compliance score:', error);
    throw error;
  }
}; 