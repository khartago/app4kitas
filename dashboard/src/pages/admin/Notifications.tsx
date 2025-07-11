import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../styles/theme';
import { useUser } from '../../components/UserContext';
import { EmptyMascot } from '../../components/ui/AdminDashboardUI';
import { 
  sendNotification, 
  fetchNotifications, 
  fetchAdminNotifications,
  fetchRecipients,
  Recipient,
  NotificationRecipients,
  RECIPIENT_TYPE_OPTIONS,
  fetchNotificationStats
} from '../../services/notificationApi';
import { 
  FaEnvelope, 
  FaClipboardList, 
  FaUsers, 
  FaUser, 
  FaExclamationTriangle, 
  FaCheck, 
  FaSpinner, 
  FaPaperPlane, 
  FaBell, 
  FaEye, 
  FaClock, 
  FaCalendarAlt,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaAngleLeft,
  FaAngleRight
} from 'react-icons/fa';

// Enhanced Styled Components
const PageContainer = styled.div`
  padding: 32px;
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

const Title = styled.h1`
  ${({ theme }) => theme.typography.headline1};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  ${({ theme }) => theme.typography.body1};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  font-size: 18px;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(67, 185, 127, 0.08);
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 12px 48px rgba(67, 185, 127, 0.12);
    transform: translateY(-2px);
  }
`;

const SectionHeader = styled.div`
  padding: 32px 32px 24px 32px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}08, ${({ theme }) => theme.colors.accent}08);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  }
`;

const SectionTitle = styled.h2`
  ${({ theme }) => theme.typography.headline2};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SectionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(67, 185, 127, 0.3);
`;

const SectionDescription = styled.p`
  ${({ theme }) => theme.typography.body1};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

const Content = styled.div`
  padding: 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  ${({ theme }) => theme.typography.subtitle1};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LabelIcon = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 16px;
`;

const Select = styled.select`
  padding: 16px 20px;
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(67, 185, 127, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 48px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
    transform: translateY(-1px);
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary}60;
  }
`;

const Input = styled.input`
  padding: 16px 20px;
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(67, 185, 127, 0.06);
  transition: all 0.3s ease;
  font-family: ${({ theme }) => theme.typography.fontFamily};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
    transform: translateY(-1px);
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary}60;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.7;
  }
`;

const TextArea = styled.textarea`
  padding: 16px 20px;
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(67, 185, 127, 0.06);
  transition: all 0.3s ease;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
    transform: translateY(-1px);
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary}60;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.7;
  }
`;

const Button = styled.button`
  padding: 18px 32px;
  border-radius: 20px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  color: white;
  border: none;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 8px 24px rgba(67, 185, 127, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(67, 185, 127, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;

    &::before {
      display: none;
    }
  }
`;

const TemplateSelector = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const TemplateButton = styled.button<{ $isActive: boolean }>`
  padding: 12px 20px;
  border-radius: 20px;
  border: 2px solid ${({ theme, $isActive }) => 
    $isActive ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $isActive }) => 
    $isActive ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, $isActive }) => 
    $isActive ? 'white' : theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ theme, $isActive }) => 
    $isActive ? '0 4px 16px rgba(67, 185, 127, 0.3)' : '0 2px 8px rgba(67, 185, 127, 0.06)'};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme, $isActive }) => 
      $isActive ? theme.colors.primary : `${theme.colors.primary}10`};
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(67, 185, 127, 0.2);
  }
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NotificationCard = styled.div<{ isRead: boolean; priority: string }>`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 24px;
  border: 2px solid ${({ theme, isRead }) => 
    isRead ? theme.colors.border : theme.colors.primary + '40'};
  box-shadow: 0 4px 16px rgba(67, 185, 127, 0.08);
  transition: all 0.3s ease;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    box-shadow: 0 8px 32px rgba(67, 185, 127, 0.12);
    transform: translateY(-2px);
  }

  ${({ isRead, theme }) => !isRead && `
    background: linear-gradient(135deg, ${theme.colors.primary}08, ${theme.colors.accent}08);
    border-color: ${theme.colors.primary};
  `}
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const NotificationTitle = styled.h3`
  ${({ theme }) => theme.typography.subtitle1};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  font-weight: 700;
  line-height: 1.4;
`;

const NotificationTime = styled.span`
  ${({ theme }) => theme.typography.caption};
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 600;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const NotificationBody = styled.p`
  ${({ theme }) => theme.typography.body2};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 16px 0;
  line-height: 1.6;
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  ${({ theme }) => theme.typography.caption};
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 700;
  background: ${({ theme, priority }) => {
    switch (priority) {
      case 'urgent': return `${theme.colors.error}20`;
      case 'high': return `${theme.colors.accent}20`;
      case 'normal': return `${theme.colors.primary}20`;
      case 'low': return `${theme.colors.textSecondary}20`;
      default: return `${theme.colors.primary}20`;
    }
  }};
  color: ${({ theme, priority }) => {
    switch (priority) {
      case 'urgent': return theme.colors.error;
      case 'high': return theme.colors.accent;
      case 'normal': return theme.colors.primary;
      case 'low': return theme.colors.textSecondary;
      default: return theme.colors.primary;
    }
  }};
  border: 1px solid ${({ theme, priority }) => {
    switch (priority) {
      case 'urgent': return `${theme.colors.error}40`;
      case 'high': return `${theme.colors.accent}40`;
      case 'normal': return `${theme.colors.primary}40`;
      case 'low': return `${theme.colors.textSecondary}40`;
      default: return `${theme.colors.primary}40`;
    }
  }};
`;

const StatusBadge = styled.span<{ status: 'sent' | 'delivered' | 'read' }>`
  ${({ theme }) => theme.typography.caption};
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 700;
  background: ${({ theme, status }) => {
    switch (status) {
      case 'sent': return `${theme.colors.accent}20`;
      case 'delivered': return `${theme.colors.primary}20`;
      case 'read': return `${theme.colors.textSecondary}20`;
      default: return `${theme.colors.textSecondary}20`;
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'sent': return theme.colors.accent;
      case 'delivered': return theme.colors.primary;
      case 'read': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  }};
  border: 1px solid ${({ theme, status }) => {
    switch (status) {
      case 'sent': return `${theme.colors.accent}40`;
      case 'delivered': return `${theme.colors.primary}40`;
      case 'read': return `${theme.colors.textSecondary}40`;
      default: return `${theme.colors.textSecondary}40`;
    }
  }};
`;

const RecipientInfo = styled.div`
  ${({ theme }) => theme.typography.caption};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 18px;
  font-weight: 600;
  gap: 8px;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.error}15;
  border: 2px solid ${({ theme }) => theme.colors.error}30;
  color: ${({ theme }) => theme.colors.error};
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  ${({ theme }) => theme.typography.body2};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SuccessMessage = styled.div`
  background: ${({ theme }) => theme.colors.primary}15;
  border: 2px solid ${({ theme }) => theme.colors.primary}30;
  color: ${({ theme }) => theme.colors.primary};
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  ${({ theme }) => theme.typography.body2};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

// Pagination Components
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding: 20px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const PaginationInfo = styled.div`
  ${({ theme }) => theme.typography.body2};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PaginationButton = styled.button<{ $disabled?: boolean }>`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme, $disabled }) => 
    $disabled ? theme.colors.border : theme.colors.primary};
  background: ${({ theme, $disabled }) => 
    $disabled ? theme.colors.surface : 'transparent'};
  color: ${({ theme, $disabled }) => 
    $disabled ? theme.colors.textSecondary : theme.colors.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const PageSizeSelect = styled.select`
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CurrentPageIndicator = styled.span`
  ${({ theme }) => theme.typography.body2};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.primary + '10'};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.primary + '30'};
`;

// Stats Grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const StatNumber = styled.div`
  ${({ theme }) => theme.typography.headline2};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 700;
  margin-bottom: 8px;
`;

// Stats Section - Simplified without card wrapper
const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
  padding: 24px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  ${({ theme }) => theme.typography.body2};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 8px;
`;

// Useful notification templates
const USEFUL_TEMPLATES = {
  pickup_reminder: {
    name: 'Abholung Erinnerung',
    title: 'Erinnerung: Abholung',
    body: 'Liebe Eltern,\n\nwir möchten Sie daran erinnern, dass Ihr Kind heute um [Uhrzeit] abgeholt werden sollte.\n\nVielen Dank!\n\nIhr Kita-Team'
  },
  event_invitation: {
    name: 'Veranstaltung Einladung',
    title: 'Einladung zur Veranstaltung',
    body: 'Liebe Eltern,\n\nwir laden Sie herzlich zu unserer Veranstaltung ein:\n\n📅 Datum: [Datum]\n🕐 Uhrzeit: [Uhrzeit]\n📍 Ort: [Ort]\n\nWir freuen uns auf Ihr Kommen!\n\nIhr Kita-Team'
  },
  health_notice: {
    name: 'Gesundheitshinweis',
    title: 'Wichtiger Gesundheitshinweis',
    body: 'Liebe Eltern,\n\nwir möchten Sie über einen wichtigen Gesundheitshinweis informieren:\n\n[Details der Gesundheitsinformation]\n\nBitte beachten Sie die entsprechenden Maßnahmen.\n\nIhr Kita-Team'
  },
  weather_alert: {
    name: 'Wetterhinweis',
    title: 'Wetterhinweis',
    body: 'Liebe Eltern,\n\naufgrund der aktuellen Wetterbedingungen bitten wir Sie, entsprechende Kleidung für Ihr Kind mitzubringen.\n\nVielen Dank für Ihr Verständnis!\n\nIhr Kita-Team'
  },
  maintenance_notice: {
    name: 'Wartungsarbeiten',
    title: 'Wartungsarbeiten',
    body: 'Liebe Eltern,\n\nwir führen am [Datum] Wartungsarbeiten durch. Bitte beachten Sie die entsprechenden Hinweise.\n\nVielen Dank für Ihr Verständnis!\n\nIhr Kita-Team'
  },
  daily_update: {
    name: 'Tagesrückblick',
    title: 'Tagesrückblick',
    body: 'Liebe Eltern,\n\nhier ist ein kurzer Überblick über die Aktivitäten des heutigen Tages:\n\n[Details der Aktivitäten]\n\nIhr Kind hatte einen schönen Tag!\n\nIhr Kita-Team'
  }
};

// Types for admin notifications (grouped by backend)
interface AdminNotification {
  id: string;
  title: string;
  body: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  recipients: Array<{
    id: string;
    name: string;
    role: string;
    read: boolean;
  }>;
  totalRecipients: number;
  readCount: number;
  unreadCount: number;
}

const StatsCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 32px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(67, 185, 127, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(67, 185, 127, 0.12);
  }
`;

const StatCardNumber = styled.div`
  ${({ theme }) => theme.typography.headline2};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  margin-bottom: 8px;
`;

const StatCardLabel = styled.div`
  ${({ theme }) => theme.typography.body2};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const Notifications: React.FC = () => {
  const theme = useTheme();
  const { benutzer } = useUser();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [recipientType, setRecipientType] = useState('global');
  const [recipientId, setRecipientId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Recipients state
  const [recipients, setRecipients] = useState<NotificationRecipients>({ 
    parents: [], 
    educators: [], 
    children: [],
    groups: [] 
  });
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    sentToday: 0,
    sentThisWeek: 0,
    sentThisMonth: 0
  });

  // Load notifications and recipients
  useEffect(() => {
    if (benutzer) {
      loadNotifications(1, pageSize);
      loadRecipients();
      loadStats();
    }
  }, [benutzer, pageSize]);

  const loadNotifications = async (page = currentPage, limit = pageSize) => {
    if (!benutzer) return;
    
    setLoading(true);
    try {
      const response = await fetchAdminNotifications(page, limit, 'all');
      // Convert API notifications to AdminNotification format
      const adminNotifications = (response.notifications || []).map((notification: any) => ({
        id: notification.id,
        title: notification.title,
        body: notification.body,
        priority: notification.priority,
        createdAt: notification.createdAt,
        recipients: notification.recipients || [],
        totalRecipients: notification.totalRecipients || 0,
        readCount: notification.readCount || 0,
        unreadCount: notification.unreadCount || 0
      }));
      setNotifications(adminNotifications);
      setTotalNotifications(response.pagination?.total || 0);
      setTotalPages(response.pagination?.pages || 0);
      setCurrentPage(page);
    } catch (err) {
      // Error loading notifications
      setNotifications([]);
      setTotalNotifications(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipients = async () => {
    setLoadingRecipients(true);
    try {
      const response = await fetchRecipients();
      setRecipients(response);
    } catch (err) {
      // Error loading recipients
      setRecipients({ parents: [], educators: [], children: [], groups: [] });
    } finally {
      setLoadingRecipients(false);
    }
  };

  const loadStats = async () => {
    if (!benutzer) return;
    
    try {
      const response = await fetchNotificationStats(benutzer.id);
      setStats(response);
    } catch (err) {
      // Error loading stats
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = Object.entries(USEFUL_TEMPLATES).find(([key]) => key === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setTitle(template[1].title);
      setBody(template[1].body);
    }
  };

  const handleRecipientTypeChange = (newType: string) => {
    setRecipientType(newType);
    setRecipientId(''); // Reset recipient selection when type changes
  };

  const getRecipientOptions = () => {
    switch (recipientType) {
      case 'single_child':
        return recipients.children.map(child => ({
          value: child.id,
          label: child.name
        }));
      case 'single_educator':
        return recipients.educators.map(educator => ({
          value: educator.id,
          label: educator.name
        }));
      case 'whole_group':
        return recipients.groups.map(group => ({
          value: group.id,
          label: group.name
        }));
      default:
        return [];
    }
  };

  const shouldShowRecipientSelect = () => {
    return ['single_child', 'single_educator', 'whole_group'].includes(recipientType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !body.trim()) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    if (shouldShowRecipientSelect() && !recipientId) {
      setError('Bitte wählen Sie einen Empfänger aus.');
      return;
    }

    setSending(true);
    setError(null);
    
    try {
      const notificationData = {
        recipientType: recipientType as 'single_child' | 'single_educator' | 'whole_group' | 'all_educators' | 'all_children' | 'global',
        recipientId: shouldShowRecipientSelect() ? recipientId : '',
        title: title.trim(),
        body: body.trim(),
        priority
      };

      await sendNotification(notificationData);
      
      setSuccess('Benachrichtigung erfolgreich gesendet!');
      setTitle('');
      setBody('');
      setRecipientId('');
      setPriority('normal');
      setSelectedTemplate(null);
      
      // Reload notifications and stats
      loadNotifications(1, pageSize);
      loadStats();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: any) {
      setError(err.message || 'Fehler beim Senden der Benachrichtigung');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Dringend';
      case 'high': return 'Hoch';
      case 'normal': return 'Normal';
      case 'low': return 'Niedrig';
      default: return priority;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'Gesendet';
      case 'delivered': return 'Zugestellt';
      case 'read': return 'Gelesen';
      default: return status;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && !loading) {
      loadNotifications(newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (!loading) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>Benachrichtigungen</Title>
        <Subtitle>Verwalten und senden Sie Benachrichtigungen an Eltern und Erzieher</Subtitle>
        
        {/* Stats Cards */}
        {stats && (
          <StatsCards>
            <StatCard>
              <StatCardNumber>{stats.total}</StatCardNumber>
              <StatCardLabel>Gesamt gesendet</StatCardLabel>
            </StatCard>
            <StatCard>
              <StatCardNumber>{stats.unread}</StatCardNumber>
              <StatCardLabel>Ungelesen</StatCardLabel>
            </StatCard>
            <StatCard>
              <StatCardNumber>{stats.sentToday}</StatCardNumber>
              <StatCardLabel>Heute gesendet</StatCardLabel>
            </StatCard>
            <StatCard>
              <StatCardNumber>{stats.sentThisWeek}</StatCardNumber>
              <StatCardLabel>Diese Woche</StatCardLabel>
            </StatCard>
          </StatsCards>
        )}
      </Header>

      <MainGrid>
        {/* Compose Section */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              <SectionIcon><FaEnvelope /></SectionIcon>
              Neue Benachrichtigung
            </SectionTitle>
            <SectionDescription>
              Erstellen und senden Sie eine neue Benachrichtigung an ausgewählte Empfänger
            </SectionDescription>
          </SectionHeader>
          
          <Content>
            {error && (
              <ErrorMessage>
                <FaExclamationTriangle />
                {error}
              </ErrorMessage>
            )}
            {success && (
              <SuccessMessage>
                <FaCheck />
                {success}
              </SuccessMessage>
            )}

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>
                  <LabelIcon><FaUsers /></LabelIcon>
                  Empfängertyp
                </Label>
                <Select
                  value={recipientType}
                  onChange={(e) => handleRecipientTypeChange(e.target.value)}
                >
                  {RECIPIENT_TYPE_OPTIONS.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
        </Select>
              </FormGroup>

              {shouldShowRecipientSelect() && (
                <FormGroup>
                                  <Label>
                  <LabelIcon><FaUser /></LabelIcon>
                  Empfänger auswählen
                </Label>
                  <Select
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    disabled={loadingRecipients}
                  >
                    <option value="">Bitte wählen Sie einen Empfänger...</option>
                    {getRecipientOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
          ))}
        </Select>
                </FormGroup>
              )}

              <FormGroup>
                <Label>
                  <LabelIcon><FaExclamationTriangle /></LabelIcon>
                  Priorität
                </Label>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'normal' | 'high' | 'urgent')}
                >
                  <option value="low">Niedrig</option>
                  <option value="normal">Normal</option>
                  <option value="high">Hoch</option>
                  <option value="urgent">Dringend</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>
                  <LabelIcon><FaClipboardList /></LabelIcon>
                  Vorlage (Optional)
                </Label>
                <TemplateSelector>
                  {Object.entries(USEFUL_TEMPLATES).map(([key, template]) => (
                    <TemplateButton
                      key={key}
                      type="button"
                      $isActive={selectedTemplate === key}
                      onClick={() => handleTemplateSelect(key)}
                    >
                      {template.name}
                    </TemplateButton>
                  ))}
                </TemplateSelector>
              </FormGroup>

              <FormGroup>
                <Label>
                  <LabelIcon><FaClipboardList /></LabelIcon>
                  Titel *
                </Label>
          <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titel der Benachrichtigung eingeben..."
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <LabelIcon><FaEnvelope /></LabelIcon>
                  Nachricht *
                </Label>
                <TextArea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Ihre Nachricht eingeben..."
                  rows={6}
                />
              </FormGroup>

              <Button type="submit" disabled={sending}>
                {sending ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Benachrichtigung senden
                  </>
                )}
        </Button>
            </Form>
          </Content>
        </Section>

        {/* History Section */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              <SectionIcon><FaClipboardList /></SectionIcon>
              Gesendete Benachrichtigungen
            </SectionTitle>
            <SectionDescription>
              Übersicht über alle von Ihnen gesendeten Benachrichtigungen (gruppiert nach Nachricht)
            </SectionDescription>
          </SectionHeader>
          
          <Content>
        {loading ? (
              <LoadingSpinner>
                <FaSpinner style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                Lade Benachrichtigungen...
              </LoadingSpinner>
        ) : notifications.length === 0 ? (
              <EmptyMascot text="Noch keine Benachrichtigungen gesendet" />
            ) : (
              <>
                <NotificationList>
                  {notifications.map((notification) => (
                    <NotificationCard 
                      key={notification.id} 
                      isRead={notification.unreadCount === 0}
                      priority={notification.priority}
                    >
                      <NotificationHeader>
                        <NotificationTitle>{notification.title}</NotificationTitle>
                        <NotificationTime>{formatDate(notification.createdAt)}</NotificationTime>
                      </NotificationHeader>
                      
                      <NotificationBody>{notification.body}</NotificationBody>
                      
                      <NotificationMeta>
                        <PriorityBadge priority={notification.priority}>
                          {getPriorityLabel(notification.priority)}
                        </PriorityBadge>
                        <RecipientInfo>
                          <FaPaperPlane /> {notification.totalRecipients} Empfänger
                          {notification.readCount > 0 && (
                            <span style={{ marginLeft: '8px', color: '#4CAF50' }}>
                              <FaCheck /> {notification.readCount} gelesen
                            </span>
                          )}
                          {notification.unreadCount > 0 && (
                            <span style={{ marginLeft: '8px', color: '#FF9800' }}>
                              <FaClock /> {notification.unreadCount} ungelesen
                            </span>
                          )}
                        </RecipientInfo>
                      </NotificationMeta>
                    </NotificationCard>
        ))}
      </NotificationList>

                {/* Pagination Controls */}
                {totalNotifications > 0 && (
                  <PaginationContainer>
                    <PaginationInfo>
                      {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalNotifications)} von {totalNotifications}
                    </PaginationInfo>
                    
                    <PaginationControls>
                      <PaginationButton
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <FaChevronLeft />
                      </PaginationButton>
                      
                      <CurrentPageIndicator>
                        {currentPage} / {totalPages}
                      </CurrentPageIndicator>
                      
                      <PaginationButton
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <FaChevronRight />
                      </PaginationButton>
                    </PaginationControls>
                  </PaginationContainer>
                )}
              </>
            )}
          </Content>
        </Section>
      </MainGrid>
    </PageContainer>
  );
};

export default Notifications; 