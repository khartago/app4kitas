import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTheme } from 'styled-components';
import { FaCalendarAlt, FaFileCsv, FaFilePdf, FaSearch, FaSort, FaSortUp, FaSortDown, FaUsers, FaCalendarCheck, FaChartLine, FaStar } from 'react-icons/fa';
import { 
  BrandedErrorMsg, 
  EmptyMascot,
  Button
} from '../../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader } from '../../../components/ui/LoadingSpinner';
import { fetchMonthlyReport, exportMonthlyReport, exportMonthlyReportPDF } from '../../../services/reportApi';
import { fetchGroups } from '../../../services/adminApi';
import { useUser } from '../../../components/UserContext';

// KPI Cards Section - Adaptive Layout
const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const KPICard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 14px;
  }
`;

const KPIIcon = styled.div<{ color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
  font-size: 24px;
  
  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    font-size: 20px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
    font-size: 18px;
    margin-bottom: 10px;
  }
`;

const KPIValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 6px;
  line-height: 1.2;
  
  @media (max-width: 1200px) {
    font-size: 28px;
  }
  
  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 4px;
  }
  
  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

const KPILabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
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
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 4px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const StyledExportButton = styled(Button)`
  height: 44px;
  padding: 0 18px;
  font-size: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  flex: 1 1 0;
  background: ${({ theme }) => theme.colors.accent};
  color: #212121;
  box-shadow: 0 2px 8px rgba(255,193,7,0.10);
  transition: background 0.18s, color 0.18s;
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    outline: none;
  }
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
  min-width: 150px;
  
  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
  }
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
  min-width: 150px;
  
  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
  }
`;

// Enhanced Table Section
const TableContainer = styled.div`
  margin-top: 24px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 300px;
  
  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 12px 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  th {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;
    &:hover {
      background: ${({ theme }) => theme.colors.border};
    }
  }
  tbody tr {
    transition: background 0.2s;
    &:hover {
      background: ${({ theme }) => theme.colors.border}20;
    }
  }
  
  @media (max-width: 768px) {
    th, td {
      padding: 8px 12px;
      font-size: 14px;
    }
  }
  
  @media (max-width: 480px) {
    th, td {
      padding: 6px 8px;
      font-size: 13px;
    }
  }
`;

const SortIcon = styled.span`
  margin-left: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const AttendanceBadge = styled.span<{ $attendance: number }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $attendance }) => {
    if ($attendance >= 80) return '#4CAF5020';
    if ($attendance >= 60) return '#FF980020';
    return '#F4433620';
  }};
  color: ${({ $attendance }) => {
    if ($attendance >= 80) return '#4CAF50';
    if ($attendance >= 60) return '#FF9800';
    return '#F44336';
  }};
`;

const PerformanceIndicator = styled.div<{ $performance: 'excellent' | 'good' | 'average' | 'poor' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $performance }) => {
    switch ($performance) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#2196F3';
      case 'average': return '#FF9800';
      case 'poor': return '#F44336';
      default: return '#666';
    }
  }};
`;

const MonthlyReport: React.FC = () => {
  const theme = useTheme();
  const { benutzer } = useUser();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    if (!benutzer?.institutionId) return;
    fetchGroups().then(res => setGroups(res.groups || res));
  }, [benutzer]);

  useEffect(() => {
    if (!benutzer?.institutionId) return;
    setLoading(true);
    setError(null);
    fetchMonthlyReport(month, groupId, benutzer.institutionId)
      .then(data => setReport(data.report))
      .catch(() => setError('Fehler beim Laden des Berichts'))
      .finally(() => setLoading(false));
  }, [month, groupId, benutzer]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalChildren = report.length;
    const totalAttendanceDays = report.reduce((sum, r) => sum + r.checkInDays, 0);
    const avgAttendanceDays = totalChildren > 0 ? Math.round((totalAttendanceDays / totalChildren) * 10) / 10 : 0;
    const maxAttendanceDays = report.length > 0 ? Math.max(...report.map(r => r.checkInDays)) : 0;
    
    // Use working days from backend (which includes institution closed days)
    const workingDaysInMonth = report.length > 0 ? report[0].workingDaysInMonth : 22; // fallback
    const avgAttendanceRate = totalChildren > 0 ? Math.round((totalAttendanceDays / (totalChildren * workingDaysInMonth)) * 100) : 0;

    return {
      totalChildren,
      totalAttendanceDays,
      avgAttendanceDays,
      maxAttendanceDays,
      avgAttendanceRate,
      workingDaysInMonth
    };
  }, [report, month]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = report;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row => 
        row.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
    }
    
    return filtered;
  }, [report, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const getPerformanceLevel = (days: number) => {
    const workingDays = kpis.workingDaysInMonth;
    const percentage = (days / workingDays) * 100;
    
    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 60) return 'average';
    return 'poor';
  };

  const getAttendanceRate = (days: number) => {
    return Math.round((days / kpis.workingDaysInMonth) * 100);
  };

  const handleCSVExport = () => {
    if (!benutzer?.institutionId) return;
    exportMonthlyReport(month, groupId, benutzer.institutionId);
  };

  const handlePDFExport = async () => {
    if (!benutzer?.institutionId) return;
    try {
      await exportMonthlyReportPDF(month, groupId, benutzer.institutionId);
    } catch (error) {
      console.error('PDF Export error:', error);
    }
  };

  return (
    <>
      {/* KPI Cards */}
      <KPIGrid>
        <KPICard>
          <KPIIcon color="#4CAF50">
            <FaUsers />
          </KPIIcon>
          <KPIValue>{kpis.totalChildren}</KPIValue>
          <KPILabel>Gesamt Kinder</KPILabel>
        </KPICard>
        <KPICard>
          <KPIIcon color="#2196F3">
            <FaCalendarCheck />
          </KPIIcon>
          <KPIValue>{kpis.maxAttendanceDays}</KPIValue>
          <KPILabel>Beste Anwesenheit</KPILabel>
        </KPICard>
        <KPICard>
          <KPIIcon color="#FF9800">
            <FaChartLine />
          </KPIIcon>
          <KPIValue>{kpis.avgAttendanceDays}</KPIValue>
          <KPILabel>Ø Anwesenheitstage pro Kind</KPILabel>
        </KPICard>
        <KPICard>
          <KPIIcon color="#9C27B0">
            <FaStar />
          </KPIIcon>
          <KPIValue>{kpis.avgAttendanceRate}%</KPIValue>
          <KPILabel>Ø Anwesenheitsrate</KPILabel>
        </KPICard>
      </KPIGrid>

      <ExportRow>
        <FilterRow>
          <StyledSelect value={groupId} onChange={e => setGroupId(e.target.value)}>
            <option value="">Alle Gruppen</option>
            {groups.map(g => (
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
          <StyledExportButton onClick={handleCSVExport}>
            <FaFileCsv style={{ marginRight: 8 }} />
            Monatsbericht als CSV exportieren
          </StyledExportButton>
          <StyledExportButton onClick={handlePDFExport}>
            <FaFilePdf style={{ marginRight: 8 }} />
            Monatsbericht als PDF exportieren
          </StyledExportButton>
        </ButtonRow>
      </ExportRow>

      {loading ? (
        <AnimatedMascotsLoader text="Lädt Monatsbericht..." />
      ) : error ? (
        <BrandedErrorMsg>{error}</BrandedErrorMsg>
      ) : report.length === 0 ? (
        <EmptyMascot text="Keine Berichtsdaten gefunden." />
      ) : (
        <TableContainer>
          <TableHeader>
            <SearchContainer>
              <FaSearch color={theme.colors.textSecondary} />
              <SearchInput
                type="text"
                placeholder="Nach Namen suchen..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
            <div style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
              {filteredAndSortedData.length} von {report.length} Kindern
            </div>
          </TableHeader>
          <Table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>
                  Name
                  <SortIcon>{getSortIcon('name')}</SortIcon>
                </th>
                <th onClick={() => handleSort('checkInDays')}>
                  Anwesenheitstage
                  <SortIcon>{getSortIcon('checkInDays')}</SortIcon>
                </th>
                <th onClick={() => handleSort('checkInDays')}>
                  Anwesenheitsrate
                  <SortIcon>{getSortIcon('checkInDays')}</SortIcon>
                </th>
                <th>Leistung</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map(row => {
                const attendanceRate = getAttendanceRate(row.checkInDays);
                const performance = getPerformanceLevel(row.checkInDays);
                const workingDays = row.workingDaysInMonth || kpis.workingDaysInMonth;
                
                return (
                  <tr key={row.childId}>
                    <td>{row.name}</td>
                    <td>{row.checkInDays} von {workingDays}</td>
                    <td>
                      <AttendanceBadge $attendance={attendanceRate}>
                        {attendanceRate}%
                      </AttendanceBadge>
                    </td>
                    <td>
                      <PerformanceIndicator $performance={performance}>
                        {performance === 'excellent' && <FaStar />}
                        {performance === 'good' && <FaChartLine />}
                        {performance === 'average' && <FaCalendarCheck />}
                        {performance === 'poor' && <FaUsers />}
                        {performance === 'excellent' && 'Hervorragend'}
                        {performance === 'good' && 'Gut'}
                        {performance === 'average' && 'Durchschnitt'}
                        {performance === 'poor' && 'Verbesserung'}
                      </PerformanceIndicator>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default MonthlyReport; 