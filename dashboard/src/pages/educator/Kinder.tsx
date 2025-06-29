import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../../components/UserContext';
import { fetchAssignedChildren } from '../../services/educatorApi';
import { Card, AnimatedMascotsLoader, ErrorMsg, Headline, Avatar } from '../../components/ui/AdminDashboardUI';

const Kinder: React.FC = () => {
  const { benutzer } = useUser();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (benutzer?.role !== 'EDUCATOR') return;
    setLoading(true);
    fetchAssignedChildren(benutzer.id)
      .then(setChildren)
      .catch(() => setError('Fehler beim Laden der Kinder.'))
      .finally(() => setLoading(false));
  }, [benutzer]);

  if (benutzer?.role !== 'EDUCATOR') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading) return <AnimatedMascotsLoader text="Lade Kinder..." />;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;

  return (
    <div>
      <Headline>Zugewiesene Kinder</Headline>
      <ul>
        {children.map(child => (
          <Card key={child.id}>
            <Avatar src={child.photoUrl} alt={child.name} />
            <h3>{child.name}</h3>
            <p>Geburtsdatum: {child.birthdate}</p>
          </Card>
        ))}
      </ul>
    </div>
  );
};

export default Kinder; 