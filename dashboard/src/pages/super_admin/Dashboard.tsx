import React, { useEffect, useState } from 'react';
import { useUser } from '../../components/UserContext';
import { getSuperAdminStats } from '../../services/superAdminApi';
import { Card, Headline, ErrorMsg, Button } from '../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader } from '../../components/ui/LoadingSpinner';
import ActivityLog from '../../components/ui/ActivityLog';
import { PersonalNotebook } from '../../components/ui/PersonalNotebook';
import Header from '../../components/Header';
import MascotBear from '../../components/ui/MascotBear';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBuilding, FaChartLine, FaChevronRight, FaArrowUp, FaArrowDown, FaShieldAlt } from 'react-icons/fa';
import styled, { useTheme } from 'styled-components';

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px 64px 16px;
`;
const TopSection = styled.div`
  margin-bottom: 36px;
`;
const PageTitle = styled(Headline)`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.headline2.fontSize};
  font-weight: ${({ theme }) => theme.typography.headline2.fontWeight};
  margin-bottom: 6px;
`;
const PageSubtitle = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.15rem;
  margin-bottom: 0;
`;
const MascotSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
  margin-top: 30px;
`;
const BearWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 100px;
  max-width: 140px;
  margin: 0 auto 0 auto;
  margin-bottom: -85px;
  @media (max-width: 600px) {
    max-width: 90px;
    min-width: 70px;
  }
`;
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 28px;
  margin-bottom: 40px;
`;
const StatCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 28px 18px 24px 18px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  box-shadow: ${({ theme }) => theme.components.card.boxShadow};
`;
const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.08rem;
  margin-bottom: 2px;
`;
const StatNumberRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
const StatNumber = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.2rem;
  font-weight: 800;
`;
const StatTrend = styled.span<{ $up?: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ $up, theme }) => $up ? theme.colors.primary : theme.colors.error};
  font-size: 1.1rem;
  font-weight: 600;
`;
const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 28px;
  margin-bottom: 48px;
`;
const ActionButton = styled(Button)`
  background: ${({ theme }) => theme.components.button.background};
  color: ${({ theme }) => theme.colors.surface};
  font-weight: 700;
  font-size: 1.08rem;
  border-radius: ${({ theme }) => theme.components.button.borderRadius};
  box-shadow: ${({ theme }) => theme.components.button.boxShadow};
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.18s, box-shadow 0.18s, transform 0.18s, opacity 0.18s;
  opacity: 0.97;
  &:hover, &:focus {
    background: ${({ theme }) => theme.components.button.hoverBackground};
    color: ${({ theme }) => theme.colors.surface};
    transform: scale(1.045);
    opacity: 1;
    box-shadow: 0 8px 32px ${({ theme }) => theme.colors.primary}29;
  }
  &:active {
    background: ${({ theme }) => theme.components.button.activeBackground};
    transform: scale(0.98);
  }
  &:disabled {
    background: ${({ theme }) => theme.components.button.disabledBackground};
    color: ${({ theme }) => theme.components.button.disabledColor};
    opacity: ${({ theme }) => theme.components.button.disabledOpacity};
    cursor: ${({ theme }) => theme.components.button.disabledCursor};
  }
`;


const Dashboard: React.FC = () => {
  const { benutzer } = useUser();
  const theme = useTheme();
  const [stats, setStats] = useState<{
    users: number, 
    institutionen: number, 
    activity: number,
    trends: {
      users: { up: boolean, value: number },
      institutionen: { up: boolean, value: number },
      activity: { up: boolean, value: number }
    }
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Use real trends from API or fallback to defaults
  const trends = stats?.trends || {
    users: { up: false, value: 0 },
    institutionen: { up: false, value: 0 },
    activity: { up: false, value: 0 },
  };

  useEffect(() => {
    if (benutzer?.role !== 'SUPER_ADMIN') return;
    setLoading(true);
    
    const loadData = async () => {
      try {
        const statsData = await getSuperAdminStats();
        setStats(statsData);
      } catch (error) {
        setError('Fehler beim Laden der Daten.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [benutzer]);



  if (benutzer?.role !== 'SUPER_ADMIN') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading) return <AnimatedMascotsLoader text="Lade Übersicht..." />;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;

  return (
    <>
      <Header title="Super Admin Dashboard" />
      <PageWrapper>
        <MascotSection>
          <BearWrapper>
            <MascotBear size={120} mood="happy" />
          </BearWrapper>
          <Headline as="div" style={{ fontSize: 18, margin: 0, color: theme.colors.primaryDark, textAlign: 'center' }}>
            Willkommen, {benutzer?.name}!<br />
            Hier findest du alle wichtigen Kennzahlen und Aktionen der App4KITAs Plattform auf einen Blick.
          </Headline>
        </MascotSection>
        
        {/* Personal Notebook */}
        <PersonalNotebook />
        
        <StatsGrid>
          <StatCard>
            <StatLabel>Nutzer</StatLabel>
            <StatNumberRow>
              <StatNumber>{stats?.users ?? 0}</StatNumber>
              <StatTrend $up={trends.users.up}>
                {trends.users.up ? <FaArrowUp /> : <FaArrowDown />} {trends.users.value}%
              </StatTrend>
            </StatNumberRow>
          </StatCard>
          <StatCard>
            <StatLabel>Institutionen</StatLabel>
            <StatNumberRow>
              <StatNumber>{stats?.institutionen ?? 0}</StatNumber>
              <StatTrend $up={trends.institutionen.up}>
                {trends.institutionen.up ? <FaArrowUp /> : <FaArrowDown />} {trends.institutionen.value}%
              </StatTrend>
            </StatNumberRow>
          </StatCard>
          <StatCard>
            <StatLabel>Aktivität</StatLabel>
            <StatNumberRow>
              <StatNumber>{stats?.activity ?? 0}</StatNumber>
              <StatTrend $up={trends.activity.up}>
                {trends.activity.up ? <FaArrowUp /> : <FaArrowDown />} {trends.activity.value}%
              </StatTrend>
            </StatNumberRow>
          </StatCard>
        </StatsGrid>
        <ActionsGrid>
          <ActionButton onClick={() => navigate('/superadmin/erzieher')}>
            <FaUsers /> Nutzerverwaltung <FaChevronRight />
          </ActionButton>
          <ActionButton onClick={() => navigate('/superadmin/institutionen')}>
            <FaBuilding /> Institutionen <FaChevronRight />
          </ActionButton>
          <ActionButton onClick={() => navigate('/superadmin/berichte')}>
            <FaChartLine /> Berichte & Exporte <FaChevronRight />
          </ActionButton>
          <ActionButton onClick={() => navigate('/superadmin/gdpr')}>
            <FaShieldAlt /> DSGVO-Compliance <FaChevronRight />
          </ActionButton>
        </ActionsGrid>
        <ActivityLog title="Letzte Aktivitäten" limit={10} />
      </PageWrapper>
    </>
  );
};

export default Dashboard; 