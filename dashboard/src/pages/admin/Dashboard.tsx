import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../../components/UserContext';
import { getAdminStats } from '../../services/adminApi';
import { Card, Headline, StatGrid, ErrorMsg, AnimatedMascotsLoader, Button } from '../../components/ui/AdminDashboardUI';
import Header from '../../components/Header';
import MascotBear from '../../components/ui/MascotBear';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaLayerGroup, FaChalkboardTeacher, FaBell, FaFileAlt, FaChartBar, FaTasks, FaCalendarCheck, FaClock, FaEnvelopeOpenText } from 'react-icons/fa';

const QuickLinksGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin: 32px 0;
  
  > * {
    flex: 1 1 220px;
    min-width: 220px;
  }
`;
const IconCircle = styled.div<{ color: string }>`
  background: ${({ color }) => color};
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(44,62,80,0.10);
`;
const WelcomeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  width: 100%;
`;
const WelcomeText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
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
  margin-bottom: 12px;
`;
const ShowMoreWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 18px;
`;
const QuickLinkCard = styled(Card)`
  display: flex !important;
  flex-direction: column;
  align-items: center !important;
  justify-content: center;
  text-align: center;
`;
const ShowMoreButton = styled(Button)`
  background: ${({ theme }) => theme.colors.accent};
  color: #212121;
  font-size: 18px;
  font-weight: 700;
  padding: 14px 34px;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(255,193,7,0.10);
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
  transition: background 0.18s, box-shadow 0.18s, transform 0.18s, opacity 0.18s;
  opacity: 0.97;
  will-change: transform, opacity;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    transform: scale(1.045);
    opacity: 1;
    box-shadow: 0 8px 32px rgba(76,175,80,0.16);
  }
`;

const ActivityFeed = styled(Card)`
  margin-top: 32px;
  padding: 24px;
`;
const FeedTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 16px;
`;
const FeedList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  li {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 1rem;
  }
`;
const AttendanceSummary = styled(Card)`
  margin-top: 32px;
  padding: 24px;
  display: flex;
  flex-direction: row;
  gap: 32px;
  justify-content: space-between;
`;
const AttendanceItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;
const RemindersCard = styled(Card)`
  margin-top: 32px;
  padding: 24px;
`;

const IconMargin = styled.span`
  margin-left: 4px;
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
    }>,
    openTasks?: string[]
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (benutzer?.role !== 'ADMIN') return;
    setLoading(true);
    getAdminStats()
      .then(setStats)
      .catch(() => setError('Fehler beim Laden der Statistiken.'))
      .finally(() => setLoading(false));
  }, [benutzer]);

  if (benutzer?.role !== 'ADMIN') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading) return <AnimatedMascotsLoader text="Lade Übersicht..." />;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;

  // Use real data from backend
  const recentActivities = stats?.recentActivities?.map(activity => {
    let icon;
    switch (activity.type) {
      case 'checkin':
        icon = <FaCalendarCheck color="#4CAF50" />;
        break;
      case 'message':
        icon = <FaEnvelopeOpenText color="#2196F3" />;
        break;
      case 'notification':
        icon = <FaBell color="#FF7043" />;
        break;
      default:
        icon = <FaCalendarCheck color="#4CAF50" />;
    }
    return { icon, text: activity.text };
  }) || [];

  const attendanceToday = [
    { 
      label: 'Eingecheckt', 
      value: stats?.attendanceToday?.checkedIn || 0, 
      icon: <FaCalendarCheck color="#4CAF50" size={22} /> 
    },
    { 
      label: 'Abwesend', 
      value: stats?.attendanceToday?.absent || 0, 
      icon: <FaEnvelopeOpenText color="#FFC107" size={22} /> 
    },
    { 
      label: 'Verspätet', 
      value: stats?.attendanceToday?.late || 0, 
      icon: <FaClock color="#FF7043" size={22} /> 
    },
  ];

  const openTasks = stats?.openTasks?.map(task => ({
    icon: <FaTasks color="#8E24AA" />,
    text: task
  })) || [];

  return (
    <>
      <Header title="Admin Dashboard" />
      <div style={{ marginTop: 32 }}>
        {/* Welcome Section */}
        <WelcomeSection>
          <MascotWrapper>
            <MascotBear size={120} mood="happy" />
          </MascotWrapper>
          <WelcomeText>
            <Headline style={{ textAlign: 'center', marginBottom: 8 }}>Willkommen, {benutzer?.name || 'Admin'}!</Headline>
            <div style={{ color: '#757575', fontSize: 18, marginTop: 0, textAlign: 'center', maxWidth: 480 }}>
              Hier findest du die wichtigsten Statistiken und Schnellzugriffe für deine Kita.
            </div>
          </WelcomeText>
        </WelcomeSection>
        {/* Quick Links (centered) */}
        <Headline style={{ marginTop: 0, marginBottom: 16, textAlign: 'center' }}>Schnellzugriffe</Headline>
        <QuickLinksGrid>
          <QuickLinkCard>
            <CenteredIconCircle color="#4CAF50"><FaLayerGroup color="#fff" size={24} /></CenteredIconCircle>
            <h3 style={{ margin: 0, marginBottom: 8, textAlign: 'center' }}>Gruppen</h3>
            <div style={{ color: '#757575', marginBottom: 12, textAlign: 'center' }}>Gruppen verwalten und zuordnen.</div>
            <Button onClick={() => navigate('/gruppen')}>Zu Gruppen</Button>
          </QuickLinkCard>
          <QuickLinkCard>
            <CenteredIconCircle color="#2196F3"><FaUsers color="#fff" size={24} /></CenteredIconCircle>
            <h3 style={{ margin: 0, marginBottom: 8, textAlign: 'center' }}>Kinder</h3>
            <div style={{ color: '#757575', marginBottom: 12, textAlign: 'center' }}>Kinder verwalten und Profile ansehen.</div>
            <Button onClick={() => navigate('/kinder')}>Zu Kindern</Button>
          </QuickLinkCard>
          <QuickLinkCard>
            <CenteredIconCircle color="#FFC107"><FaChalkboardTeacher color="#fff" size={24} /></CenteredIconCircle>
            <h3 style={{ margin: 0, marginBottom: 8, textAlign: 'center' }}>Personal</h3>
            <div style={{ color: '#757575', marginBottom: 12, textAlign: 'center' }}>Personal verwalten und Kontakte.</div>
            <Button onClick={() => navigate('/personal')}>Zu Personal</Button>
          </QuickLinkCard>
          <QuickLinkCard>
            <CenteredIconCircle color="#FF7043"><FaBell color="#fff" size={24} /></CenteredIconCircle>
            <h3 style={{ margin: 0, marginBottom: 8, textAlign: 'center' }}>Benachrichtigungen</h3>
            <div style={{ color: '#757575', marginBottom: 12, textAlign: 'center' }}>Mitteilungen an Eltern und Personal.</div>
            <Button onClick={() => navigate('/notifications')}>Zu Benachrichtigungen</Button>
          </QuickLinkCard>
          <QuickLinkCard>
            <CenteredIconCircle color="#8E24AA"><FaFileAlt color="#fff" size={24} /></CenteredIconCircle>
            <h3 style={{ margin: 0, marginBottom: 8, textAlign: 'center' }}>Berichte</h3>
            <div style={{ color: '#757575', marginBottom: 12, textAlign: 'center' }}>Monats- und Tagesberichte exportieren.</div>
            <Button onClick={() => navigate('/monatsbericht')}>Zu Berichten</Button>
          </QuickLinkCard>
        </QuickLinksGrid>
        {/* Stats Cards */}
        <StatGrid>
          <StatCard>
            <CenteredIconCircle color="#2196F3"><FaUsers color="#fff" size={24} /></CenteredIconCircle>
            <h2 style={{ margin: 0 }}>Kinder</h2>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '8px 0' }}>{stats?.children ?? 0}</p>
          </StatCard>
          <StatCard>
            <CenteredIconCircle color="#4CAF50"><FaLayerGroup color="#fff" size={24} /></CenteredIconCircle>
            <h2 style={{ margin: 0 }}>Gruppen</h2>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '8px 0' }}>{stats?.groups ?? 0}</p>
          </StatCard>
          <StatCard>
            <CenteredIconCircle color="#FFC107"><FaChalkboardTeacher color="#fff" size={24} /></CenteredIconCircle>
            <h2 style={{ margin: 0 }}>Personal</h2>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '8px 0' }}>{stats?.educators ?? 0}</p>
          </StatCard>
        </StatGrid>
        {/* Mehr zeigen Button */}
        <ShowMoreWrapper>
          <ShowMoreButton onClick={() => navigate('/stats')}>
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
              <li style={{ color: '#757575', fontStyle: 'italic' }}>
                Keine Aktivitäten in den letzten 24 Stunden
              </li>
            )}
          </FeedList>
        </ActivityFeed>
        <AttendanceSummary>
          {attendanceToday.map((a, i) => (
            <AttendanceItem key={i}>
              {a.icon}
              <div style={{ fontWeight: 700, fontSize: 20 }}>{a.value}</div>
              <div style={{ color: '#757575', fontSize: 15 }}>{a.label}</div>
            </AttendanceItem>
          ))}
        </AttendanceSummary>
        <RemindersCard>
          <FeedTitle>Offene Aufgaben</FeedTitle>
          <FeedList>
            {openTasks.length > 0 ? (
              openTasks.map((t, i) => (
                <li key={i}>{t.icon} {t.text}</li>
              ))
            ) : (
              <li style={{ color: '#757575', fontStyle: 'italic' }}>
                Alle Aufgaben erledigt! 🎉
              </li>
            )}
          </FeedList>
        </RemindersCard>
      </div>
    </>
  );
};

export default Dashboard; 