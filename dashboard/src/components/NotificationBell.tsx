import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../components/UserContext';
import { fetchNotifications, markNotificationAsRead } from '../services/notificationApi';

const BellContainer = styled.div`
  position: relative;
  display: inline-block;
`;
const BellButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  position: relative;
  display: flex;
  align-items: center;
`;
const BellIcon = styled.span`
  font-size: 28px;
  color: ${({ theme }) => theme.colors.primary};
`;
const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: ${({ theme }) => theme.colors.error};
  color: #fff;
  border-radius: 50%;
  padding: 2px 7px;
  font-size: 12px;
  font-weight: 700;
  min-width: 22px;
  text-align: center;
  border: 2px solid ${({ theme }) => theme.colors.surface};
`;
const DropdownMenu = styled.div`
  position: absolute;
  right: 0;
  top: 38px;
  min-width: 320px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 16px 0;
  z-index: 2000;
`;
const NotificationItem = styled.div<{ unread: boolean }>`
  padding: 12px 20px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme, unread }) => unread ? theme.colors.primary : theme.colors.textPrimary};
  background: ${({ theme, unread }) => unread ? theme.colors.background : 'transparent'};
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors.background}; }
`;
const EmptyState = styled.div`
  padding: 24px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;
const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  margin-bottom: 8px;
  padding: 0 20px;
`;

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { benutzer } = useUser();
  const userId = benutzer?.id;

  // Fetch notifications
  const fetchNotificationsData = async () => {
    if (!userId) return;
    try {
      const data = await fetchNotifications(userId);
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
  };
  useEffect(() => {
    if (!userId) return;
    fetchNotificationsData();
    const interval = setInterval(fetchNotificationsData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [userId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setError('');
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));
    } catch {
      setError('Fehler beim Aktualisieren der Benachrichtigung.');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <BellContainer ref={dropdownRef}>
      <BellButton onClick={() => setOpen(o => !o)} aria-label="Benachrichtigungen anzeigen">
        <BellIcon>🔔</BellIcon>
        {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      </BellButton>
      {open && (
        <DropdownMenu>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {notifications.length === 0 ? (
            <EmptyState>Keine Benachrichtigungen</EmptyState>
          ) : (
            notifications.map(n => (
              <NotificationItem
                key={n.id}
                unread={!n.read}
                onClick={() => markAsRead(n.id)}
              >
                {n.message}
                <br />
                <span style={{ fontSize: '12px', color: '#999' }}>{new Date(n.createdAt).toLocaleString('de-DE')}</span>
              </NotificationItem>
            ))
          )}
        </DropdownMenu>
      )}
    </BellContainer>
  );
};

export default NotificationBell; 