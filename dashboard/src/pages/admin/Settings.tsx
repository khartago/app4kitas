import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../../components/UserContext';
import { AnimatedMascotsLoader } from '../../components/ui/LoadingSpinner';
import { EmptyMascot } from '../../components/ui/AdminDashboardUI';
import { 
  getInstitutionSettings, 
  updateInstitutionSettings,
  addClosedDay,
  removeClosedDay,
  InstitutionSettings,
  ClosedDay
} from '../../services/institutionSettingsApi';
import { 
  FaCog, 
  FaBan, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaClock, 
  FaCalendarAlt, 
  FaPlus, 
  FaTrash, 
  FaSave,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarCheck,
  FaTimes
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

// Navigation Tabs
const TabNavigation = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 8px;
  margin-bottom: 32px;
  box-shadow: 0 4px 16px rgba(67, 185, 127, 0.08);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const TabButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 16px 24px;
  border: none;
  background: ${({ active, theme }) => 
    active 
      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
      : 'transparent'
  };
  color: ${({ active, theme }) => 
    active ? 'white' : theme.colors.textSecondary
  };
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${({ active, theme }) => 
      active 
        ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
        : `${theme.colors.primary}10`
    };
    color: ${({ active, theme }) => 
      active ? 'white' : theme.colors.primary
    };
  }
`;

const TabIcon = styled.span`
  font-size: 18px;
`;

// Content Container
const ContentContainer = styled.div`
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

const ContentHeader = styled.div`
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

const ContentTitle = styled.h2`
  ${({ theme }) => theme.typography.headline2};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ContentIcon = styled.div`
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

const ContentDescription = styled.p`
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

const Button = styled.button`
  padding: 16px 32px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(67, 185, 127, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(67, 185, 127, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.error}15;
  color: ${({ theme }) => theme.colors.error};
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.error}30;
  margin-bottom: 24px;
  font-weight: 500;
`;

const SuccessMessage = styled.div`
  background: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  margin-bottom: 24px;
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;





// Form components
const FormTitle = styled.h3`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  ${({ theme }) => theme.typography.subtitle1};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const WeekDaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
`;

const WeekDayItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary}40;
    transform: translateY(-1px);
  }
`;

const WeekDayCheckbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const WeekDayLabel = styled.label`
  ${({ theme }) => theme.typography.subtitle1};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  font-size: 14px;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(67, 185, 127, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const HolidaysList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const HolidayItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary}40;
    box-shadow: 0 2px 8px rgba(67, 185, 127, 0.1);
  }
`;

const HolidayInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const HolidayDate = styled.div`
  ${({ theme }) => theme.typography.subtitle1};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  font-size: 16px;
`;

const HolidayReason = styled.div`
  ${({ theme }) => theme.typography.body2};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const HolidayRecurrence = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  padding: 2px 8px;
  background: ${({ theme }) => theme.colors.primary}15;
  border-radius: 12px;
  display: inline-block;
  width: fit-content;
`;

const RemoveButton = styled.button`
  background: ${({ theme }) => theme.colors.error};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.error}dd;
    transform: translateY(-1px);
  }
`;

const EmptyHolidays = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const EmptyDescription = styled.div`
  font-size: 14px;
`;

const AddHolidayForm = styled.div`
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 24px;
  margin-top: 20px;
`;

const HolidayTypeSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TypeOption = styled.div<{ active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: ${({ active, theme }) => 
    active ? theme.colors.primary + '15' : theme.colors.surface
  };
  border: 2px solid ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.border
  };
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary}60;
    transform: translateY(-1px);
  }
`;

const TypeIcon = styled.span`
  font-size: 18px;
`;

const TypeLabel = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const RecurrenceSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const RecurrenceOption = styled.div<{ active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: ${({ active, theme }) => 
    active ? theme.colors.primary + '15' : theme.colors.surface
  };
  border: 2px solid ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.border
  };
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary}60;
    transform: translateY(-1px);
  }
`;

const RecurrenceIcon = styled.span`
  font-size: 16px;
`;

const RecurrenceLabel = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(67, 185, 127, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Section Components
const Section = styled.div`
  margin-bottom: 40px;
  padding: 24px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(67, 185, 127, 0.08);
    transform: translateY(-1px);
  }
`;

const SectionTitle = styled.h3`
  ${({ theme }) => theme.typography.headline3};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
`;

const SectionDescription = styled.p`
  ${({ theme }) => theme.typography.body2};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

// Tab Types
type TabType = 'general' | 'closing';

const Settings: React.FC = () => {
  const { benutzer } = useUser();
  
  // Safety check for user
  if (!benutzer?.institutionId) {
    return (
      <PageContainer>
        <AnimatedMascotsLoader />
        <div style={{ marginTop: '16px', color: '#666' }}>
          Einstellungen werden geladen...
        </div>
      </PageContainer>
    );
  }

  const [settings, setSettings] = useState<InstitutionSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('general');

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [newClosedDayDate, setNewClosedDayDate] = useState('');
  const [newClosedDayReason, setNewClosedDayReason] = useState('');
  const [addingClosedDay, setAddingClosedDay] = useState(false);

  // Holiday form states
  const [holidayFromDate, setHolidayFromDate] = useState('');
  const [holidayToDate, setHolidayToDate] = useState('');
  const [holidayReason, setHolidayReason] = useState('');
  const [holidayRecurrence, setHolidayRecurrence] = useState('ONCE');
  const [isDateRange, setIsDateRange] = useState(false);

  // Repeated days states
  const [repeatedDays, setRepeatedDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });

  const weekDays = [
    { key: 'monday', label: 'Montag', icon: '1️⃣' },
    { key: 'tuesday', label: 'Dienstag', icon: '2️⃣' },
    { key: 'wednesday', label: 'Mittwoch', icon: '3️⃣' },
    { key: 'thursday', label: 'Donnerstag', icon: '4️⃣' },
    { key: 'friday', label: 'Freitag', icon: '5️⃣' },
    { key: 'saturday', label: 'Samstag', icon: '6️⃣' },
    { key: 'sunday', label: 'Sonntag', icon: '7️⃣' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!benutzer?.institutionId) return;
    
    setLoading(true);
    try {
      const data = await getInstitutionSettings(benutzer.institutionId);
      setSettings(data);
      setName(data.name || '');
      setAddress(data.address || '');
      setOpeningTime(data.openingTime || '');
      setClosingTime(data.closingTime || '');
      
      // Load repeated days from settings
      if (data.repeatedClosedDays) {
        setRepeatedDays(data.repeatedClosedDays);
      }
    } catch (err) {
      setError('Fehler beim Laden der Einstellungen');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!benutzer?.institutionId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateInstitutionSettings(benutzer.institutionId, {
        name,
        address,
        openingTime,
        closingTime,
        repeatedClosedDays: repeatedDays
      });
      
      setSuccess('Einstellungen erfolgreich gespeichert');
      await loadSettings();
    } catch (err) {
      setError('Fehler beim Speichern der Einstellungen');
    } finally {
      setSaving(false);
    }
  };

  const handleAddClosedDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!benutzer?.institutionId) return;

    // Validate input
    if (!isDateRange && !newClosedDayDate) {
      setError('Bitte wählen Sie ein Datum aus');
      return;
    }

    if (isDateRange && (!holidayFromDate || !holidayToDate)) {
      setError('Bitte wählen Sie Start- und Enddatum aus');
      return;
    }

    if (isDateRange && new Date(holidayFromDate) >= new Date(holidayToDate)) {
      setError('Startdatum muss vor dem Enddatum liegen');
      return;
    }

    setAddingClosedDay(true);
    setError(null);

    try {
      const holidayData: any = {
        reason: isDateRange ? holidayReason : newClosedDayReason,
        recurrence: holidayRecurrence
      };

      if (isDateRange) {
        holidayData.fromDate = holidayFromDate;
        holidayData.toDate = holidayToDate;
      } else {
        holidayData.date = newClosedDayDate;
      }

      await addClosedDay(benutzer.institutionId, holidayData);
      
      // Reset form
      setNewClosedDayDate('');
      setNewClosedDayReason('');
      setHolidayFromDate('');
      setHolidayToDate('');
      setHolidayReason('');
      setHolidayRecurrence('ONCE');
      setIsDateRange(false);
      
      setSuccess('Geschlossener Tag erfolgreich hinzugefügt');
      await loadSettings();
    } catch (err) {
      setError('Fehler beim Hinzufügen des geschlossenen Tages');
    } finally {
      setAddingClosedDay(false);
    }
  };

  const handleRemoveClosedDay = async (closedDayId: string) => {
    if (!benutzer?.institutionId) return;

    try {
      await removeClosedDay(benutzer.institutionId, closedDayId);
      setSuccess('Geschlossener Tag erfolgreich entfernt');
      await loadSettings();
    } catch (err) {
      setError('Fehler beim Entfernen des geschlossenen Tages');
    }
  };

  const handleRepeatedDayChange = (dayKey: string, checked: boolean) => {
    setRepeatedDays(prev => ({
      ...prev,
      [dayKey]: checked
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateRange = (fromDate: string, toDate: string) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (from.getFullYear() === to.getFullYear()) {
      return `${from.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })} - ${to.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else {
      return `${from.toLocaleDateString('de-DE')} - ${to.toLocaleDateString('de-DE')}`;
    }
  };

  const getRecurrenceText = (recurrence: string) => {
    return recurrence === 'YEARLY' ? 'Jährlich' : 'Nur dieses Jahr';
  };

  if (loading) {
    return (
      <PageContainer>
        <AnimatedMascotsLoader />
        <div style={{ marginTop: '16px', color: '#666' }}>
          Einstellungen werden geladen...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>Institutionseinstellungen</Title>
        <Subtitle>Verwalten Sie die Einstellungen Ihrer Kita</Subtitle>
      </Header>

      {/* Navigation Tabs */}
      <TabNavigation>
        <TabButton 
          active={activeTab === 'general'} 
          onClick={() => setActiveTab('general')}
        >
          <TabIcon><FaCog /></TabIcon>
          Allgemeine Einstellungen
        </TabButton>
        <TabButton 
          active={activeTab === 'closing'} 
          onClick={() => setActiveTab('closing')}
        >
          <TabIcon><FaBan /></TabIcon>
          Geschlossene Tage
        </TabButton>
      </TabNavigation>

      {/* Content */}
      <ContentContainer>
        {activeTab === 'general' && (
          <>
            <ContentHeader>
                          <ContentTitle>
              <ContentIcon><FaCog /></ContentIcon>
              Allgemeine Einstellungen
            </ContentTitle>
              <ContentDescription>
                Grundlegende Informationen und Öffnungszeiten Ihrer Kita
              </ContentDescription>
            </ContentHeader>
            
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
                  <LabelIcon><FaBuilding /></LabelIcon>
                  Name der Institution *
                </Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name Ihrer Kita eingeben..."
                    required
                  />
                </FormGroup>

                <FormGroup>
                                  <Label>
                  <LabelIcon><FaMapMarkerAlt /></LabelIcon>
                  Adresse
                </Label>
                  <TextArea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Vollständige Adresse der Kita..."
                    rows={3}
                  />
                </FormGroup>

                <FormGroup>
                                  <Label>
                  <LabelIcon><FaClock /></LabelIcon>
                  Öffnungszeiten
                </Label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Input
                      type="time"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      placeholder="Öffnungszeit"
                    />
                    <Input
                      type="time"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      placeholder="Schließzeit"
                    />
                  </div>
                </FormGroup>

                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                      Wird gespeichert...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Einstellungen speichern
                    </>
                  )}
                </Button>
              </Form>
            </Content>
          </>
        )}

        {activeTab === 'closing' && (
          <>
            <ContentHeader>
                          <ContentTitle>
              <ContentIcon><FaBan /></ContentIcon>
              Geschlossene Tage
            </ContentTitle>
              <ContentDescription>
                Verwalten Sie regelmäßige Schließtage und Feiertage Ihrer Kita
              </ContentDescription>
            </ContentHeader>
            
            <Content>
              {/* Weekly Closures */}
              <Section>
                <SectionTitle>
                  <LabelIcon><FaCalendarWeek /></LabelIcon>
                  Wöchentliche Schließtage
                </SectionTitle>
                <SectionDescription>
                  Wählen Sie die Wochentage aus, an denen Ihre Kita regelmäßig geschlossen ist.
                </SectionDescription>
                
                <WeekDaysGrid>
                  {weekDays.map((day) => (
                    <WeekDayItem key={day.key}>
                      <WeekDayCheckbox
                        type="checkbox"
                        id={day.key}
                        checked={repeatedDays[day.key as keyof typeof repeatedDays]}
                        onChange={(e) => handleRepeatedDayChange(day.key, e.target.checked)}
                      />
                      <WeekDayLabel htmlFor={day.key}>
                        {day.icon} {day.label}
                      </WeekDayLabel>
                    </WeekDayItem>
                  ))}
                </WeekDaysGrid>
                
                <SaveButton 
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                      Wird gespeichert...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Speichern
                    </>
                  )}
                </SaveButton>
              </Section>

              {/* Holidays */}
              <Section>
                <SectionTitle>
                  <LabelIcon><FaCalendarAlt /></LabelIcon>
                  Feiertage & Schließtage
                </SectionTitle>
                <SectionDescription>
                  Fügen Sie einzelne Feiertage oder Ferienzeiten hinzu.
                </SectionDescription>
                
                <HolidaysList>
                  {settings?.closedDays.map((closedDay) => (
                    <HolidayItem key={closedDay.id}>
                      <HolidayInfo>
                        <HolidayDate>
                          {closedDay.fromDate && closedDay.toDate ? (
                            formatDateRange(closedDay.fromDate, closedDay.toDate)
                          ) : (
                            formatDate(closedDay.date || '')
                          )}
                        </HolidayDate>
                        {closedDay.reason && (
                          <HolidayReason>{closedDay.reason}</HolidayReason>
                        )}
                        <HolidayRecurrence>
                          {getRecurrenceText(closedDay.recurrence || 'ONCE')}
                        </HolidayRecurrence>
                      </HolidayInfo>
                      <RemoveButton
                        onClick={() => handleRemoveClosedDay(closedDay.id)}
                      >
                        <FaTrash />
                      </RemoveButton>
                    </HolidayItem>
                  ))}
                  
                  {settings?.closedDays.length === 0 && (
                    <EmptyHolidays>
                      <EmptyIcon><FaCalendarAlt /></EmptyIcon>
                      <EmptyTitle>Keine Feiertage definiert</EmptyTitle>
                      <EmptyDescription>
                        Fügen Sie Ihre ersten Feiertage hinzu
                      </EmptyDescription>
                    </EmptyHolidays>
                  )}
                </HolidaysList>

                <AddHolidayForm>
                  <FormTitle>Neuen Feiertag hinzufügen</FormTitle>
                  
                  <HolidayTypeSelector>
                    <TypeOption 
                      active={!isDateRange}
                      onClick={() => setIsDateRange(false)}
                    >
                      <TypeIcon><FaCalendarDay /></TypeIcon>
                      <TypeLabel>Einzelner Tag</TypeLabel>
                    </TypeOption>
                    <TypeOption 
                      active={isDateRange}
                      onClick={() => setIsDateRange(true)}
                    >
                      <TypeIcon><FaCalendarWeek /></TypeIcon>
                      <TypeLabel>Datumsbereich</TypeLabel>
                    </TypeOption>
                  </HolidayTypeSelector>

                  <form onSubmit={handleAddClosedDay}>
                    {!isDateRange ? (
                      <FormRow>
                        <FormGroup>
                          <Label>Datum *</Label>
                          <Input
                            type="date"
                            value={newClosedDayDate}
                            onChange={(e) => setNewClosedDayDate(e.target.value)}
                            required
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label>Grund</Label>
                          <Input
                            type="text"
                            value={newClosedDayReason}
                            onChange={(e) => setNewClosedDayReason(e.target.value)}
                            placeholder="z.B. Weihnachten, Ostern..."
                          />
                        </FormGroup>
                      </FormRow>
                    ) : (
                      <>
                        <FormRow>
                          <FormGroup>
                            <Label>Von *</Label>
                            <Input
                              type="date"
                              value={holidayFromDate}
                              onChange={(e) => setHolidayFromDate(e.target.value)}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <Label>Bis *</Label>
                            <Input
                              type="date"
                              value={holidayToDate}
                              onChange={(e) => setHolidayToDate(e.target.value)}
                              required
                            />
                          </FormGroup>
                        </FormRow>
                        <FormGroup>
                          <Label>Grund</Label>
                          <Input
                            type="text"
                            value={holidayReason}
                            onChange={(e) => setHolidayReason(e.target.value)}
                            placeholder="z.B. Weihnachtsferien, Sommerferien..."
                          />
                        </FormGroup>
                      </>
                    )}

                    <RecurrenceSelector>
                      <RecurrenceOption 
                        active={holidayRecurrence === 'ONCE'}
                        onClick={() => setHolidayRecurrence('ONCE')}
                      >
                        <RecurrenceIcon><FaCalendarDay /></RecurrenceIcon>
                        <RecurrenceLabel>Nur dieses Jahr</RecurrenceLabel>
                      </RecurrenceOption>
                      <RecurrenceOption 
                        active={holidayRecurrence === 'YEARLY'}
                        onClick={() => setHolidayRecurrence('YEARLY')}
                      >
                        <RecurrenceIcon><FaCalendarCheck /></RecurrenceIcon>
                        <RecurrenceLabel>Jedes Jahr</RecurrenceLabel>
                      </RecurrenceOption>
                    </RecurrenceSelector>

                    <AddButton 
                      type="submit" 
                      disabled={addingClosedDay}
                    >
                      {addingClosedDay ? (
                    <>
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                      Wird hinzugefügt...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Hinzufügen
                    </>
                  )}
                    </AddButton>
                  </form>
                </AddHolidayForm>
              </Section>
            </Content>
          </>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default Settings; 