import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchRecentActivity, fetchAdminActivity, fetchEducatorActivity, ActivityLog as ActivityLogType, getActivityActionText, getActivityIcon } from '../../services/activityApi';
import { useUser } from '../UserContext';
import { Card, Headline } from './AdminDashboardUI';

const ActivitySection = styled(Card)`
  margin-top: 24px;
  padding: 32px 22px 28px 22px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.components.card.boxShadow};
`;

const ActivityTitle = styled(Headline)`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.headline2.fontSize};
  font-weight: ${({ theme }) => theme.typography.headline2.fontWeight};
  margin-bottom: 18px;
`;

const ActivityTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const ActivityHeader = styled.th`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.01rem;
  font-weight: 600;
  padding: 8px 0;
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.border};
  text-align: left;
`;

const ActivityRow = styled.tr`
  &:nth-child(even) {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;

const ActivityCell = styled.td`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1.01rem;
  padding: 8px 0;
`;

const ActivityTime = styled.td`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.98rem;
  padding: 8px 0;
`;

const ActivityIcon = styled.span`
  font-size: 1.2rem;
  margin-right: 8px;
`;

const ActivityUser = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
`;

const ActivityDetails = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
`;

const LoadingText = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 20px;
`;

const ErrorText = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.error};
  padding: 20px;
`;

interface ActivityLogProps {
  title?: string;
  limit?: number;
  showUser?: boolean;
  className?: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ 
  title = "Letzte Aktivitäten", 
  limit = 10, 
  showUser = true,
  className 
}) => {
  const { benutzer } = useUser();
  const [activities, setActivities] = useState<ActivityLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      if (!benutzer) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let activityData: ActivityLogType[];
        
        switch (benutzer.role) {
          case 'SUPER_ADMIN':
            activityData = await fetchRecentActivity(limit);
            break;
          case 'ADMIN':
            activityData = await fetchAdminActivity(limit);
            break;
          case 'EDUCATOR':
            activityData = await fetchEducatorActivity(limit);
            break;
          default:
            activityData = await fetchRecentActivity(limit);
        }
        
        setActivities(activityData);
      } catch (err) {
        setError('Fehler beim Laden der Aktivitäten');
        console.error('Error loading activities:', err);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [benutzer, limit]);

  // Helper function to format activity time
  const formatActivityTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Gerade eben';
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Minuten`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `vor ${diffInHours} Stunden`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Gestern';
    if (diffInDays < 7) return `vor ${diffInDays} Tagen`;
    
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <ActivitySection className={className}>
        <ActivityTitle as="h2">{title}</ActivityTitle>
        <LoadingText>Lade Aktivitäten...</LoadingText>
      </ActivitySection>
    );
  }

  if (error) {
    return (
      <ActivitySection className={className}>
        <ActivityTitle as="h2">{title}</ActivityTitle>
        <ErrorText>{error}</ErrorText>
      </ActivitySection>
    );
  }

  return (
    <ActivitySection className={className}>
      <ActivityTitle as="h2">{title}</ActivityTitle>
      <ActivityTable>
        <thead>
          <tr>
            <ActivityHeader>Aktion</ActivityHeader>
            {showUser && <ActivityHeader>Benutzer</ActivityHeader>}
            <ActivityHeader>Zeit</ActivityHeader>
          </tr>
        </thead>
        <tbody>
          {activities.length > 0 ? (
            activities.map((activity) => (
              <ActivityRow key={activity.id}>
                <ActivityCell>
                  <ActivityIcon>{getActivityIcon(activity.action)}</ActivityIcon>
                  {getActivityActionText(activity.action)}
                  {activity.details && (
                    <ActivityDetails> - {activity.details}</ActivityDetails>
                  )}
                </ActivityCell>
                {showUser && (
                  <ActivityCell>
                    <ActivityUser>{activity.user.name}</ActivityUser>
                  </ActivityCell>
                )}
                <ActivityTime>{formatActivityTime(activity.createdAt)}</ActivityTime>
              </ActivityRow>
            ))
          ) : (
            <ActivityRow>
              <ActivityCell colSpan={showUser ? 3 : 2} style={{ textAlign: 'center', color: '#888' }}>
                Keine Aktivitäten verfügbar
              </ActivityCell>
            </ActivityRow>
          )}
        </tbody>
      </ActivityTable>
    </ActivitySection>
  );
};

export default ActivityLog; 