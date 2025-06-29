import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

// Styled Components
const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;
const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: ${({ theme }) => theme.components.card.padding};
  margin-bottom: 24px;
`;
const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.headline2.fontSize};
  font-weight: ${({ theme }) => theme.typography.headline2.fontWeight};
`;
const FormField = styled.div`
  margin-bottom: 16px;
`;
const Label = styled.label`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.components.input.padding};
  border-radius: ${({ theme }) => theme.components.input.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface};
  margin-top: 4px;
`;
const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: ${({ theme }) => theme.components.input.padding};
  border-radius: ${({ theme }) => theme.components.input.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface};
  margin-top: 4px;
`;
const FileInput = styled.input`
  margin-top: 8px;
`;
const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;
const SendButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
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
    background: ${({ theme }) => theme.colors.primaryDark};
  }
  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    color: ${({ theme }) => theme.colors.textSecondary};
    cursor: not-allowed;
  }
`;
const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  margin-bottom: 8px;
`;
const MessageList = styled.div`
  margin-top: 24px;
`;
const MessageCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
`;
const MessageMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
`;
const MessageText = styled.div`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const AttachmentLink = styled.a`
  display: inline-block;
  margin-top: 6px;
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;

// Types
interface Child { id: string; name: string; }
interface Message {
  id: string;
  text: string;
  createdAt: string;
  sender: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

const Messages: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch children for dropdown
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetch('/api/groups/me');
        if (res.ok) {
          const data = await res.json();
          setChildren(data.children);
          if (data.children.length > 0) setSelectedChild(data.children[0].id);
        }
      } catch {}
    };
    fetchChildren();
  }, []);

  // Fetch messages for selected child
  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    setError('');
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/child/${selectedChild}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedChild]);

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      let attachmentUrl = undefined;
      let attachmentName = undefined;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachmentUrl = uploadData.url;
          attachmentName = uploadData.name;
        } else {
          setError('Fehler beim Hochladen des Anhangs.');
          setSending(false);
          return;
        }
      }
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: selectedChild,
          text: message,
          attachmentUrl,
          attachmentName,
        }),
      });
      if (res.ok) {
        setMessage('');
        setFile(null);
        setError('');
        // Reload messages
        const data = await res.json();
        setMessages(data.messages);
      } else {
        setError('Fehler beim Senden der Nachricht.');
      }
    } catch {
      setError('Fehler beim Senden der Nachricht.');
    } finally {
      setSending(false);
    }
  };

  return (
    <PageContainer>
      <Title>Nachrichten an Eltern</Title>
      <Card>
        <form onSubmit={handleSend}>
          <FormField>
            <Label>Kinde auswählen<br />
              <Select
                value={selectedChild}
                onChange={e => setSelectedChild(e.target.value)}
                required
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </Select>
            </Label>
          </FormField>
          <FormField>
            <Label>Nachricht<br />
              <TextArea
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Nachricht an die Eltern..."
              />
            </Label>
          </FormField>
          <FormField>
            <Label>Anhang (optional, PDF oder Bild)<br />
              <FileInput
                type="file"
                accept=".pdf,image/*"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
            </Label>
          </FormField>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <ButtonRow>
            <SendButton type="submit" disabled={sending || !selectedChild || !message.trim()}>
              Senden
            </SendButton>
          </ButtonRow>
        </form>
      </Card>
      <MessageList>
        <h2>Nachrichtenverlauf</h2>
        {loading ? (
          <div>Lädt...</div>
        ) : messages.length === 0 ? (
          <div>Keine Nachrichten vorhanden.</div>
        ) : (
          messages.map(msg => (
            <MessageCard key={msg.id}>
              <MessageMeta>
                {msg.sender} | {new Date(msg.createdAt).toLocaleString('de-DE')}
              </MessageMeta>
              <MessageText>{msg.text}</MessageText>
              {msg.attachmentUrl && (
                <AttachmentLink href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                  📎 {msg.attachmentName || 'Anhang ansehen'}
                </AttachmentLink>
              )}
            </MessageCard>
          ))
        )}
      </MessageList>
    </PageContainer>
  );
};

export default Messages; 