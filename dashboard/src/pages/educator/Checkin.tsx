import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';

// Styled Components
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;
const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: ${({ theme }) => theme.components.card.padding};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
const ChildName = styled.h3`
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.headline2.fontSize};
  font-weight: ${({ theme }) => theme.typography.headline2.fontWeight};
`;
const Status = styled.div<{ checkedIn: boolean }>`
  color: ${({ theme, checkedIn }) => checkedIn ? theme.colors.primary : theme.colors.textSecondary};
  font-weight: 600;
  margin-bottom: 8px;
`;
const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
`;
const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${({ theme, variant }) =>
    variant === 'secondary' ? theme.colors.background : theme.colors.primary};
  color: ${({ theme, variant }) =>
    variant === 'secondary' ? theme.colors.textPrimary : '#fff'};
  border: none;
  border-radius: ${({ theme }) => theme.components.button.borderRadius};
  padding: ${({ theme }) => theme.components.button.padding};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.components.button.elevation ? `0 ${theme.components.button.elevation}px ${theme.components.button.elevation * 4}px rgba(0,0,0,0.08)` : 'none'};
  transition: background 0.2s;
  &:hover {
    background: ${({ theme, variant }) =>
      variant === 'secondary' ? theme.colors.surface : theme.colors.primaryDark};
  }
  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    color: ${({ theme }) => theme.colors.textSecondary};
    cursor: not-allowed;
  }
`;
const HistoryList = styled.ul`
  margin: 0;
  padding: 0 0 0 16px;
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  margin-bottom: 8px;
`;

// Types
interface Child {
  id: string;
  name: string;
  checkedIn: boolean;
}
interface CheckinHistory {
  time: string;
  type: 'IN' | 'OUT';
}

const Checkin: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [groupId, setGroupId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ [childId: string]: CheckinHistory[] }>({});
  const [historyLoading, setHistoryLoading] = useState<{ [childId: string]: boolean }>({});
  const [actionLoading, setActionLoading] = useState<{ [childId: string]: boolean }>({});

  // Fetch groupId and children
  useEffect(() => {
    // TODO: Replace with real groupId logic (e.g., from user context or route)
    const fetchGroupId = async () => {
      // For demo, fetch /api/groups/me or similar
      try {
        const res = await fetch('/api/groups/me');
        if (res.ok) {
          const data = await res.json();
          setGroupId(data.group.id);
        }
      } catch {}
    };
    fetchGroupId();
  }, []);

  useEffect(() => {
    if (!groupId) return;
    const fetchChildren = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/groups/${groupId}`);
        if (res.ok) {
          const data = await res.json();
          setChildren(data.children.map((c: any) => ({ id: c.id, name: c.name, checkedIn: c.checkedIn })));
        } else {
          setError('Fehler beim Laden der Kinder.');
        }
      } catch {
        setError('Fehler beim Laden der Kinder.');
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, [groupId]);

  // Fetch today's check-in history for a child
  const fetchHistory = async (childId: string) => {
    setHistoryLoading(h => ({ ...h, [childId]: true }));
    try {
      const res = await fetch(`/api/checkin/child/${childId}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(h => ({ ...h, [childId]: data.history }));
      } else {
        setHistory(h => ({ ...h, [childId]: [] }));
      }
    } catch {
      setHistory(h => ({ ...h, [childId]: [] }));
    } finally {
      setHistoryLoading(h => ({ ...h, [childId]: false }));
    }
  };

  // Check-in/out action
  const handleCheckin = async (childId: string, type: 'IN' | 'OUT') => {
    setActionLoading(a => ({ ...a, [childId]: true }));
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, type }),
      });
      if (res.ok) {
        setChildren(children => children.map(c => c.id === childId ? { ...c, checkedIn: type === 'IN' } : c));
        fetchHistory(childId);
      }
    } finally {
      setActionLoading(a => ({ ...a, [childId]: false }));
    }
  };

  return (
    <div>
      <h1>Check-in Übersicht</h1>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {loading ? (
        <div>Lädt...</div>
      ) : (
        <CardGrid>
          {children.map(child => (
            <Card key={child.id}>
              <ChildName>{child.name}</ChildName>
              <Status checkedIn={child.checkedIn}>
                {child.checkedIn ? 'Eingecheckt' : 'Nicht eingecheckt'}
              </Status>
              <ButtonRow>
                <ActionButton
                  variant="primary"
                  disabled={child.checkedIn || actionLoading[child.id]}
                  onClick={() => handleCheckin(child.id, 'IN')}
                >
                  Einchecken
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  disabled={!child.checkedIn || actionLoading[child.id]}
                  onClick={() => handleCheckin(child.id, 'OUT')}
                >
                  Auschecken
                </ActionButton>
              </ButtonRow>
              <div>
                <b>Heutige Check-ins:</b>
                <ActionButton
                  variant="secondary"
                  style={{ marginLeft: 8, padding: '4px 12px', fontSize: '14px' }}
                  onClick={() => fetchHistory(child.id)}
                  disabled={historyLoading[child.id]}
                >
                  Anzeigen
                </ActionButton>
              </div>
              <HistoryList>
                {history[child.id]?.length ? (
                  history[child.id].map((h, i) => (
                    <li key={i}>{h.type === 'IN' ? 'Eingecheckt' : 'Ausgecheckt'} um {h.time}</li>
                  ))
                ) : (
                  <li>Keine Check-ins heute.</li>
                )}
              </HistoryList>
            </Card>
          ))}
        </CardGrid>
      )}
    </div>
  );
};

export default Checkin; 