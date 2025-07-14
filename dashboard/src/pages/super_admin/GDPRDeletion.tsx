import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  getPendingDeletions, 
  getGDPRAuditLogs, 
  getRetentionPeriods, 
  triggerCleanup as triggerCleanupApi 
} from '../../services/gdprApi';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
    padding: 1rem 0;
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.primary};
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: clamp(1rem, 3vw, 1.2rem);
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const StatNumber = styled.div`
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  font-weight: 500;
`;

const Section = styled.section`
  margin-bottom: 3rem;
  background: ${props => props.theme.colors.surface};
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.primary};
  font-size: clamp(1.2rem, 4vw, 1.5rem);
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const TableHeader = styled.th`
  background: ${props => props.theme.colors.primary}10;
  color: ${props => props.theme.colors.primary};
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid ${props => props.theme.colors.border};
  
  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${props => props.theme.colors.textPrimary};
  
  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'urgent': return '#ff4444';
      case 'warning': return '#ff8800';
      case 'normal': return '#00aa00';
      default: return props.theme.colors.border;
    }
  }};
  color: white;
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.theme.colors.primary};
  color: white;
  width: 100%;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: ${props => props.theme.colors.primary};
  font-size: 1.2rem;
`;

const ErrorMessage = styled.div`
  background: #ff4444;
  color: white;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: #00aa00;
  color: white;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
`;

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

const GDPRDeletion: React.FC = () => {
  const navigate = useNavigate();
  const [pendingDeletions, setPendingDeletions] = useState<PendingDeletion[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [retentionPeriods, setRetentionPeriods] = useState<RetentionPeriods | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [deletionsData, logsData, periodsData] = await Promise.all([
        getPendingDeletions(),
        getGDPRAuditLogs(50),
        getRetentionPeriods()
      ]);

      setPendingDeletions(deletionsData);
      setAuditLogs(logsData);
      setRetentionPeriods(periodsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const triggerCleanup = async () => {
    try {
      setCleanupLoading(true);
      setError(null);

      const result = await triggerCleanupApi();
      setSuccess(result.message);
      
      // Refresh data after cleanup
      setTimeout(() => {
        fetchData();
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setCleanupLoading(false);
    }
  };

  const getStatusBadge = (days: number) => {
    if (days <= 7) return { status: 'urgent', text: 'Kritisch' };
    if (days <= 30) return { status: 'warning', text: 'Warnung' };
    return { status: 'normal', text: 'Normal' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStats = () => {
    const urgent = pendingDeletions.filter(d => d.daysUntilPermanentDeletion <= 7).length;
    const warning = pendingDeletions.filter(d => d.daysUntilPermanentDeletion > 7 && d.daysUntilPermanentDeletion <= 30).length;
    const normal = pendingDeletions.filter(d => d.daysUntilPermanentDeletion > 30).length;
    const total = pendingDeletions.length;

    return { urgent, warning, normal, total };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Lade GDPR-Daten...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>GDPR-Löschungsverwaltung</Title>
        <Subtitle>
          Verwaltung von Datenlöschungen und DSGVO-Compliance
        </Subtitle>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>Ausstehende Löschungen</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.urgent}</StatNumber>
          <StatLabel>Kritische Löschungen</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.warning}</StatNumber>
          <StatLabel>Warnungen</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.normal}</StatNumber>
          <StatLabel>Normale Löschungen</StatLabel>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>📋 Ausstehende Löschungen</SectionTitle>
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

      <Section>
        <SectionTitle>📊 Aufbewahrungsfristen</SectionTitle>
        {retentionPeriods && (
          <Table>
            <thead>
              <tr>
                <TableHeader>Datentyp</TableHeader>
                <TableHeader>Aufbewahrungsfrist</TableHeader>
                <TableHeader>Beschreibung</TableHeader>
              </tr>
            </thead>
            <tbody>
              <TableRow>
                <TableCell>Benutzer</TableCell>
                <TableCell>{retentionPeriods.USER} Tage</TableCell>
                <TableCell>Nach Kontolöschung</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Kinder</TableCell>
                <TableCell>{retentionPeriods.CHILD} Tage</TableCell>
                <TableCell>Nach Austritt aus der Institution</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Gruppen</TableCell>
                <TableCell>{retentionPeriods.GROUP} Tage</TableCell>
                <TableCell>Nach Gruppenlöschung</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Institutionen</TableCell>
                <TableCell>{retentionPeriods.INSTITUTION} Tage</TableCell>
                <TableCell>Nach Institutionsschließung</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Notizen</TableCell>
                <TableCell>{retentionPeriods.NOTE} Tage</TableCell>
                <TableCell>Nach Notizlöschung</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Nachrichten</TableCell>
                <TableCell>{retentionPeriods.MESSAGE} Tage</TableCell>
                <TableCell>Nach Nachrichtenlöschung</TableCell>
              </TableRow>
            </tbody>
          </Table>
        )}
      </Section>

      <Section>
        <SectionTitle>📝 Audit-Logs</SectionTitle>
        {auditLogs.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>
            Keine Audit-Logs vorhanden.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <TableHeader>Datum</TableHeader>
                <TableHeader>Aktion</TableHeader>
                <TableHeader>Benutzer</TableHeader>
                <TableHeader>Details</TableHeader>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDate(log.createdAt)}</TableCell>
                  <TableCell>{log.action}</TableCell>
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

      <ButtonGroup>
        <Button onClick={() => navigate('/super-admin/dashboard')}>
          Zurück zum Dashboard
        </Button>
        <SecondaryButton onClick={fetchData}>
          Daten aktualisieren
        </SecondaryButton>
        <Button 
          onClick={triggerCleanup}
          disabled={cleanupLoading}
        >
          {cleanupLoading ? 'Bereinigung läuft...' : 'Bereinigung auslösen'}
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default GDPRDeletion; 