import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import {
  getGdprStatus,
  downloadDataExport,
  downloadDataPortability,
  requestAccountDeletion,
  requestDataRestriction,
  requestDataObjection,
  GDPRStatus
} from '../services/gdprApi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: ${theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  color: ${theme.colors.primary};
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: 1.1rem;
  line-height: 1.6;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.h3`
  color: ${theme.colors.primary};
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardDescription = styled.p`
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${props => {
    switch (props.variant) {
      case 'danger': return theme.colors.error;
      case 'secondary': return theme.colors.secondary;
      default: return theme.colors.primary;
    }
  }};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0.5rem;

  &:hover {
    background: ${props => {
      switch (props.variant) {
        case 'danger': return theme.colors.errorDark;
        case 'secondary': return theme.colors.secondaryDark;
        default: return theme.colors.primaryDark;
      }
    }};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatusItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: ${theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${theme.colors.border};
`;

const StatusValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatusLabel = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActivityList = styled.div`
  margin-top: 1rem;
`;

const ActivityItem = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityText = styled.span`
  color: ${theme.colors.textPrimary};
  font-size: 0.9rem;
`;

const ActivityDate = styled.span`
  color: ${theme.colors.textSecondary};
  font-size: 0.8rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: ${theme.colors.primary};
`;

const ErrorMessage = styled.div`
  background: ${theme.colors.error}20;
  color: ${theme.colors.error};
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border-left: 4px solid ${theme.colors.error};
`;

const SuccessMessage = styled.div`
  background: ${theme.colors.success}20;
  color: ${theme.colors.success};
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border-left: 4px solid ${theme.colors.success};
`;

interface GdprDashboardProps {
  userId: string;
}

const GdprDashboard: React.FC<GdprDashboardProps> = ({ userId }) => {
  const [status, setStatus] = useState<GDPRStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadGdprStatus();
  }, [userId]);

  const loadGdprStatus = async () => {
    try {
      setLoading(true);
      const gdprStatus = await getGdprStatus(userId);
      setStatus(gdprStatus);
    } catch (err) {
      setError('Fehler beim Laden des DSGVO-Status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    try {
      setActionLoading('export');
      await downloadDataExport(userId);
      setSuccess('Datenexport erfolgreich heruntergeladen');
    } catch (err) {
      setError('Fehler beim Datenexport');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDataPortability = async () => {
    try {
      setActionLoading('portability');
      await downloadDataPortability(userId);
      setSuccess('Datenportabilität erfolgreich heruntergeladen');
    } catch (err) {
      setError('Fehler bei Datenportabilität');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      setActionLoading('deletion');
      await requestAccountDeletion(userId);
      setSuccess('Konto erfolgreich gelöscht');
      // Redirect to logout or landing page
      window.location.href = '/';
    } catch (err) {
      if (err instanceof Error && err.message !== 'Kontolöschung abgebrochen') {
        setError('Fehler bei Kontolöschung');
      }
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDataRestriction = async () => {
    try {
      setActionLoading('restriction');
      const reason = prompt('Grund für die Datenbeschränkung:');
      if (reason) {
        const duration = parseInt(prompt('Dauer in Tagen (Standard: 30):') || '30');
        await requestDataRestriction(userId, reason, duration);
        setSuccess('Datenbeschränkung erfolgreich angewendet');
        loadGdprStatus(); // Reload status
      }
    } catch (err) {
      if (err instanceof Error && err.message !== 'Datenbeschränkung abgebrochen') {
        setError('Fehler bei Datenbeschränkung');
      }
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDataObjection = async () => {
    try {
      setActionLoading('objection');
      const processingType = prompt('Verarbeitungstyp (z.B. "Marketing", "Analytics"):');
      if (processingType) {
        const reason = prompt('Grund für den Widerspruch:');
        if (reason) {
          await requestDataObjection(userId, reason, processingType);
          setSuccess('Widerspruch erfolgreich eingereicht');
          loadGdprStatus(); // Reload status
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message !== 'Widerspruch abgebrochen') {
        setError('Fehler bei Widerspruch');
      }
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Lade DSGVO-Status...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>DSGVO-Dashboard</Title>
        <Subtitle>
          Verwalten Sie Ihre Datenschutzrechte und -einstellungen
        </Subtitle>
      </Header>

      {error && (
        <ErrorMessage>
          {error}
          <Button onClick={() => setError(null)} style={{ marginLeft: '1rem' }}>
            Schließen
          </Button>
        </ErrorMessage>
      )}

      {success && (
        <SuccessMessage>
          {success}
          <Button onClick={() => setSuccess(null)} style={{ marginLeft: '1rem' }}>
            Schließen
          </Button>
        </SuccessMessage>
      )}

      {status && (
        <StatusCard>
          <CardTitle>📊 DSGVO-Status</CardTitle>
          <StatusGrid>
            <StatusItem>
              <StatusValue>{status.activeRestrictions}</StatusValue>
              <StatusLabel>Aktive Beschränkungen</StatusLabel>
            </StatusItem>
            <StatusItem>
              <StatusValue>{status.pendingObjections}</StatusValue>
              <StatusLabel>Ausstehende Widersprüche</StatusLabel>
            </StatusItem>
            <StatusItem>
              <StatusValue>{status.recentGdprActivities.length}</StatusValue>
              <StatusLabel>Letzte Aktivitäten</StatusLabel>
            </StatusItem>
          </StatusGrid>

          {status.recentGdprActivities.length > 0 && (
            <ActivityList>
              <h4>Letzte DSGVO-Aktivitäten:</h4>
              {status.recentGdprActivities.map((activity, index) => (
                <ActivityItem key={index}>
                  <ActivityText>{activity.details}</ActivityText>
                  <ActivityDate>
                    {new Date(activity.createdAt).toLocaleDateString('de-DE')}
                  </ActivityDate>
                </ActivityItem>
              ))}
            </ActivityList>
          )}
        </StatusCard>
      )}

      <Grid>
        <Card>
          <CardTitle>📤 Datenexport</CardTitle>
          <CardDescription>
            Exportieren Sie alle Ihre personenbezogenen Daten in einem strukturierten Format.
            Dies entspricht Ihrem Recht auf Auskunft (Art. 15 DSGVO).
          </CardDescription>
          <Button
            onClick={handleDataExport}
            disabled={actionLoading === 'export'}
          >
            {actionLoading === 'export' ? 'Exportiere...' : 'Daten exportieren'}
          </Button>
        </Card>

        <Card>
          <CardTitle>🔄 Datenportabilität</CardTitle>
          <CardDescription>
            Laden Sie Ihre Daten in einem maschinenlesbaren Format herunter.
            Dies entspricht Ihrem Recht auf Datenportabilität (Art. 20 DSGVO).
          </CardDescription>
          <Button
            onClick={handleDataPortability}
            disabled={actionLoading === 'portability'}
            variant="secondary"
          >
            {actionLoading === 'portability' ? 'Lade herunter...' : 'Daten herunterladen'}
          </Button>
        </Card>

        <Card>
          <CardTitle>🚫 Datenbeschränkung</CardTitle>
          <CardDescription>
            Beschränken Sie die Verarbeitung Ihrer Daten für einen bestimmten Zeitraum.
            Dies entspricht Ihrem Recht auf Einschränkung (Art. 18 DSGVO).
          </CardDescription>
          <Button
            onClick={handleDataRestriction}
            disabled={actionLoading === 'restriction'}
            variant="secondary"
          >
            {actionLoading === 'restriction' ? 'Verarbeite...' : 'Daten beschränken'}
          </Button>
        </Card>

        <Card>
          <CardTitle>⚠️ Widerspruch</CardTitle>
          <CardDescription>
            Widersprechen Sie der Verarbeitung Ihrer Daten für bestimmte Zwecke.
            Dies entspricht Ihrem Widerspruchsrecht (Art. 21 DSGVO).
          </CardDescription>
          <Button
            onClick={handleDataObjection}
            disabled={actionLoading === 'objection'}
            variant="secondary"
          >
            {actionLoading === 'objection' ? 'Verarbeite...' : 'Widerspruch einlegen'}
          </Button>
        </Card>

        <Card>
          <CardTitle>🗑️ Kontolöschung</CardTitle>
          <CardDescription>
            Löschen Sie Ihr Konto und alle zugehörigen Daten unwiderruflich.
            Dies entspricht Ihrem Recht auf Löschung (Art. 17 DSGVO).
          </CardDescription>
          <Button
            onClick={handleAccountDeletion}
            disabled={actionLoading === 'deletion'}
            variant="danger"
          >
            {actionLoading === 'deletion' ? 'Lösche...' : 'Konto löschen'}
          </Button>
        </Card>

        <Card>
          <CardTitle>📋 Aufbewahrungsfristen</CardTitle>
          <CardDescription>
            Informationen über die Aufbewahrung Ihrer Daten:
          </CardDescription>
          {status && (
            <div>
              <p><strong>Nachrichten:</strong> {status.dataRetention.messages}</p>
              <p><strong>Benachrichtigungen:</strong> {status.dataRetention.notifications}</p>
              <p><strong>Aktivitätsprotokoll:</strong> {status.dataRetention.activityLogs}</p>
              <p><strong>Check-ins:</strong> {status.dataRetention.checkIns}</p>
            </div>
          )}
        </Card>
      </Grid>
    </Container>
  );
};

export default GdprDashboard; 