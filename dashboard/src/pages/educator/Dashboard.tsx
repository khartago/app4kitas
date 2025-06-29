import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../../components/UserContext';
import { fetchTodaysChildren, fetchPendingCheckins } from '../../services/educatorApi';
import { Card, Headline, AnimatedMascotsLoader, ErrorMsg, Button } from '../../components/ui/AdminDashboardUI';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

const Dashboard: React.FC = () => {
  const { benutzer } = useUser();
  const [children, setChildren] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (benutzer?.role !== 'EDUCATOR') return;
    setLoading(true);
    Promise.all([
      fetchTodaysChildren(benutzer.id),
      fetchPendingCheckins(benutzer.id)
    ])
      .then(([children, pending]) => {
        setChildren(children);
        setPending(pending);
      })
      .catch(() => setError('Fehler beim Laden der Daten.'))
      .finally(() => setLoading(false));
  }, [benutzer]);

  if (benutzer?.role !== 'EDUCATOR') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading) return <AnimatedMascotsLoader text="Lade Übersicht..." />;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;

  return (
    <>
      <Header title="Mein Tag" />
      <div style={{marginTop: 64}}>
        <h2>Heutige Kinder</h2>
        <ul>
          {children.map(child => (
            <Card key={child.id}>{child.name}</Card>
          ))}
        </ul>
        <h2>Offene Check-ins</h2>
        <ul>
          {pending.map(item => (
            <Card key={item.id}>{item.childName}</Card>
          ))}
        </ul>
        <Button onClick={() => navigate('/educator/Notizen')}>Zu Notizen</Button>
        <Button onClick={() => navigate('/educator/Nachrichten')}>Zu Nachrichten</Button>
      </div>
    </>
  );
};

export default Dashboard; 