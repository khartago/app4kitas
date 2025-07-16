import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  getPendingDeletions, 
  getGDPRAuditLogs, 
  getRetentionPeriods, 
  triggerCleanup as triggerCleanupApi,
  softDeleteUser,
  softDeleteChild,
  softDeleteGroup,
  softDeleteInstitution,
  generateComplianceReport,
  verifyBackupIntegrity,
  implementPrivacyByDesign,
  monitorComplianceRealTime,
  getAnomalyDetection,
  getComplianceRecommendations,
  getComplianceScore
} from '../../services/gdprApi';
import { useUser } from '../../components/UserContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Modern styled components with proper theming
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
  font-family: ${props => props.theme.typography.fontFamily};
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}15, ${props => props.theme.colors.accent}10);
  border-radius: 20px;
  margin: 0 0 2rem 0;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
    padding: 1.5rem 0;
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.headline1.fontSize};
  font-weight: ${props => props.theme.typography.headline1.fontWeight};
  margin-bottom: 1rem;
  line-height: 1.2;
  letter-spacing: ${props => props.theme.typography.headline1.letterSpacing};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.subtitle1.fontSize};
  margin-bottom: 2rem;
  line-height: 1.5;
  font-weight: ${props => props.theme.typography.subtitle1.fontWeight};
`;

const TabContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 2px solid ${props => props.theme.colors.border};
  margin-bottom: 2rem;
  background: ${props => props.theme.colors.surface};
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  box-shadow: ${props => props.theme.components.card.boxShadow};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    border-radius: 12px 12px 0 0;
  }
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 1rem 1.5rem;
  border: none;
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.textPrimary};
  cursor: pointer;
  font-weight: 600;
  font-size: ${props => props.theme.typography.body2.fontSize};
  transition: all ${props => props.theme.animations.defaultDuration}ms ${props => props.theme.animations.transitionCurves.easeInOut};
  position: relative;
  flex: 1;
  min-width: 120px;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surfaceHover};
    transform: ${props => props.theme.components.button.hoverTransform};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.active ? props.theme.colors.accent : 'transparent'};
    transition: all ${props => props.theme.animations.defaultDuration}ms ${props => props.theme.animations.transitionCurves.easeInOut};
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: ${props => props.theme.typography.caption.fontSize};
    min-width: 100px;
  }
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
  background: ${props => props.theme.colors.surface};
  padding: 2rem;
  border-radius: ${props => props.theme.components.card.borderRadius};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.components.card.boxShadow};
  transition: all ${props => props.theme.animations.defaultDuration}ms ${props => props.theme.animations.transitionCurves.easeInOut};
  
  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.headline3.fontSize};
  font-weight: ${props => props.theme.typography.headline3.fontWeight};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: ${props => props.theme.typography.headline3.letterSpacing};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: ${props => props.theme.typography.headline4.fontSize};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  border-radius: ${props => props.theme.components.table.borderRadius};
  overflow: hidden;
  box-shadow: ${props => props.theme.components.table.boxShadow};
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.typography.caption.fontSize};
  }
`;

const TableHeader = styled.th`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: ${props => props.theme.typography.body2.fontSize};
  
  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: background-color ${props => props.theme.animations.defaultDuration}ms ${props => props.theme.animations.transitionCurves.easeInOut};
  
  &:hover {
    background: ${props => props.theme.colors.tableRowHover};
  }
  
  &:nth-child(even) {
    background: ${props => props.theme.colors.tableStriped};
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  vertical-align: top;
  font-size: ${props => props.theme.typography.body2.fontSize};
  
  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
  }
`;

const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.components.button.padding};
  border-radius: ${props => props.theme.components.button.borderRadius};
  cursor: pointer;
  font-weight: ${props => props.theme.components.button.fontWeight};
  font-size: ${props => props.theme.components.button.fontSize};
  transition: all ${props => props.theme.components.button.transition};
  box-shadow: ${props => props.theme.components.button.boxShadow};
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: ${props => props.theme.components.button.hoverTransform};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    background: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: ${props => props.theme.colors.primary};
  border: 2px solid ${props => props.theme.colors.primary};
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
  }
`;

const DangerButton = styled(Button)`
  background: ${props => props.theme.colors.error};
  
  &:hover {
    background: #c82333;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme.colors.surfaceAlt};
  border-radius: ${props => props.theme.components.card.borderRadius};
  border: 1px solid ${props => props.theme.colors.border};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  font-size: ${props => props.theme.typography.body2.fontSize};
`;

const Input = styled.input`
  padding: ${props => props.theme.components.input.padding};
  border-radius: ${props => props.theme.components.input.borderRadius};
  border: 1px solid ${props => props.theme.components.input.borderColor};
  background: ${props => props.theme.components.input.background};
  color: ${props => props.theme.components.input.color};
  font-size: ${props => props.theme.components.input.fontSize};
  transition: all ${props => props.theme.animations.defaultDuration}ms ${props => props.theme.animations.transitionCurves.easeInOut};
  
  &:focus {
    border-color: ${props => props.theme.colors.accent};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.accent}22;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.status) {
      case 'urgent': return props.theme.colors.error + '20';
      case 'warning': return props.theme.colors.warning + '20';
      case 'success': return props.theme.colors.success + '20';
      case 'approved': return props.theme.colors.success + '20';
      case 'rejected': return props.theme.colors.error + '20';
      case 'pending': return props.theme.colors.warning + '20';
      default: return props.theme.colors.info + '20';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'urgent': return props.theme.colors.error;
      case 'warning': return props.theme.colors.warning;
      case 'success': return props.theme.colors.success;
      case 'approved': return props.theme.colors.success;
      case 'rejected': return props.theme.colors.error;
      case 'pending': return props.theme.colors.warning;
      default: return props.theme.colors.info;
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'urgent': return props.theme.colors.error;
      case 'warning': return props.theme.colors.warning;
      case 'success': return props.theme.colors.success;
      case 'approved': return props.theme.colors.success;
      case 'rejected': return props.theme.colors.error;
      case 'pending': return props.theme.colors.warning;
      default: return props.theme.colors.info;
    }
  }};
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error}15;
  color: ${props => props.theme.colors.error};
  padding: 1rem;
  border-radius: ${props => props.theme.components.card.borderRadius};
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.theme.colors.error};
`;

const SuccessMessage = styled.div`
  background: ${props => props.theme.colors.success}15;
  color: ${props => props.theme.colors.success};
  padding: 1rem;
  border-radius: ${props => props.theme.components.card.borderRadius};
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.theme.colors.success};
`;

const Badge = styled.span<{ status: 'urgent' | 'warning' | 'normal' | 'success' | 'error' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.status) {
      case 'urgent': return props.theme.colors.error + '20';
      case 'warning': return props.theme.colors.warning + '20';
      case 'success': return props.theme.colors.success + '20';
      case 'error': return props.theme.colors.error + '20';
      default: return props.theme.colors.info + '20';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'urgent': return props.theme.colors.error;
      case 'warning': return props.theme.colors.warning;
      case 'success': return props.theme.colors.success;
      case 'error': return props.theme.colors.error;
      default: return props.theme.colors.info;
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'urgent': return props.theme.colors.error;
      case 'warning': return props.theme.colors.warning;
      case 'success': return props.theme.colors.success;
      case 'error': return props.theme.colors.error;
      default: return props.theme.colors.info;
    }
  }};
`;

const ComplianceCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.components.card.borderRadius};
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.components.card.boxShadow};
  transition: all ${props => props.theme.animations.defaultDuration}ms ${props => props.theme.animations.transitionCurves.easeInOut};
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const ComplianceScore = styled.div<{ score: number }>`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: ${props => props.theme.components.card.borderRadius};
  background: ${props => {
    if (props.score >= 80) return props.theme.colors.success + '15';
    if (props.score >= 60) return props.theme.colors.warning + '15';
    return props.theme.colors.error + '15';
  }};
  border: 2px solid ${props => {
    if (props.score >= 80) return props.theme.colors.success;
    if (props.score >= 60) return props.theme.colors.warning;
    return props.theme.colors.error;
  }};
  margin-bottom: 1.5rem;
  transition: all ${props => props.theme.animations.defaultDuration}ms ${props => props.theme.animations.transitionCurves.easeInOut};
  
  &:hover {
    transform: scale(1.02);
  }
`;

const ScoreCircle = styled.div<{ score: number }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  color: white;
  background: ${props => {
    if (props.score >= 80) return props.theme.colors.success;
    if (props.score >= 60) return props.theme.colors.warning;
    return props.theme.colors.error;
  }};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all ${props => props.theme.animations.defaultDuration}ms ${props => props.theme.animations.transitionCurves.easeInOut};
  
  &:hover {
    transform: scale(1.1);
  }
`;

const AlertBox = styled.div<{ severity: string }>`
  padding: 1.25rem;
  border-radius: ${props => props.theme.components.card.borderRadius};
  margin-bottom: 1rem;
  background: ${props => {
    switch (props.severity) {
      case 'HIGH': return props.theme.colors.error + '15';
      case 'MEDIUM': return props.theme.colors.warning + '15';
      case 'LOW': return props.theme.colors.info + '15';
      default: return props.theme.colors.surface;
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'HIGH': return props.theme.colors.error;
      case 'MEDIUM': return props.theme.colors.warning;
      case 'LOW': return props.theme.colors.info;
      default: return props.theme.colors.border;
    }
  }};
  transition: all ${props => props.theme.animations.defaultDuration}ms ${props => props.theme.animations.transitionCurves.easeInOut};
  
  &:hover {
    transform: translateX(4px);
  }
`;

const RecommendationCard = styled.div<{ priority: string }>`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.components.card.borderRadius};
  padding: 1.25rem;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'HIGH': return props.theme.colors.error;
      case 'MEDIUM': return props.theme.colors.warning;
      case 'LOW': return props.theme.colors.info;
      default: return props.theme.colors.border;
    }
  }};
  box-shadow: ${props => props.theme.components.card.boxShadow};
  transition: all ${props => props.theme.animations.defaultDuration}ms ${props => props.theme.animations.transitionCurves.easeInOut};
  
  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.components.card.borderRadius};
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.components.card.boxShadow};
  transition: all ${props => props.theme.animations.defaultDuration}ms ${props => props.theme.animations.transitionCurves.easeInOut};
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.body2.fontSize};
  font-weight: 500;
`;

const ProgressBar = styled.div<{ progress: number; color: string }>`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
  margin: 1rem 0;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.progress}%;
    background: ${props => props.color};
    border-radius: 4px;
    transition: width ${props => props.theme.animations.defaultDuration}ms ${props => props.theme.animations.transitionCurves.easeInOut};
  }
`;

// Types
interface PendingDeletion {
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

interface AuditLog {
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

interface DeletionRequest {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface RetentionPeriods {
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

interface ComplianceReport {
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

interface BackupVerification {
  success: boolean;
  verificationResults: Array<{
    type: string;
    success: boolean;
    details: any;
    timestamp: string;
  }>;
  timestamp: string;
}

interface ComplianceMonitoring {
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

type TabType = 'audit' | 'deletions' | 'requests' | 'export' | 'cleanup' | 'compliance' | 'backup' | 'privacy' | 'monitoring';

const GDPRCompliancePage: React.FC = () => {
  const navigate = useNavigate();
  const { benutzer } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('audit');
  const [pendingDeletions, setPendingDeletions] = useState<PendingDeletion[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [retentionPeriods, setRetentionPeriods] = useState<RetentionPeriods | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  
  // Filter states
  const [auditFilters, setAuditFilters] = useState({
    dateFrom: '',
    dateTo: '',
    action: '',
    user: ''
  });
  
  // Export form state
  const [exportForm, setExportForm] = useState({
    userId: '',
    email: ''
  });
  
  // Cleanup form state
  const [cleanupForm, setCleanupForm] = useState({
    months: 12
  });

  // New state variables for advanced features
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [backupVerification, setBackupVerification] = useState<BackupVerification | null>(null);
  const [complianceMonitoring, setComplianceMonitoring] = useState<ComplianceMonitoring | null>(null);
  const [complianceScore, setComplianceScore] = useState<number>(0);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [privacyByDesignStatus, setPrivacyByDesignStatus] = useState<string>('');
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchData();
        await fetchAdvancedData(); // Add advanced data fetching
      } catch (error) {
        console.error('Error loading GDPR data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [deletionsData, logsData, periodsData] = await Promise.all([
        getPendingDeletions(),
        getGDPRAuditLogs(100),
        getRetentionPeriods()
      ]);

      setPendingDeletions(deletionsData);
      setAuditLogs(logsData);
      setRetentionPeriods(periodsData);
      
      // Mock deletion requests data (replace with actual API call)
      setDeletionRequests([
        {
          id: '1',
          userId: 'user1',
          user: { name: 'Max Mustermann', email: 'max@example.com', role: 'PARENT' },
          reason: 'Account deletion requested by user',
          status: 'PENDING',
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportForm.userId) {
      setError('Bitte geben Sie eine User-ID ein');
      return;
    }

    try {
      setLoading(true);
      const identifier = exportForm.userId;
      const response = await fetch(`/api/gdpr/export/${identifier}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Export fehlgeschlagen');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gdpr-export-${identifier}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Datenexport erfolgreich heruntergeladen');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCleanup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCleanupLoading(true);
      setError(null);

      const result = await triggerCleanupApi();
      setCleanupResult(`Bereinigung abgeschlossen. ${result.deletedCount} Datensätze permanent gelöscht.`);
      
      // Refresh data after cleanup
      setTimeout(() => {
        fetchData();
        setCleanupResult(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bereinigung fehlgeschlagen');
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/gdpr/requests/${requestId}/approve`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Genehmigung fehlgeschlagen');
      }
      
      setSuccess('Löschungsanfrage genehmigt');
      fetchData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Genehmigung fehlgeschlagen');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/gdpr/requests/${requestId}/reject`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Ablehnung fehlgeschlagen');
      }
      
      setSuccess('Löschungsanfrage abgelehnt');
      fetchData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ablehnung fehlgeschlagen');
    }
  };

  const getStatusBadge = (days: number): { status: 'urgent' | 'warning' | 'normal'; text: string } => {
    if (days <= 7) return { status: 'urgent', text: 'Kritisch' };
    if (days <= 30) return { status: 'warning', text: 'Warnung' };
    return { status: 'normal', text: 'Normal' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditFilters.dateFrom && new Date(log.createdAt) < new Date(auditFilters.dateFrom)) return false;
    if (auditFilters.dateTo && new Date(log.createdAt) > new Date(auditFilters.dateTo)) return false;
    if (auditFilters.action && !log.action.toLowerCase().includes(auditFilters.action.toLowerCase())) return false;
    if (auditFilters.user && !log.user.name.toLowerCase().includes(auditFilters.user.toLowerCase())) return false;
    return true;
  });

  const fetchAdvancedData = async () => {
    try {
      // Fetch compliance report
      const report = await generateComplianceReport();
      setComplianceReport(report);
      setComplianceScore(report.complianceScore);

      // Fetch backup verification
      const backup = await verifyBackupIntegrity();
      setBackupVerification(backup);

      // Fetch real-time monitoring
      const monitoring = await monitorComplianceRealTime();
      setComplianceMonitoring(monitoring);

      // Fetch anomalies
      const anomalyData = await getAnomalyDetection();
      setAnomalies(anomalyData.anomalies || []);

      // Fetch recommendations
      const recData = await getComplianceRecommendations();
      setRecommendations(recData.recommendations || []);

    } catch (error) {
      console.error('Error fetching advanced GDPR data:', error);
    }
  };

  const handlePrivacyByDesign = async () => {
    try {
      setPrivacyByDesignStatus('Implementierung läuft...');
      const result = await implementPrivacyByDesign();
      setPrivacyByDesignStatus('Privacy-by-Design erfolgreich implementiert');
      
      // Refresh data after implementation
      await fetchAdvancedData();
    } catch (error) {
      console.error('Error implementing privacy-by-design:', error);
      setPrivacyByDesignStatus('Fehler bei der Implementierung');
    }
  };

  const renderComplianceTab = () => (
    <Section>
      <SectionTitle>📊 Automatisierte Compliance-Reports</SectionTitle>
      
      {complianceReport && (
        <ComplianceCard>
          <ComplianceScore score={complianceScore}>
            <ScoreCircle score={complianceScore}>
              {complianceScore}
            </ScoreCircle>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 600 }}>
                Compliance Score: {complianceScore}/100
              </h3>
              <p style={{ margin: 0, color: '#666' }}>
                Letzter Report: {new Date(complianceReport.generatedAt).toLocaleString('de-DE')}
              </p>
            </div>
          </ComplianceScore>
          
          <StatsGrid>
            <StatCard>
              <StatValue>{complianceReport.dataProcessingCount}</StatValue>
              <StatLabel>Datenverarbeitung</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{complianceReport.dataDeletionCount}</StatValue>
              <StatLabel>Datenlöschung</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{complianceReport.dataExportCount}</StatValue>
              <StatLabel>Datenexport</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{complianceReport.privacyComplaintsCount}</StatValue>
              <StatLabel>Datenschutzbeschwerden</StatLabel>
            </StatCard>
          </StatsGrid>
        </ComplianceCard>
      )}

      {recommendations.length > 0 && (
        <ComplianceCard>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
            �� Compliance-Empfehlungen
          </h4>
          {recommendations.map((rec, index) => (
            <RecommendationCard key={index} priority={rec.priority}>
              <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>
                {rec.category}
              </h5>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                <strong>Empfehlung:</strong> {rec.recommendation}
              </p>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                <strong>Aktion:</strong> {rec.action}
              </p>
              <Badge status={rec.priority === 'HIGH' ? 'error' : rec.priority === 'MEDIUM' ? 'warning' : 'normal'}>
                {rec.priority}
              </Badge>
            </RecommendationCard>
          ))}
        </ComplianceCard>
      )}

      <Button onClick={fetchAdvancedData} style={{ marginTop: '1rem' }}>
        🔄 Compliance-Report aktualisieren
      </Button>
    </Section>
  );

  const renderBackupTab = () => (
    <Section>
      <SectionTitle>💾 Backup-Verifizierung</SectionTitle>
      
      {backupVerification && (
        <ComplianceCard>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
            Backup-Status: {backupVerification.success ? '✅ Erfolgreich' : '❌ Fehler'}
          </h4>
          <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
            Letzte Verifizierung: {new Date(backupVerification.timestamp).toLocaleString('de-DE')}
          </p>
          
          <div style={{ marginTop: '1rem' }}>
            <h5 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600 }}>
              Verifizierungsergebnisse:
            </h5>
            {backupVerification.verificationResults.map((result, index) => (
              <div key={index} style={{ 
                marginBottom: '0.75rem', 
                padding: '0.75rem', 
                background: result.success ? '#f0f9ff' : '#fef2f2',
                borderRadius: '8px',
                border: `1px solid ${result.success ? '#0ea5e9' : '#f87171'}`
              }}>
                <span style={{ fontWeight: 600 }}>{result.type}: </span>
                <span style={{ color: result.success ? '#059669' : '#dc2626' }}>
                  {result.success ? '✅ Erfolgreich' : '❌ Fehler'}
                </span>
              </div>
            ))}
          </div>
        </ComplianceCard>
      )}

      <Button onClick={async () => {
        try {
          const backup = await verifyBackupIntegrity();
          setBackupVerification(backup);
        } catch (error) {
          console.error('Error verifying backup:', error);
        }
      }}>
        🔍 Backup-Verifizierung starten
      </Button>
    </Section>
  );

  const renderPrivacyTab = () => (
    <Section>
      <SectionTitle>🔒 Privacy-by-Design</SectionTitle>
      
      <ComplianceCard>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
          Privacy-by-Design Implementierung
        </h4>
        <p style={{ margin: '0 0 1rem 0', lineHeight: '1.6' }}>
          Automatische Implementierung von Datenschutzmaßnahmen:
        </p>
        <ul style={{ margin: '0 0 1.5rem 0', paddingLeft: '1.5rem', lineHeight: '1.6' }}>
          <li>Datenminimierung</li>
          <li>Zweckbindung</li>
          <li>Speicherbegrenzung</li>
          <li>Datenrichtigkeit</li>
          <li>Sicherheitsmaßnahmen</li>
          <li>Rechenschaftspflicht</li>
        </ul>
        
        {privacyByDesignStatus && (
          <AlertBox severity="MEDIUM">
            <strong>Status:</strong> {privacyByDesignStatus}
          </AlertBox>
        )}
        
        <Button onClick={handlePrivacyByDesign} style={{ marginTop: '1rem' }}>
          🚀 Privacy-by-Design implementieren
        </Button>
      </ComplianceCard>
    </Section>
  );

  const renderMonitoringTab = () => (
    <Section>
      <SectionTitle>📈 Echtzeit-Compliance-Monitoring</SectionTitle>
      
      {complianceMonitoring && (
        <ComplianceCard>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
            Monitoring-Status (letzte Stunde)
          </h4>
          
          <StatsGrid>
            <StatCard>
              <StatValue>{complianceMonitoring.processingActivities}</StatValue>
              <StatLabel>Verarbeitungsaktivitäten</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{complianceMonitoring.deletionActivities}</StatValue>
              <StatLabel>Löschaktivitäten</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{complianceMonitoring.privacyComplaints}</StatValue>
              <StatLabel>Datenschutzbeschwerden</StatLabel>
            </StatCard>
          </StatsGrid>
          
          <p style={{ margin: '1rem 0', color: '#666', fontSize: '0.9rem' }}>
            Zeitstempel: {new Date(complianceMonitoring.timestamp).toLocaleString('de-DE')}
          </p>
          
          {complianceMonitoring.alerts.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h5 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600 }}>
                ⚠️ Alerts:
              </h5>
              {complianceMonitoring.alerts.map((alert, index) => (
                <AlertBox key={index} severity={alert.severity}>
                  <strong>{alert.type}:</strong> {alert.message}
                </AlertBox>
              ))}
            </div>
          )}
        </ComplianceCard>
      )}

      {anomalies.length > 0 && (
        <ComplianceCard>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
            🚨 Erkannte Anomalien
          </h4>
          {anomalies.map((anomaly, index) => (
            <AlertBox key={index} severity={anomaly.severity}>
              <strong>{anomaly.type}:</strong> {anomaly.count} Aktivitäten am {new Date(anomaly.date).toLocaleDateString('de-DE')}
              <br />
              <small>Schwellenwert: {anomaly.threshold}</small>
            </AlertBox>
          ))}
        </ComplianceCard>
      )}

      <Button onClick={async () => {
        try {
          const monitoring = await monitorComplianceRealTime();
          setComplianceMonitoring(monitoring);
        } catch (error) {
          console.error('Error monitoring compliance:', error);
        }
      }}>
        🔄 Monitoring aktualisieren
      </Button>
    </Section>
  );

  if (benutzer?.role !== 'SUPER_ADMIN') {
    return <ErrorMessage>Zugriff verweigert</ErrorMessage>;
  }

  if (loading) {
    return (
      <Container>
        <LoadingSpinner text="Lade GDPR-Daten..." />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>🔒 GDPR Compliance Dashboard</Title>
        <Subtitle>Vollständige DSGVO-Compliance-Verwaltung und -Überwachung</Subtitle>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <TabContainer>
        <TabList>
          <Tab active={activeTab === 'audit'} onClick={() => setActiveTab('audit')}>
            📋 Audit-Logs
          </Tab>
          <Tab active={activeTab === 'deletions'} onClick={() => setActiveTab('deletions')}>
            🗑️ Ausstehende Löschungen
          </Tab>
          <Tab active={activeTab === 'requests'} onClick={() => setActiveTab('requests')}>
            📝 Löschungsanfragen
          </Tab>
          <Tab active={activeTab === 'export'} onClick={() => setActiveTab('export')}>
            📤 Datenexport
          </Tab>
          <Tab active={activeTab === 'cleanup'} onClick={() => setActiveTab('cleanup')}>
            🧹 Bereinigung
          </Tab>
          <Tab active={activeTab === 'compliance'} onClick={() => setActiveTab('compliance')}>
            📊 Compliance-Reports
          </Tab>
          <Tab active={activeTab === 'backup'} onClick={() => setActiveTab('backup')}>
            💾 Backup-Verifizierung
          </Tab>
          <Tab active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')}>
            🔒 Privacy-by-Design
          </Tab>
          <Tab active={activeTab === 'monitoring'} onClick={() => setActiveTab('monitoring')}>
            📈 Echtzeit-Monitoring
          </Tab>
        </TabList>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <LoadingSpinner text="Lade GDPR-Daten..." />
          </div>
        ) : (
          <>
            {activeTab === 'audit' && (
              <Section>
                <SectionTitle>📝 Audit-Logs</SectionTitle>
                
                {/* Filters */}
                <Form>
                  <FormGroup>
                    <Label>Von Datum</Label>
                    <Input
                      type="date"
                      value={auditFilters.dateFrom}
                      onChange={(e) => setAuditFilters(f => ({ ...f, dateFrom: e.target.value }))}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Bis Datum</Label>
                    <Input
                      type="date"
                      value={auditFilters.dateTo}
                      onChange={(e) => setAuditFilters(f => ({ ...f, dateTo: e.target.value }))}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Aktion</Label>
                    <Input
                      type="text"
                      placeholder="Aktion filtern..."
                      value={auditFilters.action}
                      onChange={(e) => setAuditFilters(f => ({ ...f, action: e.target.value }))}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Benutzer</Label>
                    <Input
                      type="text"
                      placeholder="Benutzer filtern..."
                      value={auditFilters.user}
                      onChange={(e) => setAuditFilters(f => ({ ...f, user: e.target.value }))}
                    />
                  </FormGroup>
                </Form>

                {filteredAuditLogs.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666' }}>
                    Keine Audit-Logs gefunden.
                  </p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Datum</TableHeader>
                        <TableHeader>Aktion</TableHeader>
                        <TableHeader>Entität</TableHeader>
                        <TableHeader>Benutzer</TableHeader>
                        <TableHeader>Details</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAuditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{formatDate(log.createdAt)}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.entity} ({log.entityId})</TableCell>
                          <TableCell>
                            {log.user.name}
                            <br />
                            <small style={{ color: '#666' }}>{log.user.email}</small>
                          </TableCell>
                          <TableCell>{log.details}</TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Section>
            )}

            {activeTab === 'deletions' && (
              <Section>
                <SectionTitle>🗑️ Ausstehende Löschungen</SectionTitle>
                {pendingDeletions.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666' }}>
                    Keine ausstehenden Löschungen vorhanden.
                  </p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Typ</TableHeader>
                        <TableHeader>Name</TableHeader>
                        <TableHeader>Institution</TableHeader>
                        <TableHeader>Löschung am</TableHeader>
                        <TableHeader>Permanente Löschung</TableHeader>
                        <TableHeader>Status</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDeletions.map((deletion) => {
                        const status = getStatusBadge(deletion.daysUntilPermanentDeletion);
                        return (
                          <TableRow key={deletion.id}>
                            <TableCell>{deletion.type}</TableCell>
                            <TableCell>
                              {deletion.name}
                              {deletion.email && <br />}
                              {deletion.email && <small style={{ color: '#666' }}>{deletion.email}</small>}
                            </TableCell>
                            <TableCell>{deletion.institution}</TableCell>
                            <TableCell>{formatDate(deletion.deletedAt)}</TableCell>
                            <TableCell>{formatDate(deletion.retentionDate)}</TableCell>
                            <TableCell>
                              <StatusBadge status={status.status}>
                                {status.text} ({deletion.daysUntilPermanentDeletion} Tage)
                              </StatusBadge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </Section>
            )}

            {activeTab === 'requests' && (
              <Section>
                <SectionTitle>📋 Löschungsanfragen</SectionTitle>
                {deletionRequests.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666' }}>
                    Keine Löschungsanfragen vorhanden.
                  </p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Benutzer</TableHeader>
                        <TableHeader>Grund</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Erstellt am</TableHeader>
                        <TableHeader>Aktionen</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {deletionRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            {request.user.name}
                            <br />
                            <small style={{ color: '#666' }}>{request.user.email}</small>
                          </TableCell>
                          <TableCell>{request.reason}</TableCell>
                          <TableCell>
                            <StatusBadge status={request.status.toLowerCase() as 'pending' | 'approved' | 'rejected'}>
                              {request.status}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>{formatDate(request.createdAt)}</TableCell>
                          <TableCell>
                            {request.status === 'PENDING' && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button
                                  onClick={() => handleApproveRequest(request.id)}
                                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                >
                                  Genehmigen
                                </Button>
                                <DangerButton
                                  onClick={() => handleRejectRequest(request.id)}
                                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                >
                                  Ablehnen
                                </DangerButton>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Section>
            )}

            {activeTab === 'export' && (
              <Section>
                <SectionTitle>📤 Datenexport</SectionTitle>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  Exportieren Sie alle personenbezogenen Daten eines Benutzers im JSON-Format.
                </p>
                
                <Form onSubmit={handleExportData}>
                  <FormGroup>
                    <Label>User-ID</Label>
                    <Input
                      type="text"
                      placeholder="User-ID eingeben..."
                      value={exportForm.userId}
                      onChange={(e) => setExportForm(f => ({ ...f, userId: e.target.value }))}
                      required
                    />
                  </FormGroup>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Exportiere...' : 'Daten exportieren'}
                  </Button>
                </Form>
              </Section>
            )}

            {activeTab === 'cleanup' && (
              <Section>
                <SectionTitle>🧹 Bereinigung</SectionTitle>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                  Manuell abgelaufene Datensätze bereinigen.
                </p>
                
                <Form onSubmit={handleManualCleanup}>
                  <FormGroup>
                    <Label>Monate zurück</Label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={cleanupForm.months}
                      onChange={(e) => setCleanupForm(f => ({ ...f, months: parseInt(e.target.value) }))}
                      required
                    />
                  </FormGroup>
                  <Button type="submit" disabled={cleanupLoading}>
                    {cleanupLoading ? 'Bereinigung läuft...' : '🧹 Bereinigung starten'}
                  </Button>
                </Form>
                
                {cleanupResult && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
                    <strong>Bereinigungsergebnis:</strong> {cleanupResult}
                  </div>
                )}
              </Section>
            )}

            {activeTab === 'compliance' && renderComplianceTab()}
            {activeTab === 'backup' && renderBackupTab()}
            {activeTab === 'privacy' && renderPrivacyTab()}
            {activeTab === 'monitoring' && renderMonitoringTab()}
          </>
        )}
      </TabContainer>

      <ButtonGroup>
        <Button onClick={() => navigate('/super-admin/dashboard')}>
          Zurück zum Dashboard
        </Button>
        <SecondaryButton onClick={fetchData}>
          Daten aktualisieren
        </SecondaryButton>
      </ButtonGroup>
    </Container>
  );
};

export default GDPRCompliancePage; 