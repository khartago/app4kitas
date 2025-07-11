import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../../components/UserContext';
import {
  fetchTodaysChildren,
  fetchPendingCheckins,
  fetchMyGroup,
  fetchEducatorCheckinStats,
  fetchRecentActivity
} from '../../services/educatorApi';
import { Card, Headline, StatGrid, ErrorMsg, Button } from '../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader } from '../../components/ui/LoadingSpinner';
import Header from '../../components/Header';
import MascotBear from '../../components/ui/MascotBear';
import { PersonalNotebook } from '../../components/ui/PersonalNotebook';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaSignInAlt, 
  FaSignOutAlt, 
  FaClock, 
  FaBell, 
  FaFileAlt, 
  FaEnvelopeOpenText, 
  FaChild, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaEdit,
  FaCalendarCheck,
  FaChartBar,
  FaTasks,
  FaUserFriends,
  FaComments,
  FaStickyNote
} from 'react-icons/fa';
import { useTheme } from 'styled-components';

// Enhanced styled components using theme tokens
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
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
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
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  
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
  margin-left: auto;
  opacity: 0.7;
`;

const ChildrenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const ChildItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary}40;
    transform: translateY(-1px);
  }
`;

const ChildInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ChildName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ChildStatus = styled.span<{ $checkedIn: boolean }>`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${({ $checkedIn, theme }) => 
    $checkedIn ? theme.colors.primary + '20' : theme.colors.error + '20'
  };
  color: ${({ $checkedIn, theme }) => 
    $checkedIn ? theme.colors.primary : theme.colors.error
  };
  font-weight: 500;
`;

const Dashboard: React.FC = () => {
  const { benutzer } = useUser();
  const [children, setChildren] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [myGroup, setMyGroup] = useState<any>(null);
  const [checkinStats, setCheckinStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!benutzer) return;
      
      try {
    setLoading(true);
        
        // Load educator's group
        const groupData = await fetchMyGroup(benutzer.id);
        setMyGroup(groupData);
        
        // Load today's children
        const childrenData = await fetchTodaysChildren(benutzer.id);
        setChildren(childrenData);
        
        // Load check-in statistics
        const statsData = await fetchEducatorCheckinStats(benutzer.id);
        setCheckinStats(statsData);
        
        // Load recent activity
        const activityData = await fetchRecentActivity(benutzer.id);
        setRecentActivity(activityData);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [benutzer]);

  if (benutzer?.role !== 'EDUCATOR') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading) return <AnimatedMascotsLoader text="Lade Übersicht..." />;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;

  const checkedInCount = children.filter(child => child.checkedIn).length;
  const totalChildren = children.length;
  const pendingCount = pending.length;

  const quickActions = [
    {
      title: 'Check-in',
      icon: <FaSignInAlt />,
      color: theme.colors.primary,
      onClick: () => navigate('/educator/checkin'),
      description: 'Kinder ein- und auschecken'
    },
    {
      title: 'Meine Gruppe',
      icon: <FaUsers />,
      color: theme.colors.accent,
      onClick: () => navigate('/educator/meine-gruppe'),
      description: 'Gruppenverwaltung'
    },
    {
      title: 'Nachrichten',
      icon: <FaEnvelopeOpenText />,
      color: theme.colors.secondary,
              onClick: () => navigate('/educator/chat'),
      description: 'Elternkommunikation'
    },
    {
      title: 'Notizen',
      icon: <FaStickyNote />,
      color: theme.colors.warning,
      onClick: () => navigate('/educator/notizen'),
      description: 'Kindernotizen'
    }
  ];

  return (
    <>
      <Header title="Erzieher Dashboard" />
      <div style={{ marginTop: 64, padding: '0 16px' }}>
        {/* Welcome Section - Simple version */}
        <WelcomeSection>
          <MascotWrapper>
            <MascotBear size={120} mood="happy" />
          </MascotWrapper>
          <WelcomeText>
            <Headline style={{ textAlign: 'center', marginBottom: theme.typography.caption.fontSize, color: theme.colors.primary }}>
              Guten Tag, {benutzer?.name}!
            </Headline>
            <div style={{ 
              color: theme.colors.textSecondary, 
              fontSize: theme.typography.subtitle1.fontSize, 
              marginTop: 0, 
              textAlign: 'center', 
              maxWidth: 480 
            }}>
              Hier finden Sie Ihre täglichen Aufgaben und Übersichten
            </div>
          </WelcomeText>
        </WelcomeSection>

        {/* Personal Notebook */}
        <PersonalNotebook />
        
        {/* Statistics Grid */}
        <StatGrid>
          <StatCard>
            <CenteredIconCircle color={theme.colors.primary}>
              <FaChild size={24} color="white" />
            </CenteredIconCircle>
            <h3>{totalChildren}</h3>
            <p>Heutige Kinder</p>
          </StatCard>
          
          <StatCard>
            <CenteredIconCircle color={theme.colors.success}>
              <FaCheckCircle size={24} color="white" />
            </CenteredIconCircle>
            <h3>{checkedInCount}</h3>
            <p>Eingecheckt</p>
          </StatCard>
          
          <StatCard>
            <CenteredIconCircle color={theme.colors.warning}>
              <FaExclamationTriangle size={24} color="white" />
            </CenteredIconCircle>
            <h3>{pendingCount}</h3>
            <p>Ausstehend</p>
          </StatCard>
          
          <StatCard>
            <CenteredIconCircle color={theme.colors.info}>
              <FaClock size={24} color="white" />
            </CenteredIconCircle>
            <h3>{new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</h3>
            <p>Aktuelle Zeit</p>
          </StatCard>
        </StatGrid>

        {/* Quick Actions - Fixed styling */}
        <Headline style={{ marginTop: 0, marginBottom: theme.typography.body1.fontSize, textAlign: 'center' }}>
          Schnellzugriffe
        </Headline>
        <QuickLinksGrid>
          {quickActions.map((action, index) => (
            <QuickLinkCard key={index}>
              <CenteredIconCircle color={action.color}>
                {action.icon}
              </CenteredIconCircle>
              <h3 style={{ margin: 0, marginBottom: theme.typography.caption.fontSize, textAlign: 'center' }}>
                {action.title}
              </h3>
              <div style={{ 
                color: theme.colors.textSecondary, 
                marginBottom: theme.typography.body2.fontSize, 
                textAlign: 'center' 
              }}>
                {action.description}
              </div>
              <Button onClick={action.onClick}>Zu {action.title}</Button>
            </QuickLinkCard>
          ))}
        </QuickLinksGrid>

        {/* Attendance Summary */}
        <AttendanceSummary>
          <AttendanceItem>
            <h3 style={{ margin: '0 0 8px 0', color: theme.colors.textPrimary }}>
              Anwesenheit heute
            </h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary }}>
              {checkedInCount}/{totalChildren}
            </div>
            <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
              {totalChildren > 0 ? Math.round((checkedInCount / totalChildren) * 100) : 0}% Anwesenheit
            </div>
          </AttendanceItem>
          
          <AttendanceItem>
            <h3 style={{ margin: '0 0 8px 0', color: theme.colors.textPrimary }}>
              Ausstehende Check-ins
            </h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.warning }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
              Warten auf Check-in
            </div>
          </AttendanceItem>
        </AttendanceSummary>

        {/* Today's Children */}
        <Card>
          <h3 style={{ margin: '0 0 16px 0', color: theme.colors.textPrimary }}>
            Heutige Kinder
          </h3>
          {children.length > 0 ? (
            <ChildrenList>
              {children.map(child => (
                <ChildItem key={child.id}>
                  <ChildInfo>
                    <FaChild size={16} color={theme.colors.primary} />
                    <ChildName>{child.name}</ChildName>
                  </ChildInfo>
                  <ChildStatus $checkedIn={child.checkedIn}>
                    {child.checkedIn ? 'Eingecheckt' : 'Nicht eingecheckt'}
                  </ChildStatus>
                </ChildItem>
              ))}
            </ChildrenList>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: theme.colors.textSecondary }}>
              Keine Kinder für heute eingetragen
            </div>
          )}
        </Card>

        {/* Recent Activity Feed */}
        <ActivityFeed>
          <FeedTitle>Aktivitäten heute</FeedTitle>
          <FeedList>
            {children.filter(child => child.checkedIn).map(child => (
              <li key={child.id}>
                <FaCheckCircle size={16} color={theme.colors.success} />
                <span>{child.name} wurde eingecheckt</span>
                <IconMargin>
                  <FaClock size={12} color={theme.colors.textSecondary} />
                </IconMargin>
              </li>
            ))}
            {children.filter(child => !child.checkedIn).map(child => (
              <li key={child.id}>
                <FaExclamationTriangle size={16} color={theme.colors.warning} />
                <span>{child.name} wartet auf Check-in</span>
              </li>
            ))}
          </FeedList>
        </ActivityFeed>
      </div>
    </>
  );
};

export default Dashboard; 