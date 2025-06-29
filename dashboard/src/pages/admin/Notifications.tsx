import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import MascotBear from '../../components/ui/MascotBear';
import { Card, Headline, Button, Input } from '../../components/ui/AdminDashboardUI';
import { fetchEducators, fetchGroups } from '../../services/adminApi';
import { filterByInstitution } from '../../services/notificationApi';
import { useUser } from '../../components/UserContext';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 0;
`;
const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
`;
const FormRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;
const Select = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
`;
const EmptyState = styled.div`
  text-align: center;
  margin: 48px 0;
`;

const Notifications: React.FC = () => {
  const { benutzer } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'educator' | 'group'>('educator');
  const [recipientId, setRecipientId] = useState('');
  const [educators, setEducators] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEducators().then(res => {
      const list = res.educators || res;
      setEducators(benutzer ? filterByInstitution(list, benutzer) : list);
    });
    fetchGroups().then(res => {
      const list = res.groups || res;
      setGroups(benutzer ? filterByInstitution(list, benutzer) : list);
    });
  }, [benutzer]);

  // Fetch notifications for selected recipient
  useEffect(() => {
    if (!recipientId) return;
    setLoading(true);
    fetch(`/api/notifications/${recipientId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setNotifications(data.notifications || data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [recipientId]);

  const sendNotification = async () => {
    if (!message.trim() || !recipientId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: recipientId, title: 'Mitteilung', body: message }),
      });
      if (!res.ok) throw new Error('Fehler beim Senden');
      setMessage('');
      // Refresh notifications
        const data = await res.json();
      setNotifications([data, ...notifications]);
    } catch {
      setError('Fehler beim Senden der Benachrichtigung.');
    }
    setLoading(false);
  };

  return (
    <Container>
      <Headline>Benachrichtigungen</Headline>
      <FormRow>
        <Select value={recipientType} onChange={e => { setRecipientType(e.target.value as any); setRecipientId(''); }}>
          <option value="educator">Erzieher</option>
          <option value="group">Gruppe</option>
        </Select>
        <Select value={recipientId} onChange={e => setRecipientId(e.target.value)}>
          <option value="">Empfänger wählen...</option>
          {recipientType === 'educator' && educators.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
          {recipientType === 'group' && groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </Select>
          <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Nachricht eingeben..."
          />
        <Button onClick={sendNotification} disabled={loading || !message.trim() || !recipientId}>
          Senden
        </Button>
      </FormRow>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <NotificationList>
        {loading ? (
          <div>Lädt...</div>
        ) : notifications.length === 0 ? (
          <EmptyState>
            <MascotBear size={80} mood="help" />
            <div>Keine Benachrichtigungen gefunden.</div>
          </EmptyState>
        ) : notifications.map(n => (
          <Card key={n.id}>
            <div style={{ fontWeight: 600 }}>{n.title || 'Mitteilung'}</div>
            <div>{n.body || n.text}</div>
            <div style={{ color: '#757575', fontSize: 14 }}>{n.date || n.createdAt}</div>
          </Card>
        ))}
      </NotificationList>
    </Container>
  );
};

export default Notifications; 