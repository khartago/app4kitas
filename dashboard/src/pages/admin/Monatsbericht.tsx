import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import MascotBear from '../../components/ui/MascotBear';
import { Headline, Button } from '../../components/ui/AdminDashboardUI';
import { fetchMonthlyReport, exportMonthlyReport } from '../../services/reportApi';
import { fetchGroups } from '../../services/adminApi';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 0;
`;
const ExportRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;
const EmptyState = styled.div`
  text-align: center;
  margin: 48px 0;
`;
const FilterRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;
const Select = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
`;

const Monatsbericht: React.FC = () => {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups().then(res => setGroups(res.groups || res));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMonthlyReport(month, groupId)
      .then(data => setReport(data.report))
      .catch(() => setError('Fehler beim Laden des Berichts'))
      .finally(() => setLoading(false));
  }, [month, groupId]);

  return (
    <Container>
      <Headline>Monatsbericht</Headline>
      <ExportRow>
        <Button onClick={() => exportMonthlyReport(month, groupId)}>Als CSV exportieren</Button>
      </ExportRow>
      <FilterRow>
      <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
        <Select value={groupId} onChange={e => setGroupId(e.target.value)}>
          <option value="">Alle Gruppen</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </Select>
      </FilterRow>
      {loading ? (
        <div>Lädt...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : report.length === 0 ? (
        <EmptyState>
          <MascotBear size={80} mood="help" />
          <div>Keine Berichtsdaten gefunden.</div>
        </EmptyState>
      ) : (
        <table style={{ width: '100%', marginTop: 24 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Anwesenheitstage</th>
          </tr>
        </thead>
        <tbody>
          {report.map(row => (
            <tr key={row.childId}>
              <td>{row.name}</td>
              <td>{row.checkInDays}</td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </Container>
  );
};

export default Monatsbericht; 