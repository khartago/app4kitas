import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  min-height: 600px;
`;
const Title = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.headline2.fontSize};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 18px;
`;
const GroupSelect = styled.select`
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.components.input.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 18px;
`;
const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const MessageCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
`;
const Sender = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  margin-bottom: 2px;
`;
const Timestamp = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  margin-bottom: 8px;
`;
const MessageText = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  margin-bottom: 6px;
  white-space: pre-line;
`;
const FileLink = styled.a`
  color: ${({ theme }) => theme.colors.accent};
  font-size: 14px;
  text-decoration: underline;
  margin-top: 4px;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`;
const Label = styled.label`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 4px;
`;
const Input = styled.input`
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.components.input.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const TextArea = styled.textarea`
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.components.input.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  min-height: 60px;
  resize: vertical;
`;
const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.components.button.borderRadius};
  padding: 12px 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;
const Alert = styled.div<{ success?: boolean }>`
  background: ${({ theme, success }) => success ? theme.colors.primary : theme.colors.error};
  color: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;

interface Group {
  id: string;
  name: string;
}
interface Message {
  id: string;
  senderName: string;
  createdAt: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
}

const GroupChat: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; success?: boolean } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/groups');
        if (res.ok) {
          const data = await res.json();
          setGroups(data);
          if (data.length > 0) setSelectedGroup(data[0].id);
        }
      } catch {}
    };
    fetchGroups();
  }, []);

  // Fetch messages when group changes
  useEffect(() => {
    if (!selectedGroup) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?groupId=${selectedGroup}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch {}
    };
    fetchMessages();
  }, [selectedGroup]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !message.trim()) return;
    setLoading(true);
    setAlert(null);
    const formData = new FormData();
    formData.append('groupId', selectedGroup);
    formData.append('content', message);
    if (file) formData.append('file', file);
    try {
      const res = await fetch('/api/message', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setMessage('');
        setFile(null);
        setAlert({ message: 'Nachricht gesendet!', success: true });
        // Refresh messages
        const data = await res.json();
        setMessages(data);
      } else {
        setAlert({ message: 'Fehler beim Senden der Nachricht.' });
      }
    } catch {
      setAlert({ message: 'Fehler beim Senden der Nachricht.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Gruppenchat</Title>
      {alert && <Alert success={alert.success}>{alert.message}</Alert>}
      <Label htmlFor="group">Gruppe auswählen</Label>
      <GroupSelect
        id="group"
        value={selectedGroup}
        onChange={e => setSelectedGroup(e.target.value)}
      >
        {groups.map(g => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </GroupSelect>
      <MessagesContainer>
        {messages.map(m => (
          <MessageCard key={m.id}>
            <Sender>{m.senderName}</Sender>
            <Timestamp>{new Date(m.createdAt).toLocaleString('de-DE')}</Timestamp>
            <MessageText>{m.content}</MessageText>
            {m.fileUrl && m.fileName && (
              <FileLink href={m.fileUrl} target="_blank" rel="noopener noreferrer" download>
                📎 {m.fileName}
              </FileLink>
            )}
          </MessageCard>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <Form onSubmit={handleSend}>
        <Label htmlFor="message">Nachricht</Label>
        <TextArea
          id="message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          placeholder="Nachricht eingeben"
        />
        <Label htmlFor="file">Datei (optional, PDF/Bild)</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,image/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Senden...' : 'Nachricht senden'}
        </Button>
      </Form>
    </Container>
  );
};

export default GroupChat; 