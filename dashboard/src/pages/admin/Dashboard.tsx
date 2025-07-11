import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../../components/UserContext';
import { getAdminStats } from '../../services/adminApi';
import { Card, Headline, StatGrid, ErrorMsg, Button } from '../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader } from '../../components/ui/LoadingSpinner';
import Header from '../../components/Header';
import MascotBear from '../../components/ui/MascotBear';
import { PersonalNotebook } from '../../components/ui/PersonalNotebook';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaLayerGroup, FaChalkboardTeacher, FaBell, FaFileAlt, FaChartBar, FaTasks, FaCalendarCheck, FaClock, FaEnvelopeOpenText, FaSignInAlt, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaEdit } from 'react-icons/fa';
import { useTheme } from 'styled-components';

// Enhanced styled components using theme tokens
const QuickLinksGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.components.card.padding};
  margin: ${({ theme }) => theme.components.card.padding} 0;
  
  > * {
    flex: 1 1 220px;
    min-width: 220px;
  }
`;

const IconCircle = styled.div<{ color: string }>`
  background: ${({ color }) => color};
  border-radius: 50%;
  width: ${({ theme }) => theme.components.iconCircle.size}px;
  height: ${({ theme }) => theme.components.iconCircle.size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.typography.body2.fontSize};
  box-shadow: ${({ theme }) => theme.components.iconCircle.boxShadow};
`;

const WelcomeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.components.card.padding};
  width: 100%;
`;

const WelcomeText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: ${({ theme }) => theme.typography.caption.fontSize};
`;

const MascotWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: -100px;
`;

const StatCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const CenteredIconCircle = styled(IconCircle)`
  margin-bottom: ${({ theme }) => theme.typography.body2.fontSize};
`;

const ShowMoreWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${({ theme }) => theme.typography.body1.fontSize};
`;

const QuickLinkCard = styled(Card)`
  display: flex !important;
  flex-direction: column;
  align-items: center !important;
  justify-content: center;
  text-align: center;
  transition: ${({ theme }) => theme.animations.types.scale.duration}ms ${({ theme }) => theme.animations.transitionCurves.easeOut};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(67,185,127,0.15);
  }
`;

const ShowMoreButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: ${({ theme }) => theme.typography.subtitle1.fontSize};
  font-weight: ${({ theme }) => theme.typography.subtitle1.fontWeight};
  padding: ${({ theme }) => theme.components.button.padding};
  border-radius: ${({ theme }) => theme.components.button.borderRadius};
  box-shadow: ${({ theme }) => theme.components.button.boxShadow};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.typography.caption.fontSize};
  margin: 0 auto;
  transition: ${({ theme }) => theme.components.button.transition};
  opacity: 0.97;
  will-change: transform, opacity;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    color: #fff;
    transform: ${({ theme }) => theme.components.button.hoverTransform};
    opacity: 1;
    box-shadow: 0 8px 32px rgba(76,175,80,0.16);
  }
`;

const ActivityFeed = styled(Card)`
  margin-top: ${({ theme }) => theme.components.card.padding};
  padding: ${({ theme }) => theme.components.card.padding};
`;

const FeedTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.subtitle1.fontSize};
  font-weight: ${({ theme }) => theme.typography.subtitle1.fontWeight};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.typography.body1.fontSize};
`;

const FeedList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.typography.caption.fontSize};
    margin-bottom: ${({ theme }) => theme.typography.caption.fontSize};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: ${({ theme }) => theme.typography.body1.fontSize};
    padding: ${({ theme }) => theme.typography.caption.fontSize};
    border-radius: ${({ theme }) => theme.components.input.borderRadius};
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: ${({ theme }) => theme.colors.surfaceAlt};
    }
  }
`;

const AttendanceSummary = styled(Card)`
  margin-top: ${({ theme }) => theme.components.card.padding};
  padding: ${({ theme }) => theme.components.card.padding};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.components.card.padding};
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.typography.body1.fontSize};
  }
`;

const AttendanceItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const RemindersCard = styled(Card)`
  margin-top: ${({ theme }) => theme.components.card.padding};
  padding: ${({ theme }) => theme.components.card.padding};
`;

const IconMargin = styled.span`
  margin-left: ${({ theme }) => theme.typography.caption.fontSize};
  display: inline-flex;
`;





const Dashboard: React.FC = () => {
  const { benutzer } = useUser();
  const [stats, setStats] = useState<{
    children: number, 
    groups: number, 
    educators: number,
    attendanceToday?: {
      checkedIn: number,
      absent: number,
      late: number
    },
    recentActivities?: Array<{
      type: string,
      text: string,
      timestamp: string
    }>
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (benutzer?.role !== 'ADMIN') return;
    setLoading(true);
    getAdminStats()
      .then(setStats)
      .catch(() => setError('Fehler beim Laden der Statistiken.'))
      .finally(() => setLoading(false));
  }, [benutzer]);

  // Personal notebook management
  

  if (benutzer?.role !== 'ADMIN') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading) return <AnimatedMascotsLoader text="Lade Übersicht..." />;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;

  // Use real data from backend with theme colors
  const recentActivities = stats?.recentActivities?.map(activity => {
    let icon;
    switch (activity.type) {
      case 'checkin':
        icon = <FaCalendarCheck color={theme.colors.primary} />;
        break;
      case 'message':
        icon = <FaEnvelopeOpenText color={theme.colors.accent} />;
        break;
      case 'notification':
        icon = <FaBell color={theme.colors.error} />;
        break;
      default:
        icon = <FaCalendarCheck color={theme.colors.primary} />;
    }
    return { icon, text: activity.text };
  }) || [];

  const attendanceToday = [
    { 
      label: 'Eingecheckt', 
      value: stats?.attendanceToday?.checkedIn || 0, 
      icon: <FaCalendarCheck color={theme.colors.primary} size={22} /> 
    },
    { 
      label: 'Abwesend', 
      value: stats?.attendanceToday?.absent || 0, 
      icon: <FaEnvelopeOpenText color={theme.colors.accent} size={22} /> 
    },
    { 
      label: 'Verspätet', 
      value: stats?.attendanceToday?.late || 0, 
      icon: <FaSignInAlt size={24} color={theme.colors.error} />,
    },
  ];

  return (
    <>
      <Header title="Admin Dashboard" />
      <div style={{ marginTop: theme.components.card.padding }}>
        {/* Welcome Section */}
        <WelcomeSection>
          <MascotWrapper>
            <MascotBear size={120} mood="happy" />
          </MascotWrapper>
          <WelcomeText>
            <Headline style={{ textAlign: 'center', marginBottom: theme.typography.caption.fontSize, color: theme.colors.primary }}>
              Willkommen, {benutzer?.name || 'Admin'}!
            </Headline>
            <div style={{ 
              color: theme.colors.textSecondary, 
              fontSize: theme.typography.subtitle1.fontSize, 
              marginTop: 0, 
              textAlign: 'center', 
              maxWidth: 480 
            }}>
              Hier findest du dein persönliches Notizbuch, wichtige Statistiken und praktische Schnellzugriffe für deinen Kita-Alltag.
            </div>
          </WelcomeText>
        </WelcomeSection>
        
        {/* Personal Notebook - Right after welcome */}
        <PersonalNotebook />
        
        {/* Quick Links (centered) */}
        <Headline style={{ marginTop: 0, marginBottom: theme.typography.body1.fontSize, textAlign: 'center' }}>
          Schnellzugriffe
        </Headline>
        <QuickLinksGrid>
          <QuickLinkCard>
            <CenteredIconCircle color={theme.colors.primary}>
              <FaLayerGroup color="#fff" size={24} />
            </CenteredIconCircle>
            <h3 style={{ margin: 0, marginBottom: theme.typography.caption.fontSize, textAlign: 'center' }}>
              Gruppen
            </h3>
            <div style={{ 
              color: theme.colors.textSecondary, 
              marginBottom: theme.typography.body2.fontSize, 
              textAlign: 'center' 
            }}>
              Gruppen verwalten und zuordnen.
            </div>
            <Button onClick={() => navigate('/admin/gruppen')}>Zu Gruppen</Button>
          </QuickLinkCard>
          
          <QuickLinkCard>
            <CenteredIconCircle color={theme.colors.accent}>
              <FaUsers color="#fff" size={24} />
            </CenteredIconCircle>
            <h3 style={{ margin: 0, marginBottom: theme.typography.caption.fontSize, textAlign: 'center' }}>
              Kinder
            </h3>
            <div style={{ 
              color: theme.colors.textSecondary, 
              marginBottom: theme.typography.body2.fontSize, 
              textAlign: 'center' 
            }}>
              Kinder verwalten und Profile ansehen.
            </div>
            <Button onClick={() => navigate('/admin/kinder')}>Zu Kindern</Button>
          </QuickLinkCard>
          
          <QuickLinkCard>
            <CenteredIconCircle color={theme.colors.error}>
              <FaChalkboardTeacher color="#fff" size={24} />
            </CenteredIconCircle>
            <h3 style={{ margin: 0, marginBottom: theme.typography.caption.fontSize, textAlign: 'center' }}>
              Personal
            </h3>
            <div style={{ 
              color: theme.colors.textSecondary, 
              marginBottom: theme.typography.body2.fontSize, 
              textAlign: 'center' 
            }}>
              Personal verwalten und Kontakte.
            </div>
            <Button onClick={() => navigate('/admin/personal')}>Zu Personal</Button>
          </QuickLinkCard>
          
          <QuickLinkCard>
            <CenteredIconCircle color={theme.colors.primary}>
              <FaBell color="#fff" size={24} />
            </CenteredIconCircle>
            <h3 style={{ margin: 0, marginBottom: theme.typography.caption.fontSize, textAlign: 'center' }}>
              Benachrichtigungen
            </h3>
            <div style={{ 
              color: theme.colors.textSecondary, 
              marginBottom: theme.typography.body2.fontSize, 
              textAlign: 'center' 
            }}>
              Mitteilungen an Eltern und Personal.
            </div>
            <Button onClick={() => navigate('/admin/benachrichtigungen')}>Zu Benachrichtigungen</Button>
          </QuickLinkCard>
          
          <QuickLinkCard>
            <CenteredIconCircle color={theme.colors.accent}>
              <FaFileAlt color="#fff" size={24} />
            </CenteredIconCircle>
            <h3 style={{ margin: 0, marginBottom: theme.typography.caption.fontSize, textAlign: 'center' }}>
              Berichte
            </h3>
            <div style={{ 
              color: theme.colors.textSecondary, 
              marginBottom: theme.typography.body2.fontSize, 
              textAlign: 'center' 
            }}>
              Monats- und Tagesberichte exportieren.
            </div>
            <Button onClick={() => navigate('/admin/monatsbericht')}>Zu Berichten</Button>
          </QuickLinkCard>
        </QuickLinksGrid>
        
        {/* Stats Cards */}
        <StatGrid>
          <StatCard>
            <CenteredIconCircle color={theme.colors.primary}>
              <FaUsers color="#fff" size={24} />
            </CenteredIconCircle>
            <h2 style={{ margin: 0 }}>Kinder</h2>
            <p style={{ 
              fontSize: theme.typography.headline1.fontSize, 
              fontWeight: theme.typography.headline1.fontWeight, 
              margin: `${theme.typography.caption.fontSize} 0` 
            }}>
              {stats?.children ?? 0}
            </p>
          </StatCard>
          <StatCard>
            <CenteredIconCircle color={theme.colors.accent}>
              <FaLayerGroup color="#fff" size={24} />
            </CenteredIconCircle>
            <h2 style={{ margin: 0 }}>Gruppen</h2>
            <p style={{ 
              fontSize: theme.typography.headline1.fontSize, 
              fontWeight: theme.typography.headline1.fontWeight, 
              margin: `${theme.typography.caption.fontSize} 0` 
            }}>
              {stats?.groups ?? 0}
            </p>
          </StatCard>
          <StatCard>
            <CenteredIconCircle color={theme.colors.error}>
              <FaChalkboardTeacher color="#fff" size={24} />
            </CenteredIconCircle>
            <h2 style={{ margin: 0 }}>Personal</h2>
            <p style={{ 
              fontSize: theme.typography.headline1.fontSize, 
              fontWeight: theme.typography.headline1.fontWeight, 
              margin: `${theme.typography.caption.fontSize} 0` 
            }}>
              {stats?.educators ?? 0}
            </p>
          </StatCard>
        </StatGrid>
        
        {/* Mehr zeigen Button */}
        <ShowMoreWrapper>
          <ShowMoreButton onClick={() => navigate('/admin/statistiken')}>
            Mehr zeigen
            <IconMargin><FaChartBar /></IconMargin>
          </ShowMoreButton>
        </ShowMoreWrapper>
        
        <ActivityFeed>
          <FeedTitle>Letzte Aktivitäten</FeedTitle>
          <FeedList>
            {recentActivities.length > 0 ? (
              recentActivities.map((a, i) => (
                <li key={i}>{a.icon} {a.text}</li>
              ))
            ) : (
              <li style={{ color: theme.colors.textSecondary, fontStyle: 'italic' }}>
                Keine Aktivitäten in den letzten 24 Stunden
              </li>
            )}
          </FeedList>
        </ActivityFeed>
        
        <AttendanceSummary>
          {attendanceToday.map((a, i) => (
            <AttendanceItem key={i}>
              {a.icon}
              <div style={{ 
                fontWeight: theme.typography.subtitle1.fontWeight, 
                fontSize: theme.typography.headline2.fontSize 
              }}>
                {a.value}
              </div>
              <div style={{ 
                color: theme.colors.textSecondary, 
                fontSize: theme.typography.body2.fontSize 
              }}>
                {a.label}
              </div>
            </AttendanceItem>
          ))}
        </AttendanceSummary>
        

      </div>
    </>
  );
};

export default Dashboard; 