import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../../components/UserContext';
import { ErrorMsg, Card, Headline, StatGrid as BaseStatGrid } from '../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader } from '../../components/ui/LoadingSpinner';
import { getSuperAdminStats } from '../../services/superAdminApi';
import Header from '../../components/Header';
import MascotBear from '../../components/ui/MascotBear';
import { 
  FaUsers, 
  FaUserTie, 
  FaChalkboardTeacher, 
  FaUserFriends, 
  FaChild, 
  FaLayerGroup, 
  FaSignInAlt, 
  FaEnvelope, 
  FaBell,
  FaDownload,
  FaChartLine,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { useTheme } from 'styled-components';

const StatCard = styled(Card)<{ $accent?: boolean; $cardWidth?: string; $trend?: 'up' | 'down' | 'neutral' }>`
  width: ${({ $cardWidth }) => $cardWidth || '100%'};
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 160px;
  border: ${({ $accent, theme }) => $accent ? `2.5px solid ${theme.colors.accent}` : theme.components.card.border};
  box-shadow: ${({ $accent, theme }) => $accent ? `0 4px 24px ${theme.colors.accent}1A` : theme.components.card.boxShadow};
  padding: ${({ theme }) => theme.components.card.padding};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  margin: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => `0 8px 32px ${theme.colors.primary}22`};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $trend, theme }) => {
      if ($trend === 'up') return theme.colors.primary;
      if ($trend === 'down') return theme.colors.error;
      return theme.colors.border;
    }};
  }
  
  @media (max-width: 900px) {
    width: 100%;
  }
  @media (max-width: 600px) {
    min-height: 120px;
    padding: 14px 8px;
    width: 100%;
  }
`;

const StatLabel = styled.h3`
  margin: 0;
  font-weight: 700;
  font-size: ${({ theme }) => theme.typography.headline2.fontSize}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  @media (max-width: 600px) {
    font-size: 1.1rem;
  }
`;

const StatValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 0 0;
  
  .value {
    font-size: 2.2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  .trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 12px;
    background: ${({ theme }) => theme.colors.background};
    
    &.up {
      color: ${({ theme }) => theme.colors.primary};
    }
    
    &.down {
      color: ${({ theme }) => theme.colors.error};
    }
    
    &.neutral {
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }
  
  @media (max-width: 600px) {
    .value {
      font-size: 1.3rem;
    }
    .trend {
      font-size: 0.8rem;
      padding: 2px 6px;
    }
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
  box-shadow: 0 2px 8px ${({ theme }) => theme.components.card.boxShadow.split(' ')[4]};
  @media (max-width: 600px) {
    width: 36px;
    height: 36px;
    margin-bottom: 8px;
    svg { font-size: 18px !important; }
  }
`;

const StatRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 3%;
  margin-bottom: 32px;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    margin-bottom: 18px;
  }
`;

const SectionHeadline = styled(Headline)`
  margin-top: 32px;
  margin-bottom: 12px;
  text-align: left;
  @media (max-width: 600px) {
    margin-top: 18px;
    margin-bottom: 8px;
    font-size: 1.2rem;
  }
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

const Divider = styled.hr`
  width: 100%;
  border: none;
  border-top: 1.5px solid ${({ theme }) => theme.colors.border};
  margin: 24px 0 12px 0;
  @media (max-width: 600px) {
    margin: 12px 0 8px 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  background: ${({ $variant, theme }) => 
    $variant === 'secondary' 
      ? theme.colors.surface 
      : theme.components.button.background
  };
  color: ${({ $variant, theme }) => 
    $variant === 'secondary' 
      ? theme.colors.primary 
      : theme.colors.surface
  };
  border: ${({ $variant, theme }) => 
    $variant === 'secondary' 
      ? `2px solid ${theme.colors.primary}` 
      : 'none'
  };
  border-radius: ${({ theme }) => theme.components.button.borderRadius};
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${({ theme }) => theme.components.button.boxShadow};
  cursor: pointer;
  transition: all 0.18s ease;
  
  &:hover, &:focus {
    background: ${({ $variant, theme }) => 
      $variant === 'secondary' 
        ? theme.colors.primary 
        : theme.components.button.hoverBackground
    };
    color: ${({ theme }) => theme.colors.surface};
    outline: none;
    box-shadow: 0 8px 32px ${({ theme }) => theme.colors.primary}29;
    transform: scale(1.045);
  }
  
  &:active {
    background: ${({ $variant, theme }) => 
      $variant === 'secondary' 
        ? theme.colors.primaryDark 
        : theme.components.button.activeBackground
    };
    transform: scale(0.98);
  }
  
  &:disabled {
    background: ${({ theme }) => theme.components.button.disabledBackground};
    color: ${({ theme }) => theme.components.button.disabledColor};
    opacity: ${({ theme }) => theme.components.button.disabledOpacity};
    cursor: ${({ theme }) => theme.components.button.disabledCursor};
  }
`;

const ImportantStatsHeadline = styled(Headline)`
  font-size: 18px;
  margin: 0;
  color: ${({ theme }) => theme.colors.primaryDark};
  text-align: center;
`;

const Statistiken: React.FC = () => {
  const theme = useTheme();
  const { benutzer } = useUser();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (benutzer?.role !== 'SUPER_ADMIN') return;
    setLoading(true);
    getSuperAdminStats()
      .then(setStats)
      .catch(() => setError('Fehler beim Laden der Statistiken.'))
      .finally(() => setLoading(false));
  }, [benutzer]);

  if (benutzer?.role !== 'SUPER_ADMIN') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading) return <AnimatedMascotsLoader text="Lade Statistiken..." />;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;

  const importantStats = [
    { key: 'users', label: 'Alle Nutzer', icon: <FaUsers size={24} color={theme.colors.surface} />, color: theme.colors.primary, trend: 'neutral' as const },
    { key: 'activeUsers', label: 'Aktive Nutzer (7 Tage)', icon: <FaUsers size={24} color={theme.colors.surface} />, color: theme.colors.primaryDark, trend: 'neutral' as const },
    { key: 'admins', label: 'Admins (Kita-Leitung)', icon: <FaUserTie size={24} color={theme.colors.surface} />, color: theme.colors.primaryDark, trend: 'neutral' as const },
    { key: 'educators', label: 'Erzieher:innen', icon: <FaChalkboardTeacher size={24} color={theme.colors.surface} />, color: theme.colors.accent, trend: 'neutral' as const },
    { key: 'parents', label: 'Eltern', icon: <FaUserFriends size={24} color={theme.colors.surface} />, color: theme.colors.accent, trend: 'neutral' as const },
    { key: 'children', label: 'Kinder', icon: <FaChild size={24} color={theme.colors.surface} />, color: theme.colors.error, trend: 'neutral' as const },
    { key: 'groups', label: 'Gruppen', icon: <FaLayerGroup size={24} color={theme.colors.surface} />, color: theme.colors.primary, trend: 'neutral' as const },
  ];
  const activityStats = [
    { key: 'checkins', label: 'Check-ins', icon: <FaSignInAlt size={24} color={theme.colors.surface} />, color: theme.colors.primary, trend: 'neutral' as const },
    { key: 'lateCheckins', label: 'Verspätete Check-ins', icon: <FaSignInAlt size={24} color={theme.colors.surface} />, color: theme.colors.error, trend: 'neutral' as const },
    { key: 'messages', label: 'Nachrichten', icon: <FaEnvelope size={24} color={theme.colors.surface} />, color: theme.colors.primary, trend: 'neutral' as const },
    { key: 'notifications', label: 'Benachrichtigungen', icon: <FaBell size={24} color={theme.colors.surface} />, color: theme.colors.accent, trend: 'neutral' as const },
    { key: 'activity', label: 'Aktivitäts-Logs', icon: <FaChartLine size={24} color={theme.colors.surface} />, color: theme.colors.primary, trend: 'neutral' as const },
  ];
  const securityStats = [
    { key: 'failedLogins', label: 'Fehlgeschlagene Logins', icon: <FaSignInAlt size={24} color={theme.colors.surface} />, color: theme.colors.error, trend: 'neutral' as const },
  ];

  function downloadCSV(stats: any) {
    const rows = Object.entries(stats)
      .filter(([key, value]) => typeof value === 'number' || typeof value === 'string')
      .map(([key, value]) => ({ Kategorie: key, Wert: value }));
    const header = 'Kategorie;Wert\n';
    const csv = header + rows.map(r => `${r.Kategorie};${r.Wert}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plattform-statistiken.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPDF() {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000/api'}/reports/platform-stats?format=pdf`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Fehler beim PDF-Export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plattform-statistiken.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Fehler beim PDF-Export.');
    }
  }

  function getTrend(key: string) {
    if (stats.trends && stats.trends[key]) {
      return stats.trends[key];
    }
    return { up: false, value: 0 };
  }

  function renderStatRows(
    statsArr: Array<{ key: string; label: string; icon: React.ReactNode; color: string; trend: 'up' | 'down' | 'neutral' }>,
    stats: Record<string, number>,
    accentFirst = false
  ): React.ReactElement[] {
    const rows: React.ReactElement[] = [];
    for (let i = 0; i < statsArr.length; i += 3) {
      const row = statsArr.slice(i, i + 3);
      let cardWidth = '100%';
      if (row.length === 2) cardWidth = '48.5%';
      if (row.length === 3) cardWidth = '30%';
      rows.push(
        <StatRow key={i}>
          {row.map((meta, j) => {
            const trend = getTrend(meta.key);
            return (
              <StatCard
                key={meta.key}
                $accent={accentFirst && i + j === 0}
                $trend={trend.up ? 'up' : trend.value < 0 ? 'down' : 'neutral'}
                aria-label={meta.label}
                tabIndex={0}
                $cardWidth={cardWidth}
              >
                <IconCircle color={meta.color}>{meta.icon}</IconCircle>
                <StatLabel>{meta.label}</StatLabel>
                <StatValue>
                  <span className="value">{stats[meta.key] ?? 0}</span>
                  <span className={`trend ${trend.up ? 'up' : trend.value < 0 ? 'down' : 'neutral'}`}>
                    {trend.up && <FaArrowUp />}
                    {trend.value < 0 && <FaArrowDown />}
                    {trend.value !== 0 && `${trend.value > 0 ? '+' : ''}${trend.value}%`}
                    {trend.value === 0 && '0%'}
                  </span>
                </StatValue>
              </StatCard>
            );
          })}
        </StatRow>
      );
    }
    return rows;
  }

  return (
    <>
      <Header title="Plattformweite Statistiken" />
      <div id="stats-section">
        <MascotSection>
          <BearWrapper>
            <MascotBear size={120} mood="happy" speechBubble={undefined} />
          </BearWrapper>
          <ImportantStatsHeadline as="div">
            Hier findest du alle wichtigen Zahlen!
          </ImportantStatsHeadline>
        </MascotSection>
        <ActionButtons>
          <ActionButton onClick={() => downloadCSV(stats)} aria-label="Statistiken als CSV exportieren">
            <FaDownload /> CSV Export
          </ActionButton>
          <ActionButton $variant="secondary" onClick={downloadPDF} aria-label="Statistiken als PDF exportieren">
            <FaChartLine /> PDF Export
          </ActionButton>
        </ActionButtons>
        <SectionHeadline>Nutzerstatistiken</SectionHeadline>
        {renderStatRows(importantStats, stats, true)}
        <Divider />
        <SectionHeadline>Aktivitätsstatistiken</SectionHeadline>
        {renderStatRows(activityStats, stats)}
        <Divider />
        <SectionHeadline>Sicherheitsstatistiken</SectionHeadline>
        {renderStatRows(securityStats, stats)}
      </div>
    </>
  );
};

export default Statistiken; 