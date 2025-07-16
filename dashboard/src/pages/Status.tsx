import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Footer from '../components/Footer';
import AppLogo from '../components/ui/AppLogo'; // Added import for AppLogo

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.background} 0%, ${props => props.theme.colors.surface} 100%);
  padding: 0;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  padding: 4rem 2rem 6rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
  
  @media (max-width: 768px) {
    padding: 3rem 1rem 4rem 1rem;
  }
`;

const HeroTitle = styled.h1`
  color: white;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
  z-index: 1;
  letter-spacing: -0.02em;
`;

const HeroSubtitle = styled.p`
  color: rgba(255,255,255,0.9);
  font-size: clamp(1.1rem, 3vw, 1.4rem);
  margin: 0;
  font-weight: 300;
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  transform: translateY(-3rem);
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    transform: translateY(-2rem);
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatusCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.05);
  border: 1px solid ${props => props.theme.colors.border};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 24px 48px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ServiceName = styled.h3`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
`;

const StatusIndicator = styled.div<{ status: 'operational' | 'degraded' | 'outage' | 'maintenance' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'operational': return theme.colors.success + '20';
      case 'degraded': return theme.colors.warning + '20';
      case 'outage': return theme.colors.error + '20';
      case 'maintenance': return theme.colors.info + '20';
      default: return theme.colors.background;
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'operational': return theme.colors.success;
      case 'degraded': return theme.colors.warning;
      case 'outage': return theme.colors.error;
      case 'maintenance': return theme.colors.info;
      default: return theme.colors.textPrimary;
    }
  }};
`;

const StatusDot = styled.div<{ status: 'operational' | 'degraded' | 'outage' | 'maintenance' }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'operational': return theme.colors.success;
      case 'degraded': return theme.colors.warning;
      case 'outage': return theme.colors.error;
      case 'maintenance': return theme.colors.info;
      default: return theme.colors.textSecondary;
    }
  }};
  animation: ${({ status }) => status === 'operational' ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const ServiceDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const MetricsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MetricItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const MetricLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const MetricValue = styled.span`
  color: ${props => props.theme.colors.textPrimary};
  font-weight: 600;
  font-size: 0.9rem;
`;

const OverallStatus = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 24px;
  padding: 3rem;
  margin-bottom: 3rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.05);
  border: 1px solid ${props => props.theme.colors.border};
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.colors.success}, ${props => props.theme.colors.primary});
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 16px;
  }
`;

const OverallStatusTitle = styled.h2`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const OverallStatusText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.6;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const IncidentList = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
`;

const IncidentItem = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const IncidentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const IncidentTitle = styled.h4`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`;

const IncidentDate = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85rem;
`;

const IncidentDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
`;

const IncidentStatus = styled.span<{ resolved: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${({ resolved, theme }) => 
    resolved ? '#10b98120' : '#f59e0b20'
  };
  color: ${({ resolved }) => 
    resolved ? '#10b981' : '#f59e0b'
  };
`;

const LastUpdated = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85rem;
  margin-top: 2rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const LogoHeroWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 2rem auto;
  background: white;
  border-radius: 50%;
  width: 88px;
  height: 88px;
  box-shadow: 0 4px 24px rgba(44,62,80,0.10);
`;

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  details: string;
  lastCheck: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  date: string;
  resolved: boolean;
  services: string[];
}

interface Metrics {
  uptime: string;
  responseTime: string;
  activeUsers: string;
  dataProcessed: string;
}

const Status: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data - in production this would come from API
  const services: ServiceStatus[] = [
    {
      name: 'Web Dashboard',
      status: 'operational',
      details: 'Alle Systeme funktionieren normal',
      lastCheck: 'vor 2 Minuten'
    },
    {
      name: 'Mobile App',
      status: 'operational',
      details: 'iOS und Android Apps verfügbar',
      lastCheck: 'vor 1 Minute'
    },
    {
      name: 'API Services',
      status: 'operational',
      details: 'Alle API-Endpunkte erreichbar',
      lastCheck: 'vor 30 Sekunden'
    },
    {
      name: 'Datenbank',
      status: 'operational',
      details: 'PostgreSQL läuft optimal',
      lastCheck: 'vor 1 Minute'
    },
    {
      name: 'Datei-Upload',
      status: 'operational',
      details: 'Bild- und Dokumenten-Upload funktioniert',
      lastCheck: 'vor 2 Minuten'
    },
    {
      name: 'E-Mail Service',
      status: 'operational',
      details: 'Benachrichtigungen werden versendet',
      lastCheck: 'vor 5 Minuten'
    }
  ];

  const metrics: Metrics = {
    uptime: '99.98%',
    responseTime: '45ms',
    activeUsers: '1,247',
    dataProcessed: '2.3 TB'
  };

  const incidents: Incident[] = [
    {
      id: '1',
      title: 'Geplante Wartung - Datenbank-Optimierung',
      description: 'Routine-Wartung zur Optimierung der Datenbankleistung. Erwartete Ausfallzeit: 15 Minuten.',
      date: '2024-01-15 02:00 - 02:15 UTC',
      resolved: true,
      services: ['Datenbank', 'API Services']
    },
    {
      id: '2',
      title: 'Temporäre Verzögerungen bei Datei-Uploads',
      description: 'Erhöhte Latenz bei großen Datei-Uploads. Das Problem wurde identifiziert und behoben.',
      date: '2024-01-10 14:30 - 15:45 UTC',
      resolved: true,
      services: ['Datei-Upload']
    },
    {
      id: '3',
      title: 'Scheduled Maintenance - Security Updates',
      description: 'Wichtige Sicherheits-Updates werden installiert. Minimale Auswirkungen erwartet.',
      date: '2024-01-20 01:00 - 02:00 UTC',
      resolved: false,
      services: ['Web Dashboard', 'API Services']
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Funktioniert';
      case 'degraded':
        return 'Eingeschränkt';
      case 'outage':
        return 'Ausfall';
      case 'maintenance':
        return 'Wartung';
      default:
        return 'Unbekannt';
    }
  };

  return (
    <Container>
      <HeroSection>
        <LogoHeroWrapper>
          <AppLogo size={64} />
        </LogoHeroWrapper>
        <HeroTitle>System Status</HeroTitle>
        <HeroSubtitle>
          Echtzeit-Übersicht über die Verfügbarkeit und Leistung aller App4KITAs Services
        </HeroSubtitle>
      </HeroSection>

      <MainContent>
        <StatusGrid>
          {services.map((service, index) => (
            <StatusCard key={index}>
              <StatusHeader>
                <ServiceName>{service.name}</ServiceName>
                <StatusIndicator status={service.status}>
                  {getStatusText(service.status)}
                </StatusIndicator>
              </StatusHeader>
              <ServiceDescription>{service.details}</ServiceDescription>
              <StatusDot status={service.status} />
            </StatusCard>
          ))}
        </StatusGrid>

        <SectionTitle>Leistungsmetriken</SectionTitle>
        <OverallStatus>
          <OverallStatusTitle>Systemübersicht</OverallStatusTitle>
          <OverallStatusText>
            Unsere Systeme sind 24/7 verfügbar und bieten eine zuverlässige Leistung.
            Hier finden Sie die wichtigsten Metriken und Status-Indikatoren.
          </OverallStatusText>
          <MetricsList>
            <MetricItem>
              <MetricLabel>Uptime (30 Tage)</MetricLabel>
              <MetricValue>{metrics.uptime}</MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Durchschnittliche Antwortzeit</MetricLabel>
              <MetricValue>{metrics.responseTime}</MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Aktive Benutzer (heute)</MetricLabel>
              <MetricValue>{metrics.activeUsers}</MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Verarbeitete Daten (Monat)</MetricLabel>
              <MetricValue>{metrics.dataProcessed}</MetricValue>
            </MetricItem>
          </MetricsList>
        </OverallStatus>

        <SectionTitle>Vorfallshistorie</SectionTitle>
        <IncidentList>
          {incidents.map((incident) => (
            <IncidentItem key={incident.id}>
              <IncidentHeader>
                <div>
                  <IncidentTitle>{incident.title}</IncidentTitle>
                  <IncidentDate>{incident.date}</IncidentDate>
                </div>
                <IncidentStatus resolved={incident.resolved}>
                  {incident.resolved ? 'Behoben' : 'In Bearbeitung'}
                </IncidentStatus>
              </IncidentHeader>
              <IncidentDescription>
                {incident.description}
                <br />
                <small>Betroffene Services: {incident.services.join(', ')}</small>
              </IncidentDescription>
            </IncidentItem>
          ))}
        </IncidentList>

        <LastUpdated>
          Letzte Aktualisierung: {lastUpdated.toLocaleString('de-DE')} | 
          Status-Seite wird automatisch alle 60 Sekunden aktualisiert
        </LastUpdated>
      </MainContent>
      <Footer />
    </Container>
  );
};

export default Status; 