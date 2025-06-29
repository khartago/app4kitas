import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../../components/UserContext';
import { fetchMyGroup } from '../../services/educatorApi';
import { Card, AnimatedMascotsLoader, ErrorMsg, Headline } from '../../components/ui/AdminDashboardUI';

const MeineGruppe: React.FC = () => {
  const { benutzer } = useUser();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (benutzer?.role !== 'EDUCATOR') return;
    setLoading(true);
    fetchMyGroup(benutzer.id)
      .then(setGroup)
      .catch(() => setError('Fehler beim Laden der Gruppe.'))
      .finally(() => setLoading(false));
  }, [benutzer]);

  if (benutzer?.role !== 'EDUCATOR') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading) return <AnimatedMascotsLoader text="Lade Gruppe..." />;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;

  return (
    <div>
      <Headline>Meine Gruppe</Headline>
      {group && (
        <Card>
          <h3>{group.name}</h3>
          <h4>Kinder</h4>
          <ul>
            {group.children.map((child: any) => (
              <li key={child.id}>{child.name}</li>
            ))}
          </ul>
          <h4>Eltern</h4>
          <ul>
            {group.parents.map((parent: any) => (
              <li key={parent.id}>{parent.name} ({parent.email})</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default MeineGruppe; 