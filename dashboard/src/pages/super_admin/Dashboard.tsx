import React, { useEffect, useState } from 'react';
import { useUser } from '../../components/UserContext';
import { getSuperAdminStats } from '../../services/superAdminApi';
import { Card, Headline, StatGrid, ErrorMsg, AnimatedMascotsLoader, Button } from '../../components/ui/AdminDashboardUI';
import Header from '../../components/Header';
import MascotBear from '../../components/ui/MascotBear';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBuilding, FaChartLine } from 'react-icons/fa';
import styled from 'styled-components';

const QuickLinksGrid = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 24,
    margin: '32px 0',
  }}>{children}</div>
);

const IconCircle = ({ color, children }: { color: string, children: React.ReactNode }) => (
  <div style={{
    background: color,
    borderRadius: '50%',
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    boxShadow: '0 2px 8px rgba(44,62,80,0.10)'
  }}>{children}</div>
);

// Add styled wrapper for welcome section
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
// Center content in stats cards
const StatCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;
// Center icon in IconCircle
const CenteredIconCircle = styled(IconCircle)`
  margin-bottom: 12px;
`;
// Button wrapper for 'Mehr zeigen'
const ShowMoreWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 18px;
`;
// Center Schnellzugriffe card content
const QuickLinkCard = styled(Card)`
  display: flex !important;
  flex-direction: column;
  align-items: center !important;
  justify-content: center;
  text-align: center;
`;
// Modern, prominent 'Mehr zeigen' button
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

const Dashboard: React.FC = () => {
  const { benutzer } = useUser();
  const [stats, setStats] = useState<{users: number, institutionen: number, activity: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (benutzer?.role !== 'SUPER_ADMIN') return;
    setLoading(true);
    getSuperAdminStats()
      .then(setStats)
      .catch(() => setError('Fehler beim Laden der Statistiken.'))
      .finally(() => setLoading(false));
  }, [benutzer]);

  if (benutzer?.role !== 'SUPER_ADMIN') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading) return <AnimatedMascotsLoader text="Lade Übersicht..." />;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;

  return (
    <>
      <Header title="Super Admin Dashboard" />
      <div style={{ marginTop: 32 }}>
        {/* Welcome Section */}
        <WelcomeSection>
          <MascotWrapper>
            <MascotBear size={120} mood="happy" />
          </MascotWrapper>
          <WelcomeText>
            <Headline style={{ textAlign: 'center', marginBottom: 8 }}>Willkommen, {benutzer?.name || 'Super Admin'}!</Headline>
            <div style={{ color: '#757575', fontSize: 18, marginTop: 0, textAlign: 'center', maxWidth: 480 }}>
              Hier findest du die wichtigsten Statistiken und Schnellzugriffe.
            </div>
          </WelcomeText>
        </WelcomeSection>
        {/* Quick Links (centered) */}
        <Headline style={{ marginTop: 0, marginBottom: 16, textAlign: 'center' }}>Schnellzugriffe</Headline>
        <QuickLinksGrid>
          <QuickLinkCard>
            <h3 style={{ margin: 0, marginBottom: 8, textAlign: 'center' }}>Nutzerverwaltung</h3>
            <div style={{ color: '#757575', marginBottom: 12, textAlign: 'center' }}>Verwalte alle Nutzer der Plattform.</div>
            <Button onClick={() => navigate('/superadmin/educators')}>Zu Nutzer</Button>
          </QuickLinkCard>
          <QuickLinkCard>
            <h3 style={{ margin: 0, marginBottom: 8, textAlign: 'center' }}>Institutionen</h3>
            <div style={{ color: '#757575', marginBottom: 12, textAlign: 'center' }}>Institutionen verwalten.</div>
            <Button onClick={() => navigate('/superadmin/institutionen')}>Zu Institutionen</Button>
          </QuickLinkCard>
          <QuickLinkCard>
            <h3 style={{ margin: 0, marginBottom: 8, textAlign: 'center' }}>Berichte & Auswertungen</h3>
            <div style={{ color: '#757575', marginBottom: 12, textAlign: 'center' }}>Plattformweite Berichte und Exporte.</div>
            <Button onClick={() => navigate('/superadmin/reports')}>Zu Berichten</Button>
          </QuickLinkCard>
        </QuickLinksGrid>
        {/* Stats Cards */}
      <StatGrid>
          <StatCard>
            <CenteredIconCircle color="#4CAF50"><FaUsers color="#fff" size={24} /></CenteredIconCircle>
            <h2 style={{ margin: 0 }}>Nutzer</h2>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '8px 0' }}>{stats?.users ?? 0}</p>
          </StatCard>
          <StatCard>
            <CenteredIconCircle color="#FFC107"><FaBuilding color="#fff" size={24} /></CenteredIconCircle>
            <h2 style={{ margin: 0 }}>Institutionen</h2>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '8px 0' }}>{stats?.institutionen ?? 0}</p>
          </StatCard>
          <StatCard>
            <CenteredIconCircle color="#388E3C"><FaChartLine color="#fff" size={24} /></CenteredIconCircle>
            <h2 style={{ margin: 0 }}>Aktivität</h2>
            <p style={{ fontSize: 28, fontWeight: 700, margin: '8px 0' }}>{stats?.activity ?? 0}</p>
          </StatCard>
      </StatGrid>
        {/* Mehr zeigen Button */}
        <ShowMoreWrapper>
          <ShowMoreButton onClick={() => navigate('/superadmin/stats')}>
            Mehr zeigen
            <svg width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: 4 }}>
              <path d="M7 11h8m0 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </ShowMoreButton>
        </ShowMoreWrapper>
    </div>
    </>
  );
};

export default Dashboard; 