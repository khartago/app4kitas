import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from 'styled-components';
import { 
  FaCalendarDay, 
  FaCalendarAlt, 
  FaClock, 
  FaChartLine, 
  FaUsers, 
  FaChartBar, 
  FaCalendarWeek,
  FaChevronRight
} from 'react-icons/fa';
import { 
  BrandedErrorMsg, 
  EmptyMascot,
  Card,
  Button
} from '../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader } from '../../components/ui/LoadingSpinner';
import Header from '../../components/Header';
import { useUser } from '../../components/UserContext';
import DailyReport from './reports/DailyReport';
import MonthlyReport from './reports/MonthlyReport';
import LatePickupsReport from './reports/LatePickupsReport';
import AbsencePatternsReport from './reports/AbsencePatternsReport';
import GroupPerformanceReport from './reports/GroupPerformanceReport';
import TimeAnalyticsReport from './reports/TimeAnalyticsReport';
import CustomRangeReport from './reports/CustomRangeReport';

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 16px 64px 16px;
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
  margin-bottom: 24px;
  min-height: 36px;
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

// Report Type Selector
const ReportSelector = styled.div`
  margin-bottom: 32px;
`;

const ReportTabs = styled.div`
  display: flex;
  gap: 4px;
  background: ${({ theme }) => theme.colors.border}20;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 16px;
  overflow-x: auto;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 2px;
  }
`;

const ReportTab = styled.button<{ $isSelected: boolean; $isAvailable: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: ${({ theme, $isSelected, $isAvailable }) => 
    $isSelected ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $isSelected, $isAvailable }) => 
    $isSelected ? '#fff' : $isAvailable ? theme.colors.textPrimary : theme.colors.textSecondary};
  font-weight: 600;
  font-size: 14px;
  cursor: ${({ $isAvailable }) => $isAvailable ? 'pointer' : 'not-allowed'};
  transition: all 0.2s ease;
  opacity: ${({ $isAvailable }) => $isAvailable ? 1 : 0.6};
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background: ${({ theme, $isSelected, $isAvailable }) => 
      $isSelected ? theme.colors.primary : $isAvailable ? theme.colors.border : 'transparent'};
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
    gap: 6px;
  }
`;

const ReportTabIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
  }
`;

const ReportDescription = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
`;

const ReportDescriptionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ReportDescriptionText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

const ComingSoonBadge = styled.span`
  background: ${({ theme }) => theme.colors.accent};
  color: #212121;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  margin-left: auto;
`;

// Report Content Area
const ReportContent = styled.div`
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Reports: React.FC = () => {
  const theme = useTheme();
  const { benutzer } = useUser();
  const [selectedReport, setSelectedReport] = useState('daily');

  const reportTypes = [
    {
      id: 'daily',
      name: 'Tagesbericht',
      description: 'Detaillierte Übersicht über Anwesenheit, Check-ins und Check-outs für einen bestimmten Tag. Zeigt aktuelle Anwesenheit, Ankunftszeiten und Abholzeiten.',
      icon: FaCalendarDay,
      status: 'Verfügbar',
      available: true
    },
    {
      id: 'monthly',
      name: 'Monatsbericht',
      description: 'Monatliche Zusammenfassung mit Anwesenheitsstatistiken, Durchschnitten und Trends. Berücksichtigt Schließtage der Einrichtung.',
      icon: FaCalendarAlt,
      status: 'Verfügbar',
      available: true
    },
    {
      id: 'late-pickups',
      name: 'Verspätete Abholungen',
      description: 'Analyse von verspäteten Abholungen und deren Häufigkeit. Identifiziert wiederkehrende Verspätungen und deren Auswirkungen.',
      icon: FaClock,
      status: 'Verfügbar',
      available: true
    },
    {
      id: 'absence-patterns',
      name: 'Fehlzeiten-Muster',
      description: 'Erkennung von Mustern bei Fehlzeiten und deren Ursachen. Hilft bei der Planung und Kommunikation mit Eltern.',
      icon: FaChartLine,
      status: 'Verfügbar',
      available: true
    },
    {
      id: 'group-performance',
      name: 'Gruppen-Performance',
      description: 'Vergleich der Anwesenheit und Aktivitäten zwischen verschiedenen Gruppen. Zeigt Stärken und Verbesserungsbereiche.',
      icon: FaUsers,
      status: 'Verfügbar',
      available: true
    },
    {
      id: 'time-analytics',
      name: 'Zeit-Analyse',
      description: 'Detaillierte Analyse der Ankunfts- und Abholzeiten. Optimiert Abläufe und Ressourcenplanung.',
      icon: FaChartBar,
      status: 'Verfügbar',
      available: true
    },
    {
      id: 'custom-range',
      name: 'Benutzerdefinierter Zeitraum',
      description: 'Berichte für frei wählbare Zeiträume mit individuellen Filtern. Flexibel für spezielle Anforderungen.',
      icon: FaCalendarWeek,
      status: 'Verfügbar',
      available: true
    }
  ];

  const handleReportSelect = (reportId: string) => {
    const report = reportTypes.find(r => r.id === reportId);
    if (report?.available) {
      setSelectedReport(reportId);
    }
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'daily':
        return <DailyReport />;
      case 'monthly':
        return <MonthlyReport />;
      case 'late-pickups':
        return <LatePickupsReport />;
      case 'absence-patterns':
        return <AbsencePatternsReport />;
      case 'group-performance':
        return <GroupPerformanceReport />;
      case 'time-analytics':
        return <TimeAnalyticsReport />;
      case 'custom-range':
        return <CustomRangeReport />;
      default:
        return (
          <EmptyMascot 
            text="Dieser Bericht ist noch in Entwicklung und wird bald verfügbar sein." 
          />
        );
    }
  };

  if (!benutzer?.institutionId) {
    return <BrandedErrorMsg>Kein Institutionskontext gefunden.</BrandedErrorMsg>;
  }

  return (
    <PageWrapper>
      <Header title="Berichte" />
      <CardSection>
        <CardHeader>
          <SectionIcon><FaChartBar color={theme.colors.primary} /></SectionIcon>
          <SectionHeadlineWithIcon>Berichte & Analysen</SectionHeadlineWithIcon>
        </CardHeader>
        
        {/* Report Type Selector */}
        <ReportSelector>
          <ReportTabs>
            {reportTypes.map((report) => (
              <ReportTab
                key={report.id}
                $isSelected={selectedReport === report.id}
                $isAvailable={report.available}
                onClick={() => handleReportSelect(report.id)}
              >
                <ReportTabIcon>
                  <report.icon />
                </ReportTabIcon>
                {report.name}
                {!report.available && <ComingSoonBadge>{report.status}</ComingSoonBadge>}
              </ReportTab>
            ))}
          </ReportTabs>
          
          {/* Report Description */}
          <ReportDescription>
            <ReportDescriptionTitle>
              {React.createElement(reportTypes.find(r => r.id === selectedReport)?.icon || FaChartBar)}
              {reportTypes.find(r => r.id === selectedReport)?.name}
            </ReportDescriptionTitle>
            <ReportDescriptionText>
              {reportTypes.find(r => r.id === selectedReport)?.description}
            </ReportDescriptionText>
          </ReportDescription>
        </ReportSelector>

        {/* Report Content */}
        <ReportContent>
          {renderReportContent()}
        </ReportContent>
      </CardSection>
    </PageWrapper>
  );
};

export default Reports; 