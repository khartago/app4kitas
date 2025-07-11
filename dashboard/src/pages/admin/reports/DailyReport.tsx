import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTheme } from 'styled-components';
import { FaCalendarAlt, FaFileCsv, FaFilePdf, FaSearch, FaSort, FaSortUp, FaSortDown, FaUsers, FaClock, FaCheckCircle } from 'react-icons/fa';
import { 
  BrandedErrorMsg, 
  EmptyMascot,
  Button
} from '../../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader } from '../../../components/ui/LoadingSpinner';
import { fetchDailyReport, exportDailyReport, exportDailyReportPDF } from '../../../services/reportApi';
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

const StyledDateInput = styled.input`
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

const StatusBadge = styled.span<{ $status: 'checked-in' | 'checked-out' | 'not-present' }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'checked-in': return '#4CAF5020';
      case 'checked-out': return '#FF980020';
      case 'not-present': return '#F4433620';
      default: return theme.colors.border;
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'checked-in': return '#4CAF50';
      case 'checked-out': return '#FF9800';
      case 'not-present': return '#F44336';
      default: return '#666';
    }
  }};
`;

const DailyReport: React.FC = () => {
  const theme = useTheme();
  const { benutzer } = useUser();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
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
    fetchDailyReport(date, groupId, benutzer.institutionId)
      .then(data => setReport(data.report))
      .catch(() => setError('Fehler beim Laden des Berichts'))
      .finally(() => setLoading(false));
  }, [date, groupId, benutzer]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalChildren = report.length;
    const currentlyPresent = report.filter(r => r.checkedIn && !r.checkedOut).length;
    const checkedInToday = report.filter(r => r.checkedIn).length;
    const checkedOutToday = report.filter(r => r.checkedOut).length;
    const attendanceRate = totalChildren > 0 ? Math.round((checkedInToday / totalChildren) * 100) : 0;

    return {
      totalChildren,
      currentlyPresent,
      checkedInToday,
      checkedOutToday,
      attendanceRate
    };
  }, [report]);

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

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return timeString;
    }
  };

  const handleCSVExport = () => {
    if (!benutzer?.institutionId) return;
    exportDailyReport(date, groupId, benutzer.institutionId);
  };

  const handlePDFExport = async () => {
    if (!benutzer?.institutionId) return;
    try {
      await exportDailyReportPDF(date, groupId, benutzer.institutionId);
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
            <FaCheckCircle />
          </KPIIcon>
          <KPIValue>{kpis.currentlyPresent}</KPIValue>
          <KPILabel>Aktuell anwesend</KPILabel>
        </KPICard>
        <KPICard>
          <KPIIcon color="#FF9800">
            <FaClock />
          </KPIIcon>
          <KPIValue>{kpis.checkedInToday}</KPIValue>
          <KPILabel>Heute eingecheckt</KPILabel>
        </KPICard>
        <KPICard>
          <KPIIcon color="#9C27B0">
            <FaUsers />
          </KPIIcon>
          <KPIValue>{kpis.attendanceRate}%</KPIValue>
          <KPILabel>Anwesenheitsrate</KPILabel>
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
          <StyledDateInput 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
          />
        </FilterRow>
        <ButtonRow>
          <StyledExportButton onClick={handleCSVExport}>
            <FaFileCsv style={{ marginRight: 8 }} />
            Tagesbericht als CSV exportieren
          </StyledExportButton>
          <StyledExportButton onClick={handlePDFExport}>
            <FaFilePdf style={{ marginRight: 8 }} />
            Tagesbericht als PDF exportieren
          </StyledExportButton>
        </ButtonRow>
      </ExportRow>

      {loading ? (
        <AnimatedMascotsLoader text="Lädt Tagesbericht..." />
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
                <th onClick={() => handleSort('checkInTime')}>
                  Check-in Zeit
                  <SortIcon>{getSortIcon('checkInTime')}</SortIcon>
                </th>
                <th onClick={() => handleSort('checkOutTime')}>
                  Check-out Zeit
                  <SortIcon>{getSortIcon('checkOutTime')}</SortIcon>
                </th>
                <th onClick={() => handleSort('checkedIn')}>
                  Status
                  <SortIcon>{getSortIcon('checkedIn')}</SortIcon>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map(row => (
                <tr key={row.childId}>
                  <td>{row.name}</td>
                  <td>{formatTime(row.checkInTime)}</td>
                  <td>{formatTime(row.checkOutTime)}</td>
                  <td>
                    {row.checkedIn && !row.checkedOut ? (
                      <StatusBadge $status="checked-in">Aktuell anwesend</StatusBadge>
                    ) : row.checkedOut ? (
                      <StatusBadge $status="checked-out">Heute ausgecheckt</StatusBadge>
                    ) : (
                      <StatusBadge $status="not-present">Nicht anwesend</StatusBadge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default DailyReport; 