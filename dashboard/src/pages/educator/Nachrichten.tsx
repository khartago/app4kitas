import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useUser } from '../../components/UserContext';
import { fetchMessages, sendMessage } from '../../services/educatorApi';
import { Card, AnimatedMascotsLoader, ErrorMsg, Headline, Button, Input } from '../../components/ui/AdminDashboardUI';
import Header from '../../components/Header';

const Nachrichten: React.FC = () => {
  const { benutzer } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (benutzer?.role !== 'EDUCATOR') return;
    setLoading(true);
    fetchMessages()
      .then(setMessages)
      .catch(() => setError('Fehler beim Laden der Nachrichten.'))
      .finally(() => setLoading(false));
  }, [benutzer]);

  const handleSend = async () => {
    if (!content && !file) return;
    setLoading(true);
    try {
      await sendMessage({ content, file: file ?? undefined });
      setMessages(await fetchMessages());
      setContent('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setError('Fehler beim Senden der Nachricht.');
    }
    setLoading(false);
  };

  if (benutzer?.role !== 'EDUCATOR') return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
  if (loading) return <AnimatedMascotsLoader text="Lade Nachrichten..." />;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;

  return (
    <>
      <Header title="Nachrichten an Eltern" />
      <div style={{marginTop: 64}}>
        <Input
          placeholder="Nachricht"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <input
          type="file"
          accept=".pdf,image/*"
          ref={fileInputRef}
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        <Button onClick={handleSend}>Senden</Button>
        <ul>
          {messages.map(msg => (
            <Card key={msg.id}>
              <p>{msg.content}</p>
              {msg.fileUrl && <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">Anhang</a>}
              <p>{msg.createdAt}</p>
            </Card>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Nachrichten; 