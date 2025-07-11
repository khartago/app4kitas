import React, { useState } from 'react';
import styled from 'styled-components';
import { Headline, Card } from '../../components/ui/AdminDashboardUI';
import Header from '../../components/Header';
import MascotBear from '../../components/ui/MascotBear';
import { FaUsers, FaChartLine, FaUserCheck, FaLayerGroup, FaEnvelope, FaBell, FaLock, FaUserShield, FaQrcode, FaInfoCircle } from 'react-icons/fa';
import { handleExport } from '../../services/reportApi';
import { useTheme } from 'styled-components';

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 28px;
  margin-top: 40px;
  justify-items: center;
`;

const ReportCard = styled(Card)`
  min-width: 0;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 38px 28px 28px 28px;
  box-shadow: ${({ theme }) => theme.components.card.boxShadow};
  border-radius: 28px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  margin-bottom: 0;
  transition: box-shadow 0.18s, border 0.18s, transform 0.18s, background 0.18s;
  &:hover, &:focus {
    box-shadow: 0 12px 40px ${({ theme }) => theme.colors.primary}22;
    border: 2.5px solid ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surface};
    transform: translateY(-3px) scale(1.012);
    outline: none;
  }
`;

const ReportIcon = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #FFFDE7;
  border: 2.5px solid ${({ theme }) => theme.colors.accent}99;
  margin: 0 auto 22px auto;
  box-shadow: 0 2px 12px ${({ theme }) => theme.colors.accent}0F;
  svg { font-size: 36px; color: #FFD600; }
`;

const ReportTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-bottom: 2px;
`;

const ReportTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.headline2.fontSize};
  font-weight: ${({ theme }) => theme.typography.headline2.fontWeight};
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 2px 0;
  text-align: center;
`;

const TooltipIcon = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.accent};
  svg { font-size: 1.15em; }
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
  }
`;

const Tooltip = styled.span`
  visibility: hidden;
  opacity: 0;
  width: 220px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: left;
  border-radius: 8px;
  padding: 10px 14px;
  position: absolute;
  z-index: 10;
  left: 50%;
  top: 120%;
  transform: translateX(-50%);
  box-shadow: 0 4px 16px rgba(44,62,80,0.13);
  font-size: 0.98em;
  transition: opacity 0.18s;
  ${TooltipIcon}:hover &,
  ${TooltipIcon}:focus & {
    visibility: visible;
    opacity: 1;
  }
`;

const ReportSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.02em;
  margin: 0 0 18px 0;
  text-align: center;
`;

const CardSection = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 14px;
  padding: 16px 12px 10px 12px;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const PresetRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  justify-content: center;
`;

const PresetButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  font-weight: ${({ theme }) => theme.typography.body2.fontWeight};
  border: none;
  border-radius: 8px;
  padding: 7px 18px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, transform 0.18s;
  &:hover, &:focus {
    background: #A5F3C7;
    color: ${({ theme }) => theme.colors.primary};
    outline: none;
    transform: scale(1.045);
  }
  &:active {
    background: ${({ theme }) => theme.colors.surfaceAlt};
    color: ${({ theme }) => theme.colors.primary};
    transform: scale(0.98);
  }
  &:disabled {
    background: ${({ theme }) => theme.components.button.disabledBackground};
    color: ${({ theme }) => theme.components.button.disabledColor};
    opacity: ${({ theme }) => theme.components.button.disabledOpacity};
    cursor: ${({ theme }) => theme.components.button.disabledCursor};
  }
`;

const ReportInputRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  width: 100%;
  justify-content: center;
  align-items: center;
  label {
    font-size: 1.05em;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textSecondary};
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
  }
  input[type="date"], input[type="number"] {
    padding: 9px 16px;
    border-radius: 8px;
    border: 1.5px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 1.08em;
    width: 140px;
    transition: border 0.18s;
    &:focus {
      border-color: ${({ theme }) => theme.colors.accent};
      outline: none;
    }
  }
`;

const ReportButtonRow = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 18px;
  width: 100%;
  justify-content: center;
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
`;

const ReportButton = styled.a<{ disabled?: boolean }>`
  flex: 1 1 0;
  text-align: center;
  padding: 12px 0;
  border-radius: 10px;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary} 90%, ${({ theme }) => theme.colors.accent} 100%);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  font-size: 1.08em;
  box-shadow: ${({ theme }) => theme.components.button.boxShadow};
  transition: background 0.18s, box-shadow 0.18s, color 0.18s, transform 0.18s;
  pointer-events: ${({ disabled }) => disabled ? 'none' : 'auto'};
  opacity: ${({ disabled, theme }) => disabled ? theme.components.button.disabledOpacity : 1};
  cursor: ${({ disabled, theme }) => disabled ? theme.components.button.disabledCursor : theme.components.button.cursor};
  border: none;
  &:hover, &:focus {
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primaryDark} 90%, ${({ theme }) => theme.colors.accent} 100%);
    color: #fff;
    outline: none;
    box-shadow: 0 4px 16px ${({ theme }) => theme.colors.primary}22;
    transform: scale(1.045);
  }
  &:active {
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary} 90%, ${({ theme }) => theme.colors.accent} 100%);
    transform: scale(0.98);
  }
  &:disabled {
    background: ${({ theme }) => theme.components.button.disabledBackground};
    color: ${({ theme }) => theme.components.button.disabledColor};
    opacity: ${({ theme }) => theme.components.button.disabledOpacity};
    cursor: ${({ theme }) => theme.components.button.disabledCursor};
  }
`;

const ErrorMsg = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.98em;
  margin-bottom: 8px;
  margin-top: 2px;
`;

const SectionHeadline = styled(Headline)`
  margin-top: 38px;
  margin-bottom: 10px;
  font-size: ${({ theme }) => theme.typography.headline2.fontSize};
  color: ${({ theme }) => theme.colors.primary};
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

function getDefaultYearRange() {
  const now = new Date();
  const year = now.getFullYear();
  return {
    from: `${year}-01-01`,
    to: `${year}-12-31`,
  };
}
function getLastNDaysRange(n: number) {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const fromDate = new Date(now.getTime() - (n - 1) * 24 * 60 * 60 * 1000);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

const tooltips = {
  userGrowth: 'Zeigt das Wachstum der Nutzerbasis im gewählten Zeitraum.',
  activeUsers: 'Listet Nutzer, die in den letzten X Tagen aktiv waren.',
  checkinTrends: 'Alle Check-ins (An- und Abmeldungen) im gewählten Zeitraum.',
  activeGroups: 'Gruppen mit Aktivität (z.B. Check-ins, Nachrichten) im Zeitraum.',
  messageVolume: 'Gesendete Nachrichten im gewählten Zeitraum.',
  notificationStats: 'Alle Benachrichtigungen, die im Zeitraum verschickt wurden.',
  failedLogins: 'Alle fehlgeschlagenen Login-Versuche im Zeitraum.',
  groupAttendance: 'Durchschnittliche Anwesenheit pro Gruppe im Zeitraum.',
  checkinMethods: 'Verteilung der Check-in Methoden (QR-Code oder manuell) im Zeitraum.'
};

const Reports: React.FC = () => {
  const theme = useTheme();
  // Shared state for all date range reports
  const defaultRange = getDefaultYearRange();
  const [userGrowth, setUserGrowth] = useState(defaultRange);
  const [checkinTrends, setCheckinTrends] = useState(defaultRange);
  const [activeGroups, setActiveGroups] = useState(defaultRange);
  const [messageVolume, setMessageVolume] = useState(defaultRange);
  const [notificationStats, setNotificationStats] = useState(defaultRange);
  const [failedLogins, setFailedLogins] = useState(defaultRange);
  const [groupAttendance, setGroupAttendance] = useState(defaultRange);
  const [checkinMethods, setCheckinMethods] = useState(defaultRange);
  const [activeUsersDays, setActiveUsersDays] = useState(7);

  // Validation helpers
  function isRangeInvalid(range: { from: string; to: string }) {
    return range.from > range.to;
  }
  function isDaysInvalid(days: number) {
    return isNaN(days) || days < 1 || days > 365;
  }

  // Preset handlers
  function setPreset(setter: (r: { from: string; to: string }) => void, preset: 'year' | '30' | '7') {
    if (preset === 'year') setter(getDefaultYearRange());
    if (preset === '30') setter(getLastNDaysRange(30));
    if (preset === '7') setter(getLastNDaysRange(7));
  }

  return (
  <>
    <Header title="Berichte & Auswertungen" />
      <MascotSection>
        <BearWrapper>
          <MascotBear size={120} mood="happy" />
        </BearWrapper>
        <Headline as="div" style={{ fontSize: 18, margin: 0, color: theme.colors.primaryDark, textAlign: 'center' }}>
          Willkommen zu den plattformweiten Berichten!<br />
          Hier findest du alle wichtigen Auswertungen für Wachstum, Aktivität und Sicherheit.
        </Headline>
      </MascotSection>
      <SectionHeadline as="h2">Nutzer & Aktivität</SectionHeadline>
      <ReportGrid>
        {/* Benutzerwachstum */}
        <ReportCard>
          <ReportIcon><FaUsers /></ReportIcon>
          <ReportTitleRow>
            <ReportTitle>Benutzerwachstum</ReportTitle>
            <TooltipIcon tabIndex={0} aria-label="Info">
              <FaInfoCircle />
              <Tooltip>{tooltips.userGrowth}</Tooltip>
            </TooltipIcon>
          </ReportTitleRow>
          <ReportSubtitle>Neue Nutzer im Zeitraum.</ReportSubtitle>
          <CardSection>
            <PresetRow>
              <PresetButton onClick={() => setPreset(setUserGrowth, 'year')}>Dieses Jahr</PresetButton>
              <PresetButton onClick={() => setPreset(setUserGrowth, '30')}>Letzte 30 Tage</PresetButton>
              <PresetButton onClick={() => setPreset(setUserGrowth, '7')}>Letzte 7 Tage</PresetButton>
            </PresetRow>
            <ReportInputRow>
              <label>Von:
                <input type="date" value={userGrowth.from} onChange={e => setUserGrowth(r => ({ ...r, from: e.target.value }))} />
              </label>
              <label>Bis:
                <input type="date" value={userGrowth.to} onChange={e => setUserGrowth(r => ({ ...r, to: e.target.value }))} />
              </label>
            </ReportInputRow>
          </CardSection>
          {isRangeInvalid(userGrowth) && <ErrorMsg>Das Enddatum darf nicht vor dem Startdatum liegen.</ErrorMsg>}
          <ReportButtonRow>
            <ReportButton as="button" onClick={() => handleExport('/reports/user-growth?from=' + userGrowth.from + '&to=' + userGrowth.to + '&format=pdf', 'user-growth-' + userGrowth.from + '_to_' + userGrowth.to + '.pdf')} disabled={isRangeInvalid(userGrowth)}>PDF Export</ReportButton>
            <ReportButton as="button" onClick={() => handleExport('/reports/user-growth?from=' + userGrowth.from + '&to=' + userGrowth.to + '&format=csv', 'user-growth-' + userGrowth.from + '_to_' + userGrowth.to + '.csv')} disabled={isRangeInvalid(userGrowth)}>CSV Export</ReportButton>
          </ReportButtonRow>
        </ReportCard>
        {/* Aktive Nutzer */}
        <ReportCard>
          <ReportIcon><FaUserCheck /></ReportIcon>
          <ReportTitleRow>
            <ReportTitle>Aktive Nutzer</ReportTitle>
            <TooltipIcon tabIndex={0} aria-label="Info">
              <FaInfoCircle />
              <Tooltip>{tooltips.activeUsers}</Tooltip>
            </TooltipIcon>
          </ReportTitleRow>
          <ReportSubtitle>Nutzer mit Aktivität in den letzten X Tagen.</ReportSubtitle>
          <CardSection>
            <PresetRow>
              <PresetButton onClick={() => setActiveUsersDays(7)}>Letzte 7 Tage</PresetButton>
              <PresetButton onClick={() => setActiveUsersDays(30)}>Letzte 30 Tage</PresetButton>
              <PresetButton onClick={() => setActiveUsersDays(90)}>Letzte 90 Tage</PresetButton>
            </PresetRow>
            <ReportInputRow>
              <label>Tage:
                <input type="number" min={1} max={365} value={activeUsersDays} onChange={e => setActiveUsersDays(Number(e.target.value))} />
              </label>
            </ReportInputRow>
          </CardSection>
          {isDaysInvalid(activeUsersDays) && <ErrorMsg>Bitte gib eine Zahl zwischen 1 und 365 ein.</ErrorMsg>}
          <ReportButtonRow>
            <ReportButton as="button" onClick={() => handleExport('/reports/active-users?days=' + activeUsersDays + '&format=pdf', 'active-users-' + activeUsersDays + 'days.pdf')} disabled={isDaysInvalid(activeUsersDays)}>PDF Export</ReportButton>
            <ReportButton as="button" onClick={() => handleExport('/reports/active-users?days=' + activeUsersDays + '&format=csv', 'active-users-' + activeUsersDays + 'days.csv')} disabled={isDaysInvalid(activeUsersDays)}>CSV Export</ReportButton>
          </ReportButtonRow>
        </ReportCard>
        {/* Check-in Trends */}
        <ReportCard>
          <ReportIcon><FaChartLine /></ReportIcon>
          <ReportTitleRow>
            <ReportTitle>Check-in Trends</ReportTitle>
            <TooltipIcon tabIndex={0} aria-label="Info">
              <FaInfoCircle />
              <Tooltip>{tooltips.checkinTrends}</Tooltip>
            </TooltipIcon>
          </ReportTitleRow>
          <ReportSubtitle>Alle Check-ins im Zeitraum.</ReportSubtitle>
          <CardSection>
            <PresetRow>
              <PresetButton onClick={() => setPreset(setCheckinTrends, 'year')}>Dieses Jahr</PresetButton>
              <PresetButton onClick={() => setPreset(setCheckinTrends, '30')}>Letzte 30 Tage</PresetButton>
              <PresetButton onClick={() => setPreset(setCheckinTrends, '7')}>Letzte 7 Tage</PresetButton>
            </PresetRow>
            <ReportInputRow>
              <label>Von:
                <input type="date" value={checkinTrends.from} onChange={e => setCheckinTrends(r => ({ ...r, from: e.target.value }))} />
              </label>
              <label>Bis:
                <input type="date" value={checkinTrends.to} onChange={e => setCheckinTrends(r => ({ ...r, to: e.target.value }))} />
              </label>
            </ReportInputRow>
          </CardSection>
          {isRangeInvalid(checkinTrends) && <ErrorMsg>Das Enddatum darf nicht vor dem Startdatum liegen.</ErrorMsg>}
          <ReportButtonRow>
            <ReportButton as="button" onClick={() => handleExport('/reports/checkin-trends?from=' + checkinTrends.from + '&to=' + checkinTrends.to + '&format=pdf', 'checkin-trends-' + checkinTrends.from + '_to_' + checkinTrends.to + '.pdf')} disabled={isRangeInvalid(checkinTrends)}>PDF Export</ReportButton>
            <ReportButton as="button" onClick={() => handleExport('/reports/checkin-trends?from=' + checkinTrends.from + '&to=' + checkinTrends.to + '&format=csv', 'checkin-trends-' + checkinTrends.from + '_to_' + checkinTrends.to + '.csv')} disabled={isRangeInvalid(checkinTrends)}>CSV Export</ReportButton>
          </ReportButtonRow>
        </ReportCard>
        {/* Aktive Gruppen */}
        <ReportCard>
          <ReportIcon><FaLayerGroup /></ReportIcon>
          <ReportTitleRow>
            <ReportTitle>Aktive Gruppen</ReportTitle>
            <TooltipIcon tabIndex={0} aria-label="Info">
              <FaInfoCircle />
              <Tooltip>{tooltips.activeGroups}</Tooltip>
            </TooltipIcon>
          </ReportTitleRow>
          <ReportSubtitle>Gruppen mit Aktivität im Zeitraum.</ReportSubtitle>
          <CardSection>
            <PresetRow>
              <PresetButton onClick={() => setPreset(setActiveGroups, 'year')}>Dieses Jahr</PresetButton>
              <PresetButton onClick={() => setPreset(setActiveGroups, '30')}>Letzte 30 Tage</PresetButton>
              <PresetButton onClick={() => setPreset(setActiveGroups, '7')}>Letzte 7 Tage</PresetButton>
            </PresetRow>
            <ReportInputRow>
              <label>Von:
                <input type="date" value={activeGroups.from} onChange={e => setActiveGroups(r => ({ ...r, from: e.target.value }))} />
              </label>
              <label>Bis:
                <input type="date" value={activeGroups.to} onChange={e => setActiveGroups(r => ({ ...r, to: e.target.value }))} />
              </label>
            </ReportInputRow>
          </CardSection>
          {isRangeInvalid(activeGroups) && <ErrorMsg>Das Enddatum darf nicht vor dem Startdatum liegen.</ErrorMsg>}
          <ReportButtonRow>
            <ReportButton as="button" onClick={() => handleExport('/reports/active-groups?from=' + activeGroups.from + '&to=' + activeGroups.to + '&format=pdf', 'active-groups-' + activeGroups.from + '_to_' + activeGroups.to + '.pdf')} disabled={isRangeInvalid(activeGroups)}>PDF Export</ReportButton>
            <ReportButton as="button" onClick={() => handleExport('/reports/active-groups?from=' + activeGroups.from + '&to=' + activeGroups.to + '&format=csv', 'active-groups-' + activeGroups.from + '_to_' + activeGroups.to + '.csv')} disabled={isRangeInvalid(activeGroups)}>CSV Export</ReportButton>
          </ReportButtonRow>
        </ReportCard>
        {/* Nachrichtenvolumen */}
        <ReportCard>
          <ReportIcon><FaEnvelope /></ReportIcon>
          <ReportTitleRow>
            <ReportTitle>Nachrichtenvolumen</ReportTitle>
            <TooltipIcon tabIndex={0} aria-label="Info">
              <FaInfoCircle />
              <Tooltip>{tooltips.messageVolume}</Tooltip>
            </TooltipIcon>
          </ReportTitleRow>
          <ReportSubtitle>Anzahl der Nachrichten im Zeitraum.</ReportSubtitle>
          <CardSection>
            <PresetRow>
              <PresetButton onClick={() => setPreset(setMessageVolume, 'year')}>Dieses Jahr</PresetButton>
              <PresetButton onClick={() => setPreset(setMessageVolume, '30')}>Letzte 30 Tage</PresetButton>
              <PresetButton onClick={() => setPreset(setMessageVolume, '7')}>Letzte 7 Tage</PresetButton>
            </PresetRow>
            <ReportInputRow>
              <label>Von:
                <input type="date" value={messageVolume.from} onChange={e => setMessageVolume(r => ({ ...r, from: e.target.value }))} />
              </label>
              <label>Bis:
                <input type="date" value={messageVolume.to} onChange={e => setMessageVolume(r => ({ ...r, to: e.target.value }))} />
              </label>
            </ReportInputRow>
          </CardSection>
          {isRangeInvalid(messageVolume) && <ErrorMsg>Das Enddatum darf nicht vor dem Startdatum liegen.</ErrorMsg>}
          <ReportButtonRow>
            <ReportButton as="button" onClick={() => handleExport('/reports/message-volume?from=' + messageVolume.from + '&to=' + messageVolume.to + '&format=pdf', 'message-volume-' + messageVolume.from + '_to_' + messageVolume.to + '.pdf')} disabled={isRangeInvalid(messageVolume)}>PDF Export</ReportButton>
            <ReportButton as="button" onClick={() => handleExport('/reports/message-volume?from=' + messageVolume.from + '&to=' + messageVolume.to + '&format=csv', 'message-volume-' + messageVolume.from + '_to_' + messageVolume.to + '.csv')} disabled={isRangeInvalid(messageVolume)}>CSV Export</ReportButton>
          </ReportButtonRow>
        </ReportCard>
        {/* Benachrichtigungsstatistiken */}
        <ReportCard>
          <ReportIcon><FaBell /></ReportIcon>
          <ReportTitleRow>
            <ReportTitle>Benachrichtigungsstatistiken</ReportTitle>
            <TooltipIcon tabIndex={0} aria-label="Info">
              <FaInfoCircle />
              <Tooltip>{tooltips.notificationStats}</Tooltip>
            </TooltipIcon>
          </ReportTitleRow>
          <ReportSubtitle>Alle Benachrichtigungen im Zeitraum.</ReportSubtitle>
          <CardSection>
            <PresetRow>
              <PresetButton onClick={() => setPreset(setNotificationStats, 'year')}>Dieses Jahr</PresetButton>
              <PresetButton onClick={() => setPreset(setNotificationStats, '30')}>Letzte 30 Tage</PresetButton>
              <PresetButton onClick={() => setPreset(setNotificationStats, '7')}>Letzte 7 Tage</PresetButton>
            </PresetRow>
            <ReportInputRow>
              <label>Von:
                <input type="date" value={notificationStats.from} onChange={e => setNotificationStats(r => ({ ...r, from: e.target.value }))} />
              </label>
              <label>Bis:
                <input type="date" value={notificationStats.to} onChange={e => setNotificationStats(r => ({ ...r, to: e.target.value }))} />
              </label>
            </ReportInputRow>
          </CardSection>
          {isRangeInvalid(notificationStats) && <ErrorMsg>Das Enddatum darf nicht vor dem Startdatum liegen.</ErrorMsg>}
          <ReportButtonRow>
            <ReportButton as="button" onClick={() => handleExport('/reports/notification-stats?from=' + notificationStats.from + '&to=' + notificationStats.to + '&format=pdf', 'notification-stats-' + notificationStats.from + '_to_' + notificationStats.to + '.pdf')} disabled={isRangeInvalid(notificationStats)}>PDF Export</ReportButton>
            <ReportButton as="button" onClick={() => handleExport('/reports/notification-stats?from=' + notificationStats.from + '&to=' + notificationStats.to + '&format=csv', 'notification-stats-' + notificationStats.from + '_to_' + notificationStats.to + '.csv')} disabled={isRangeInvalid(notificationStats)}>CSV Export</ReportButton>
          </ReportButtonRow>
        </ReportCard>
      </ReportGrid>
      <SectionHeadline as="h2">Sicherheit & Qualität</SectionHeadline>
      <ReportGrid>
        {/* Fehlgeschlagene Logins */}
        <ReportCard>
          <ReportIcon><FaLock /></ReportIcon>
          <ReportTitleRow>
            <ReportTitle>Fehlgeschlagene Logins</ReportTitle>
            <TooltipIcon tabIndex={0} aria-label="Info">
              <FaInfoCircle />
              <Tooltip>{tooltips.failedLogins}</Tooltip>
            </TooltipIcon>
          </ReportTitleRow>
          <ReportSubtitle>Alle fehlgeschlagenen Anmeldeversuche im Zeitraum.</ReportSubtitle>
          <CardSection>
            <PresetRow>
              <PresetButton onClick={() => setPreset(setFailedLogins, 'year')}>Dieses Jahr</PresetButton>
              <PresetButton onClick={() => setPreset(setFailedLogins, '30')}>Letzte 30 Tage</PresetButton>
              <PresetButton onClick={() => setPreset(setFailedLogins, '7')}>Letzte 7 Tage</PresetButton>
            </PresetRow>
            <ReportInputRow>
              <label>Von:
                <input type="date" value={failedLogins.from} onChange={e => setFailedLogins(r => ({ ...r, from: e.target.value }))} />
              </label>
              <label>Bis:
                <input type="date" value={failedLogins.to} onChange={e => setFailedLogins(r => ({ ...r, to: e.target.value }))} />
              </label>
            </ReportInputRow>
          </CardSection>
          {isRangeInvalid(failedLogins) && <ErrorMsg>Das Enddatum darf nicht vor dem Startdatum liegen.</ErrorMsg>}
          <ReportButtonRow>
            <ReportButton as="button" onClick={() => handleExport('/reports/failed-logins?from=' + failedLogins.from + '&to=' + failedLogins.to + '&format=pdf', 'failed-logins-' + failedLogins.from + '_to_' + failedLogins.to + '.pdf')} disabled={isRangeInvalid(failedLogins)}>PDF Export</ReportButton>
            <ReportButton as="button" onClick={() => handleExport('/reports/failed-logins?from=' + failedLogins.from + '&to=' + failedLogins.to + '&format=csv', 'failed-logins-' + failedLogins.from + '_to_' + failedLogins.to + '.csv')} disabled={isRangeInvalid(failedLogins)}>CSV Export</ReportButton>
          </ReportButtonRow>
        </ReportCard>
        {/* Gruppenanwesenheit */}
        <ReportCard>
          <ReportIcon><FaUserShield /></ReportIcon>
          <ReportTitleRow>
            <ReportTitle>Gruppenanwesenheit</ReportTitle>
            <TooltipIcon tabIndex={0} aria-label="Info">
              <FaInfoCircle />
              <Tooltip>{tooltips.groupAttendance}</Tooltip>
            </TooltipIcon>
          </ReportTitleRow>
          <ReportSubtitle>Durchschnittliche Anwesenheit pro Gruppe im Zeitraum.</ReportSubtitle>
          <CardSection>
            <PresetRow>
              <PresetButton onClick={() => setPreset(setGroupAttendance, 'year')}>Dieses Jahr</PresetButton>
              <PresetButton onClick={() => setPreset(setGroupAttendance, '30')}>Letzte 30 Tage</PresetButton>
              <PresetButton onClick={() => setPreset(setGroupAttendance, '7')}>Letzte 7 Tage</PresetButton>
            </PresetRow>
            <ReportInputRow>
              <label>Von:
                <input type="date" value={groupAttendance.from} onChange={e => setGroupAttendance(r => ({ ...r, from: e.target.value }))} />
              </label>
              <label>Bis:
                <input type="date" value={groupAttendance.to} onChange={e => setGroupAttendance(r => ({ ...r, to: e.target.value }))} />
              </label>
            </ReportInputRow>
          </CardSection>
          {isRangeInvalid(groupAttendance) && <ErrorMsg>Das Enddatum darf nicht vor dem Startdatum liegen.</ErrorMsg>}
          <ReportButtonRow>
            <ReportButton as="button" onClick={() => handleExport('/reports/group-attendance?from=' + groupAttendance.from + '&to=' + groupAttendance.to + '&format=pdf', 'group-attendance-' + groupAttendance.from + '_to_' + groupAttendance.to + '.pdf')} disabled={isRangeInvalid(groupAttendance)}>PDF Export</ReportButton>
            <ReportButton as="button" onClick={() => handleExport('/reports/group-attendance?from=' + groupAttendance.from + '&to=' + groupAttendance.to + '&format=csv', 'group-attendance-' + groupAttendance.from + '_to_' + groupAttendance.to + '.csv')} disabled={isRangeInvalid(groupAttendance)}>CSV Export</ReportButton>
          </ReportButtonRow>
        </ReportCard>
        {/* Check-in Methoden */}
        <ReportCard>
          <ReportIcon><FaQrcode /></ReportIcon>
          <ReportTitleRow>
            <ReportTitle>Check-in Methoden</ReportTitle>
            <TooltipIcon tabIndex={0} aria-label="Info">
              <FaInfoCircle />
              <Tooltip>{tooltips.checkinMethods}</Tooltip>
            </TooltipIcon>
          </ReportTitleRow>
          <ReportSubtitle>Verteilung der Check-in Methoden (QR/Manuell).</ReportSubtitle>
          <CardSection>
            <PresetRow>
              <PresetButton onClick={() => setPreset(setCheckinMethods, 'year')}>Dieses Jahr</PresetButton>
              <PresetButton onClick={() => setPreset(setCheckinMethods, '30')}>Letzte 30 Tage</PresetButton>
              <PresetButton onClick={() => setPreset(setCheckinMethods, '7')}>Letzte 7 Tage</PresetButton>
            </PresetRow>
            <ReportInputRow>
              <label>Von:
                <input type="date" value={checkinMethods.from} onChange={e => setCheckinMethods(r => ({ ...r, from: e.target.value }))} />
              </label>
              <label>Bis:
                <input type="date" value={checkinMethods.to} onChange={e => setCheckinMethods(r => ({ ...r, to: e.target.value }))} />
              </label>
            </ReportInputRow>
          </CardSection>
          {isRangeInvalid(checkinMethods) && <ErrorMsg>Das Enddatum darf nicht vor dem Startdatum liegen.</ErrorMsg>}
          <ReportButtonRow>
            <ReportButton as="button" onClick={() => handleExport('/reports/checkin-methods?from=' + checkinMethods.from + '&to=' + checkinMethods.to + '&format=pdf', 'checkin-methods-' + checkinMethods.from + '_to_' + checkinMethods.to + '.pdf')} disabled={isRangeInvalid(checkinMethods)}>PDF Export</ReportButton>
            <ReportButton as="button" onClick={() => handleExport('/reports/checkin-methods?from=' + checkinMethods.from + '&to=' + checkinMethods.to + '&format=csv', 'checkin-methods-' + checkinMethods.from + '_to_' + checkinMethods.to + '.csv')} disabled={isRangeInvalid(checkinMethods)}>CSV Export</ReportButton>
          </ReportButtonRow>
        </ReportCard>
      </ReportGrid>
  </>
);
};

export default Reports; 