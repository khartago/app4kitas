import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  AnimatedMascotsLoader,
  BrandedErrorMsg,
  EmptyState,
  Headline,
  Card,
} from '../../components/ui/AdminDashboardUI';
import { getAdminStats, fetchCheckinStats, fetchGroups } from '../../services/adminApi';
import { fetchMonthlyReport, exportMonthlyReport, exportMonthlyReportPDF } from '../../services/reportApi';
import Header from '../../components/Header';
import { useUser } from '../../components/UserContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaChild, FaLayerGroup, FaChalkboardTeacher, FaUserFriends, FaSignInAlt, FaEnvelope, FaBell, FaCalendarAlt, FaTasks, FaChartBar } from 'react-icons/fa';
import { useTheme } from 'styled-components';

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 16px 64px 16px;
`;
const Section = styled.section`
  margin-bottom: 48px;
`;
const ChartSection = styled(Section)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  padding: 32px 24px 24px 24px;
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
const Table = styled.table`
  width: 100%;
  margin-top: 24px;
  border-collapse: collapse;
  th, td {
    padding: 10px 12px;
    border-bottom: 1px solid #e0e0e0;
    text-align: left;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  th {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 600;
  }
`;
const ActivitiesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  li {
    margin-bottom: 10px;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 15px;
  }
`;
const TasksList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  li {
    margin-bottom: 10px;
    color: ${({ theme }) => theme.colors.error};
    font-size: 15px;
    font-weight: 500;
  }
`;
const CardSection = styled(Card)`
  margin-bottom: 36px;
  padding: 32px 24px 24px 24px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.surface};
`;
const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  min-height: 36px;
`;
const SectionHeadlineWithIcon = styled.h2`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.headline2.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.headline2.fontWeight};
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1;
  margin: 0;
  gap: 10px;
`;
const SectionIcon = styled.span`
  display: flex;
  align-items: center;
  height: 1em;
  svg {
    width: 1.2em;
    height: 1.2em;
    vertical-align: middle;
  }
`;
const controlFont = `
  font-family: 'Inter', Arial, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
`;
const ExportRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
  width: 100%;
`;
const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`;
const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 4px;
`;
const StyledExportButton = styled(ExportButton)`
  height: 44px;
  padding: 0 18px;
  font-size: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  flex: 1 1 0;
`;
const StyledSelect = styled.select`
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;
  box-sizing: border-box;
  appearance: none;
  flex: 1 1 0;
`;
const StyledMonthInput = styled.input`
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;
  box-sizing: border-box;
  appearance: none;
  flex: 1 1 0;
`;
const ActivityIcon = styled.span`
  margin-right: 10px;
  display: inline-flex;
  align-items: center;
`;
const statMeta = [
  { key: 'children', label: 'Kinder', icon: <FaChild size={24} color="#fff" />, color: '#FF7043' },
  { key: 'groups', label: 'Gruppen', icon: <FaLayerGroup size={24} color="#fff" />, color: '#7B1FA2' },
  { key: 'educators', label: 'Erzieher', icon: <FaChalkboardTeacher size={24} color="#fff" />, color: '#1976D2' },
  { key: 'parents', label: 'Eltern', icon: <FaUserFriends size={24} color="#fff" />, color: '#FFC107' },
  { key: 'checkins', label: 'Check-ins', icon: <FaSignInAlt size={24} color="#fff" />, color: '#009688' },
  { key: 'messages', label: 'Nachrichten', icon: <FaEnvelope size={24} color="#fff" />, color: '#0288D1' },
  { key: 'notifications', label: 'Benachrichtigungen', icon: <FaBell size={24} color="#fff" />, color: '#FFB300' },
];

const Statistiken: React.FC = () => {
  const { benutzer } = useUser();
  const theme = useTheme();
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [checkinChartData, setCheckinChartData] = useState<any[]>([]);
  const [checkinLoading, setCheckinLoading] = useState(true);
  const [checkinError, setCheckinError] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    if (!benutzer?.institutionId) return;
    setLoading(true);
    getAdminStats()
      .then(setStats)
      .catch(() => setError('Fehler beim Laden der Statistiken.'))
      .finally(() => setLoading(false));
  }, [benutzer]);

  useEffect(() => {
    if (!benutzer?.institutionId) return;
    setReportLoading(true);
    fetchMonthlyReport(month, selectedGroup || undefined, benutzer.institutionId)
      .then(data => setReport(data.report))
      .catch(() => setReportError('Fehler beim Laden des Monatsberichts.'))
      .finally(() => setReportLoading(false));
  }, [month, benutzer, selectedGroup]);

  useEffect(() => {
    setCheckinLoading(true);
    fetchCheckinStats()
      .then(data => {
        if (data && data.last7Days) {
          setCheckinChartData(data.last7Days.map((d: any) => ({ datum: d.label, Checkins: d.count })));
        } else {
          setCheckinChartData([]);
        }
      })
      .catch(() => setCheckinError('Fehler beim Laden der Check-in-Statistiken.'))
      .finally(() => setCheckinLoading(false));
  }, [benutzer]);

  useEffect(() => {
    if (!benutzer?.institutionId) return;
    fetchGroups().then(setGroups).catch(() => setGroups([]));
  }, [benutzer]);

  if (!benutzer?.institutionId) {
    return <BrandedErrorMsg>Kein Institutionskontext gefunden.</BrandedErrorMsg>;
  }

  // Stat card rows
  const statRows = [];
  for (let i = 0; i < statMeta.length; i += 3) {
    const row = statMeta.slice(i, i + 3);
    let cardWidth = '100%';
    if (row.length === 2) cardWidth = '48.5%';
    if (row.length === 3) cardWidth = '30%';
    statRows.push(
      <StatRow key={i}>
        {row.map(meta => (
          <StatCard key={meta.key} cardWidth={cardWidth}>
            <IconCircle color={meta.color}>{meta.icon}</IconCircle>
            <StatLabel>{meta.label}</StatLabel>
            <StatValue>{stats?.[meta.key] ?? '-'}</StatValue>
          </StatCard>
        ))}
      </StatRow>
    );
  }

  return (
    <PageWrapper>
      <Header title="Statistiken & Berichte" />
      <Section>
        <CardHeader>
          <SectionIcon><FaChartBar color={theme.colors.primary} /></SectionIcon>
          <SectionHeadlineWithIcon>Überblick</SectionHeadlineWithIcon>
        </CardHeader>
        {loading ? (
          <AnimatedMascotsLoader text="Lädt Statistiken..." />
        ) : error ? (
          <BrandedErrorMsg>{error}</BrandedErrorMsg>
        ) : (
          <>{statRows}</>
        )}
      </Section>
      <CardSection>
        <CardHeader>
          <SectionIcon><FaChartBar color={theme.colors.primary} /></SectionIcon>
          <SectionHeadlineWithIcon>Check-in Statistiken (letzte 7 Tage)</SectionHeadlineWithIcon>
        </CardHeader>
        {checkinLoading ? (
          <AnimatedMascotsLoader text="Lädt Check-in-Statistiken..." />
        ) : checkinError ? (
          <BrandedErrorMsg>{checkinError}</BrandedErrorMsg>
        ) : checkinChartData.length === 0 ? (
          <EmptyState text="Keine Check-in-Daten für die letzten 7 Tage." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={checkinChartData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="datum" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value: any) => [value, 'Check-ins']} />
              <Bar dataKey="Checkins" fill="#4CAF50" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardSection>
      <CardSection>
        <CardHeader>
          <SectionIcon><FaChartBar color={theme.colors.primary} /></SectionIcon>
          <SectionHeadlineWithIcon>Letzte Aktivitäten</SectionHeadlineWithIcon>
        </CardHeader>
        {stats?.recentActivities?.length ? (
          <ActivitiesList>
            {stats.recentActivities.map((a: any, idx: number) => (
              <li key={idx}>
                <ActivityIcon>{a.type === 'checkin' ? <FaSignInAlt color="#4CAF50" /> : a.type === 'message' ? <FaEnvelope color="#0288D1" /> : <FaBell color="#FFB300" />}</ActivityIcon>
                {a.text}
              </li>
            ))}
          </ActivitiesList>
        ) : (
          <EmptyState text="Keine Aktivitäten gefunden." />
        )}
        {stats?.openTasks?.length ? (
          <>
            <SectionHeadline as="h3">Offene Aufgaben</SectionHeadline>
            <TasksList>
              {stats.openTasks.map((t: string, idx: number) => (
                <li key={idx}><ActivityIcon><FaTasks color="#FFC107" /></ActivityIcon>{t}</li>
              ))}
            </TasksList>
          </>
        ) : null}
      </CardSection>
      <CardSection>
        <CardHeader>
          <SectionIcon><FaCalendarAlt color={theme.colors.primary} /></SectionIcon>
          <SectionHeadlineWithIcon>Monatsbericht</SectionHeadlineWithIcon>
        </CardHeader>
        <ExportRow>
          <FilterRow>
            <StyledSelect value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
              <option value="">Alle Gruppen</option>
              {groups.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </StyledSelect>
            <StyledMonthInput
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
            />
          </FilterRow>
          <ButtonRow>
            <StyledExportButton onClick={() => exportMonthlyReport(month, selectedGroup || undefined, benutzer.institutionId)}>
              Monatsbericht als CSV exportieren
            </StyledExportButton>
            <StyledExportButton onClick={() => exportMonthlyReportPDF(month, selectedGroup || undefined, benutzer.institutionId)}>
              Monatsbericht als PDF exportieren
            </StyledExportButton>
          </ButtonRow>
        </ExportRow>
        {reportLoading ? (
          <AnimatedMascotsLoader text="Lädt Monatsbericht..." />
        ) : reportError ? (
          <BrandedErrorMsg>{reportError}</BrandedErrorMsg>
        ) : report.length === 0 ? (
          <EmptyState text="Keine Berichtsdaten gefunden." />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Anwesenheitstage</th>
              </tr>
            </thead>
            <tbody>
              {report.map((row: any) => (
                <tr key={row.childId}>
                  <td>{row.name}</td>
                  <td>{row.checkInDays}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </CardSection>
    </PageWrapper>
  );
};

export default Statistiken; 