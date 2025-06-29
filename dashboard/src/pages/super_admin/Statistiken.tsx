import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../../components/UserContext';
import { fetchPlatformStats } from '../../services/reportApi';
import { AnimatedMascotsLoader, ErrorMsg, Card, Headline, StatGrid as BaseStatGrid } from '../../components/ui/AdminDashboardUI';
import Header from '../../components/Header';
import MascotBear from '../../components/ui/MascotBear';
import { FaUsers, FaUserTie, FaChalkboardTeacher, FaUserFriends, FaChild, FaLayerGroup, FaSignInAlt, FaEnvelope, FaBell } from 'react-icons/fa';

const StatCard = styled(Card)<{ accent?: boolean; cardWidth?: string }>`
  width: ${({ cardWidth }) => cardWidth || '100%'};
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 140px;
  border: ${({ accent, theme }) => accent ? `2.5px solid ${theme.colors.accent}` : theme.components.card.border};
  box-shadow: ${({ accent, theme }) => accent ? '0 4px 24px rgba(255,193,7,0.10)' : theme.components.card.boxShadow};
  padding: ${({ theme }) => theme.components.card.padding};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  margin: 0;
  @media (max-width: 900px) {
    width: 100%;
  }
  @media (max-width: 600px) {
    min-height: 100px;
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

const StatValue = styled.p`
  font-size: 2.2rem;
  font-weight: 700;
  margin: 8px 0 0 0;
  color: ${({ theme }) => theme.colors.primary};
  @media (max-width: 600px) {
    font-size: 1.3rem;
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

const ExportButton = styled.button`
  background: ${({ theme }) => theme.colors.accent};
  color: #212121;
  border: none;
  border-radius: 12px;
  padding: 10px 22px;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 auto 18px auto;
  display: block;
  box-shadow: 0 2px 8px rgba(255,193,7,0.10);
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    outline: none;
  }
`;

const statMeta = [
  { key: 'users', label: 'Alle Nutzer', icon: <FaUsers size={24} color="#fff" />, color: '#4CAF50' },
  { key: 'admins', label: 'Admins (Kita-Leitung)', icon: <FaUserTie size={24} color="#fff" />, color: '#388E3C' },
  { key: 'educators', label: 'Erzieher:innen', icon: <FaChalkboardTeacher size={24} color="#fff" />, color: '#1976D2' },
  { key: 'parents', label: 'Eltern', icon: <FaUserFriends size={24} color="#fff" />, color: '#FFC107' },
  { key: 'children', label: 'Kinder', icon: <FaChild size={24} color="#fff" />, color: '#FF7043' },
  { key: 'groups', label: 'Gruppen', icon: <FaLayerGroup size={24} color="#fff" />, color: '#7B1FA2' },
  { key: 'checkins', label: 'Check-ins', icon: <FaSignInAlt size={24} color="#fff" />, color: '#009688' },
  { key: 'messages', label: 'Nachrichten', icon: <FaEnvelope size={24} color="#fff" />, color: '#0288D1' },
  { key: 'notifications', label: 'Benachrichtigungen', icon: <FaBell size={24} color="#fff" />, color: '#FFB300' },
];

const userStats = statMeta.slice(0, 4); // Nutzer, Admins, Erzieher, Eltern
const activityStats = statMeta.slice(4); // Kinder, Gruppen, Check-ins, Nachrichten, Benachrichtigungen

function downloadCSV(stats: any) {
  const rows = Object.entries(stats).map(([key, value]) => ({ Kategorie: key, Wert: value }));
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

function renderStatRows(
  statsArr: Array<{ key: string; label: string; icon: React.ReactNode; color: string }>,
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
        {row.map((meta, j) => (
          <StatCard
            key={meta.key}
            accent={accentFirst && i + j === 0}
            aria-label={meta.label}
            tabIndex={0}
            cardWidth={cardWidth}
          >
            <IconCircle color={meta.color}>{meta.icon}</IconCircle>
            <StatLabel>{meta.label}</StatLabel>
            <StatValue>{stats[meta.key] ?? 0}</StatValue>
          </StatCard>
        ))}
      </StatRow>
    );
  }
  return rows;
}

const Statistiken: React.FC = () => {
  const { benutzer } = useUser();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (benutzer?.role !== 'SUPER_ADMIN') return;
    setLoading(true);
    fetchPlatformStats()
      .then(setStats)
      .catch(() => setError('Fehler beim Laden der Statistiken.'))
      .finally(() => setLoading(false));
  }, [benutzer]);

  if (benutzer?.role !== 'SUPER_ADMIN') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading) return <AnimatedMascotsLoader text="Lade Statistiken..." />;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;

  return (
    <>
      <Header title="Plattformweite Statistiken" />
      <MascotSection>
        <BearWrapper>
          <MascotBear size={120} mood="happy" speechBubble={undefined} />
        </BearWrapper>
        <Headline as="div" style={{ fontSize: 18, margin: 0, color: '#388E3C', textAlign: 'center' }}>
          Hier findest du alle wichtigen Zahlen!
        </Headline>
      </MascotSection>
      <ExportButton onClick={() => downloadCSV(stats)} aria-label="Statistiken als CSV exportieren">
        Statistiken als CSV exportieren
      </ExportButton>
      {renderStatRows(userStats, stats, true)}
      <Divider />
      {renderStatRows(activityStats, stats)}
    </>
  );
};

export default Statistiken; 