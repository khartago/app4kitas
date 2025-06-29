import React, { useState, useEffect } from 'react';
import { fetchLatePickupsReport, exportLatePickupsReport } from '../../services/reportApi';

const Verspaetungen: React.FC = () => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchLatePickupsReport(date)
      .then(data => setReport(data))
      .catch(() => setError('Fehler beim Laden des Berichts'))
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div>
      <h2>Verspätete Abholungen</h2>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      {loading && <p>Lade...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {report && (
        <div>
          <p>{report.message}</p>
          <p>Datum: {report.date}</p>
          {report.groupId && <p>Gruppe: {report.groupId}</p>}
        </div>
      )}
      <button onClick={() => exportLatePickupsReport(date)}>Als CSV exportieren</button>
    </div>
  );
};

export default Verspaetungen; 