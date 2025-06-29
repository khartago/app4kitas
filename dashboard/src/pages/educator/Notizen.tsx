import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { useUser } from '../../components/UserContext';
import { fetchChildrenNotes, addNote } from '../../services/educatorApi';
import { Card, AnimatedMascotsLoader, ErrorMsg, Headline, Button, Input } from '../../components/ui/AdminDashboardUI';
import Header from '../../components/Header';

const Notizen: React.FC = () => {
  const { benutzer } = useUser();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<{ childId: string, content: string }>({ childId: '', content: '' });

  useEffect(() => {
    if (!benutzer || benutzer.role !== 'EDUCATOR') return;
    setLoading(true);
    fetchChildrenNotes(benutzer.id)
      .then(setNotes)
      .catch(() => setError('Fehler beim Laden der Notizen.'))
      .finally(() => setLoading(false));
  }, [benutzer]);

  const handleAddNote = async () => {
    if (!benutzer || !newNote.childId || !newNote.content) return;
    setLoading(true);
    try {
      await addNote(newNote.childId, newNote.content);
      setNotes(await fetchChildrenNotes(benutzer.id));
      setNewNote({ childId: '', content: '' });
    } catch {
      setError('Fehler beim Hinzufügen der Notiz.');
    }
    setLoading(false);
  };

  if (!benutzer || benutzer.role !== 'EDUCATOR') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading) return <AnimatedMascotsLoader text="Lade Notizen..." />;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;

  return (
    <>
      <Header title="Tagesnotizen" />
      <div style={{marginTop: 64}}>
      <Input
        placeholder="Kind-ID"
        value={newNote.childId}
        onChange={e => setNewNote({ ...newNote, childId: e.target.value })}
      />
      <Input
        placeholder="Notiz"
        value={newNote.content}
        onChange={e => setNewNote({ ...newNote, content: e.target.value })}
      />
      <Button onClick={handleAddNote}>Hinzufügen</Button>
      <ul>
        {notes.map(note => (
          <Card key={note.id}>
            <h3>{note.childName}</h3>
            <p>{note.content}</p>
            <p>{note.createdAt}</p>
          </Card>
        ))}
      </ul>
    </div>
    </>
  );
};

export default Notizen; 