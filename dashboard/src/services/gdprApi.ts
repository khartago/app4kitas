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