import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useUser } from '../../components/UserContext';
import {
  fetchTodaysCheckins,
  fetchEducatorCheckinStats,
  checkinKind,
  fetchMyGroup,
  fetchChildHistory,
  correctCheckinTime
} from '../../services/educatorApi';
import { sendNotification } from '../../services/notificationApi';
import { Card } from '../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader, ErrorMascot } from '../../components/ui/LoadingSpinner';
import Header from '../../components/Header';
import { 
  FaSignInAlt, 
  FaSignOutAlt, 
  FaChild, 
  FaUserCheck,
  FaUserTimes,
  FaEdit
} from 'react-icons/fa';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

// Mobile-first responsive design
const PageContainer = styled.div`
  margin-top: 64px;
  padding: 16px;
  
  @media (max-width: 768px) {
    margin-top: 56px;
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const StatsSection = styled.div`
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: 20px 16px;
  
  @media (max-width: 768px) {
    padding: 16px 12px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 10px;
  }
`;

const StatNumber = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const ControlSection = styled.div`
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const SearchRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
    margin-bottom: 10px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 12px;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 13px;
    flex: 1;
    min-width: 0;
  }
  
  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 12px;
  }
`;

const BulkActionsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  gap: 8px;
    margin-top: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
    margin-top: 10px;
  }
`;

const BulkButton = styled.button<{ $variant: 'checkin' | 'checkout' }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  background: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'checkin':
        return theme.colors.primary;
      case 'checkout':
        return theme.colors.error;
      default:
        return theme.colors.surfaceAlt;
    }
  }};
  
  color: white;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${({ $variant, theme }) => {
      switch ($variant) {
        case 'checkin':
          return theme.colors.primary + '40';
        case 'checkout':
          return theme.colors.error + '40';
        default:
          return theme.colors.border;
      }
    }};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 13px;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 12px;
    gap: 4px;
  }
`;

const SelectAllRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    margin-bottom: 10px;
  }
`;

const SelectAllText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const ChildrenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const ChildCard = styled(Card)<{ $selected?: boolean }>`
  padding: 20px;
  border: 2px solid ${({ $selected, theme }) => 
    $selected ? theme.colors.primary : theme.colors.border
  };
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.border}20;
  }
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    gap: 10px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 10px;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  
  @media (max-width: 480px) {
    width: 16px;
    height: 16px;
  }
`;

const ChildInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  
  @media (max-width: 768px) {
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 16px;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }
`;

const ChildDetails = styled.div`
  flex: 1;
`;

const ChildName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const ChildAge = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const StatusBadge = styled.div<{ $checkedIn: boolean }>`
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $checkedIn, theme }) => 
    $checkedIn ? theme.colors.success + '20' : theme.colors.warning + '20'
  };
  color: ${({ $checkedIn, theme }) => 
    $checkedIn ? theme.colors.success : theme.colors.warning
  };
  border: 1px solid ${({ $checkedIn, theme }) => 
    $checkedIn ? theme.colors.success : theme.colors.warning
  };
  
  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 11px;
  }
`;

const TimeSection = styled.div`
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 10px;
  }
`;

const TimeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: 6px;
  margin-bottom: 8px;
  
  @media (max-width: 480px) {
    padding: 6px 10px;
    margin-bottom: 6px;
  }
`;

const TimeLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const TimeValue = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 6px;
  }
`;

const ActionButton = styled.button<{ $variant: 'checkin' | 'checkout' }>`
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  background: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'checkin':
        return theme.colors.primary;
      case 'checkout':
        return theme.colors.error;
      default:
        return theme.colors.surfaceAlt;
    }
  }};
  
  color: white;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${({ $variant, theme }) => {
      switch ($variant) {
        case 'checkin':
          return theme.colors.primary + '30';
        case 'checkout':
          return theme.colors.error + '30';
        default:
          return theme.colors.border;
      }
    }};
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 12px;
    gap: 4px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  @media (max-width: 768px) {
    padding: 30px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 12px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 40px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 32px;
    margin-bottom: 10px;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

// Helper functions
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatTime = (time: string) => {
  return new Date(time).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const calculateAge = (birthDate: string) => {
  if (!birthDate) return 'Alter unbekannt';
  
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    
    if (isNaN(birth.getTime())) {
      return 'Alter unbekannt';
    }
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    return 'Alter unbekannt';
  }
};

// Types
interface Child {
  id: string;
  name: string;
  age?: number | string;
  photoUrl?: string;
  checkedIn: boolean;
  lastCheckin?: string;
  lastCheckout?: string;
  checkinTime?: string;
  checkoutTime?: string;
}

interface CheckinHistory {
  id: string;
  time: string;
  type: 'IN' | 'OUT';
  method: 'QR' | 'MANUAL';
}

interface TimeCorrection {
  childId: string;
  type: 'IN' | 'OUT';
  originalTime: string;
  newTime: string;
  reason: string;
}

const Checkin: React.FC = () => {
  const { benutzer } = useUser();
  const [children, setChildren] = useState<Child[]>([]);
  const [checkinStats, setCheckinStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, CheckinHistory[]>>({});
  const [historyLoading, setHistoryLoading] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  
  // New state for enhanced features
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checkedin' | 'notcheckedin'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'time'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // Inline time correction state
  const [editingTime, setEditingTime] = useState<{ childId: string; type: 'IN' | 'OUT'; originalTime: string } | null>(null);
  const [newTime, setNewTime] = useState('');
  
  // Group selection state
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  
  const theme = useTheme();

  // Send notification to parents about check-in/out
  const sendCheckinNotification = async (childId: string, childName: string, type: 'IN' | 'OUT') => {
    try {
      const action = type === 'IN' ? 'eingecheckt' : 'ausgecheckt';
      const time = new Date().toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      await sendNotification({
        recipientType: 'single_child',
        recipientId: childId,
        title: `${childName} ${action}`,
        body: `${childName} wurde heute um ${time} ${action}.`,
        priority: 'normal'
      });
      
      console.log(`Notification sent for ${childName} ${action}`);
    } catch (error) {
      console.warn('Failed to send notification:', error);
      // Don't show error to user as notification is not critical
    }
  };

  useEffect(() => {
    const loadCheckinData = async () => {
      if (!benutzer) return;
      
      try {
        setLoading(true);
        
        // Get the educator's group using centralized API service
        const groupData = await fetchMyGroup(benutzer.id);
        
        if (!groupData || !groupData.children) {
          setChildren([]);
          setCheckinStats({ total: 0, checkedIn: 0, checkedOut: 0, present: 0, absent: 0 });
          return;
        }
        
        // Transform all children to have default check-in status
        const allChildren = groupData.children.map((child: any) => ({
          id: child.id,
          name: child.name,
          age: child.birthdate ? calculateAge(child.birthdate) : undefined,
          photoUrl: child.photoUrl,
          checkedIn: false,
          lastCheckin: null,
          lastCheckout: null,
          checkinTime: null,
          checkoutTime: null
        }));
        
        // Load today's check-ins and merge with all children
        try {
          const checkinData = await fetchTodaysCheckins(benutzer.id);
          
          // Create a map of children with check-in data
          const checkinMap = new Map();
          checkinData.forEach((item: any) => {
            checkinMap.set(item.child.id, {
              checkedIn: item.status === 'CHECKED_IN',
              lastCheckin: item.checkins.find((c: any) => c.type === 'IN')?.timestamp,
              lastCheckout: item.checkins.find((c: any) => c.type === 'OUT')?.timestamp,
              checkinTime: item.checkins.find((c: any) => c.type === 'IN')?.timestamp,
              checkoutTime: item.checkins.find((c: any) => c.type === 'OUT')?.timestamp
            });
          });
          
          // Merge check-in data with all children
          const mergedChildren = allChildren.map((child: Child) => ({
            ...child,
            ...checkinMap.get(child.id)
          }));
          
          setChildren(mergedChildren);
        } catch (checkinError) {
          // If check-in data fails, still show all children
          console.warn('Could not load check-in data, showing all children:', checkinError);
          setChildren(allChildren);
        }
        
        // Load check-in statistics
        try {
          const statsData = await fetchEducatorCheckinStats(benutzer.id);
          setCheckinStats(statsData);
        } catch (statsError) {
          console.warn('Could not load check-in stats:', statsError);
          setCheckinStats({ total: allChildren.length, checkedIn: 0, checkedOut: 0, present: 0, absent: allChildren.length });
        }
        
      } catch (error) {
        console.error('Error loading check-in data:', error);
        setError('Fehler beim Laden der Check-in Daten');
      } finally {
        setLoading(false);
      }
    };

    loadCheckinData();
  }, [benutzer]);

  // Enhanced filtering and sorting
  const filteredAndSortedChildren = children
    .filter(child => {
      const matchesSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'checkedin' && child.checkedIn) ||
        (filterStatus === 'notcheckedin' && !child.checkedIn);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = (a.checkedIn ? 1 : 0) - (b.checkedIn ? 1 : 0);
          break;
        case 'time':
          const aTime = a.checkinTime || '';
          const bTime = b.checkinTime || '';
          comparison = aTime.localeCompare(bTime);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedChildren.length === filteredAndSortedChildren.length) {
      setSelectedChildren([]);
    } else {
      setSelectedChildren(filteredAndSortedChildren.map(child => child.id));
    }
  };

  const handleSelectChild = (childId: string) => {
    setSelectedChildren(prev => 
      prev.includes(childId) 
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  const handleBulkCheckin = async (type: 'IN' | 'OUT') => {
    if (selectedChildren.length === 0) return;
    
    setBulkLoading(true);
    try {
      const promises = selectedChildren.map(childId => 
        checkinKind(childId, type, 'MANUAL')
      );
      await Promise.all(promises);
      
      // Update local state
      setChildren(prev => prev.map(child => 
        selectedChildren.includes(child.id) 
          ? { ...child, checkedIn: type === 'IN' }
          : child
      ));
      
      // Clear selection
      setSelectedChildren([]);
      
      // Send notifications
      selectedChildren.forEach(childId => {
        const child = children.find(c => c.id === childId);
        if (child) {
          sendCheckinNotification(child.id, child.name, type);
        }
      });
      
    } catch (err) {
      setError(`Fehler beim Bulk ${type === 'IN' ? 'Check-in' : 'Check-out'}.`);
    } finally {
      setBulkLoading(false);
    }
  };

  // Inline time correction
  const handleTimeEdit = (childId: string, type: 'IN' | 'OUT', originalTime: string) => {
    setEditingTime({ childId, type, originalTime });
    setNewTime(originalTime.slice(0, 16));
  };

  const handleSaveTimeCorrection = async () => {
    if (!editingTime || !newTime) return;
    
    try {
      // Use centralized API call for time correction
      await correctCheckinTime(editingTime.childId, newTime);
      
      // Update local state
      setChildren(prev => prev.map(child => 
        child.id === editingTime.childId 
          ? { 
              ...child, 
              [editingTime.type === 'IN' ? 'checkinTime' : 'checkoutTime']: newTime 
            }
          : child
      ));
      
      setEditingTime(null);
      setNewTime('');
      
    } catch (err) {
      setError('Fehler beim Speichern der Zeitkorrektur.');
    }
  };

  const handleCancelTimeEdit = () => {
    setEditingTime(null);
    setNewTime('');
  };

  // Fetch check-in history for a child
  const fetchHistory = async (childId: string) => {
    setHistoryLoading(h => ({ ...h, [childId]: true }));
    try {
      const data = await fetchChildHistory(childId);
      setHistory(h => ({ ...h, [childId]: data.history || data }));
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setHistoryLoading(h => ({ ...h, [childId]: false }));
    }
  };

  // Handle check-in/out action
  const handleCheckin = async (childId: string, type: 'IN' | 'OUT') => {
    setActionLoading(a => ({ ...a, [childId]: true }));
    try {
      await checkinKind(childId, type, 'MANUAL');
      
      // Find the child to get their name for notification
      const child = children.find(c => c.id === childId);
      
      // Update local state
      setChildren(prev => prev.map(child => 
        child.id === childId 
          ? { ...child, checkedIn: type === 'IN' }
          : child
      ));
      
      // Send notification to parents
      if (child) {
        await sendCheckinNotification(childId, child.name, type);
      }
      
      // Refresh history
      fetchHistory(childId);
    } catch (err) {
      setError('Fehler beim Check-in/out.');
    } finally {
      setActionLoading(a => ({ ...a, [childId]: false }));
    }
  };



  // Calculate statistics
  const checkedInCount = children.filter(child => child.checkedIn).length;
  const totalChildren = children.length;
  const attendanceRate = totalChildren > 0 ? Math.round((checkedInCount / totalChildren) * 100) : 0;

  return (
    <>
      <Header title="Check-in Übersicht" />
      {benutzer?.role !== 'EDUCATOR' ? (
        <ErrorMascot text="Zugriff verweigert" />
      ) : loading ? (
        <AnimatedMascotsLoader text="Lade Check-in Übersicht..." />
      ) : error ? (
        <ErrorMascot text={error} />
      ) : (
        <PageContainer>
          {/* Statistics Section */}
          <StatsSection>
            <StatsGrid>
              <StatCard>
                <StatNumber>{totalChildren}</StatNumber>
                <StatLabel>Gesamt Kinder</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{checkedInCount}</StatNumber>
                <StatLabel>Eingecheckt</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{totalChildren - checkedInCount}</StatNumber>
                <StatLabel>Ausstehend</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{attendanceRate}%</StatNumber>
                <StatLabel>Anwesenheit</StatLabel>
              </StatCard>
            </StatsGrid>
          </StatsSection>

          {/* Control Section */}
          <ControlSection>
            <SearchRow>
              <SearchInput
                placeholder="Kinder suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchRow>
            
            <FilterRow>
              <FilterSelect
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">Alle</option>
                <option value="checkedin">Eingecheckt</option>
                <option value="notcheckedin">Nicht eingecheckt</option>
              </FilterSelect>
              <FilterSelect
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort as any);
                  setSortOrder(order as any);
                }}
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="status-asc">Status</option>
                <option value="time-asc">Zeit</option>
              </FilterSelect>
            </FilterRow>
            
            <BulkActionsRow>
              <BulkButton
                $variant="checkin"
                disabled={
                  selectedChildren.length === 0 || 
                  bulkLoading ||
                  selectedChildren.every(childId => {
                    const child = children.find(c => c.id === childId);
                    return child?.checkedIn || !!child?.checkoutTime;
                  })
                }
                onClick={() => handleBulkCheckin('IN')}
              >
                <FaUserCheck />
                Alle Einchecken ({selectedChildren.length})
              </BulkButton>
              <BulkButton
                $variant="checkout"
                disabled={
                  selectedChildren.length === 0 || 
                  bulkLoading ||
                  selectedChildren.every(childId => {
                    const child = children.find(c => c.id === childId);
                    return !child?.checkedIn || !!child?.checkoutTime;
                  })
                }
                onClick={() => handleBulkCheckin('OUT')}
              >
                <FaUserTimes />
                Alle Auschecken ({selectedChildren.length})
              </BulkButton>
            </BulkActionsRow>
          </ControlSection>

          {/* Select All Row */}
          {filteredAndSortedChildren.length > 0 && (
            <SelectAllRow>
              <Checkbox
                type="checkbox"
                checked={selectedChildren.length === filteredAndSortedChildren.length}
                onChange={handleSelectAll}
              />
              <SelectAllText>
                Alle auswählen ({selectedChildren.length}/{filteredAndSortedChildren.length})
              </SelectAllText>
            </SelectAllRow>
          )}

          {/* Children Grid */}
          {filteredAndSortedChildren.length > 0 ? (
            <ChildrenGrid>
              {filteredAndSortedChildren.map(child => (
                <ChildCard key={child.id} $selected={selectedChildren.includes(child.id)}>
                  <CardHeader>
                    <Checkbox
                      type="checkbox"
                      checked={selectedChildren.includes(child.id)}
                      onChange={() => handleSelectChild(child.id)}
                    />
                      <ChildInfo>
                      <Avatar>
                          {child.photoUrl ? (
                            <img 
                              src={child.photoUrl.startsWith('/uploads') ? BACKEND_URL + child.photoUrl : child.photoUrl} 
                              alt={child.name} 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                borderRadius: '50%', 
                                objectFit: 'cover' 
                              }}
                            />
                          ) : (
                            getInitials(child.name)
                          )}
                      </Avatar>
                        <ChildDetails>
                          <ChildName>{child.name}</ChildName>
                        {child.age && (
                          <ChildAge>
                            {typeof child.age === 'number' 
                              ? `${child.age} Jahre` 
                              : child.age
                            }
                          </ChildAge>
                        )}
                        </ChildDetails>
                      </ChildInfo>
                      <StatusBadge $checkedIn={child.checkedIn}>
                        {child.checkedIn ? 'Eingecheckt' : 'Nicht eingecheckt'}
                      </StatusBadge>
                  </CardHeader>

                  <TimeSection>
                    {child.checkinTime && (
                      <TimeRow>
                        <TimeLabel>Eingecheckt:</TimeLabel>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <TimeValue>{formatTime(child.checkinTime)}</TimeValue>
                          <EditButton onClick={() => handleTimeEdit(child.id, 'IN', child.checkinTime!)}>
                            <FaEdit />
                          </EditButton>
                        </div>
                      </TimeRow>
                    )}
                    {child.checkoutTime && (
                      <TimeRow>
                        <TimeLabel>Ausgecheckt:</TimeLabel>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <TimeValue>{formatTime(child.checkoutTime)}</TimeValue>
                          <EditButton onClick={() => handleTimeEdit(child.id, 'OUT', child.checkoutTime!)}>
                            <FaEdit />
                          </EditButton>
                        </div>
                      </TimeRow>
                    )}
                  </TimeSection>

                  <ActionButtons>
                    <ActionButton
                      $variant="checkin"
                      disabled={child.checkedIn || !!child.checkoutTime || actionLoading[child.id]}
                      onClick={() => handleCheckin(child.id, 'IN')}
                    >
                      <FaSignInAlt />
                      Einchecken
                    </ActionButton>
                    <ActionButton
                      $variant="checkout"
                      disabled={!child.checkedIn || !!child.checkoutTime || actionLoading[child.id]}
                      onClick={() => handleCheckin(child.id, 'OUT')}
                    >
                      <FaSignOutAlt />
                      Auschecken
                    </ActionButton>
                  </ActionButtons>
                </ChildCard>
              ))}
            </ChildrenGrid>
          ) : (
            <EmptyState>
              <EmptyIcon>
                <FaChild />
              </EmptyIcon>
              <EmptyTitle>Keine Kinder gefunden</EmptyTitle>
              <EmptyDescription>
                {searchTerm || filterStatus !== 'all' 
                  ? 'Versuchen Sie andere Suchkriterien.'
                  : 'Es sind derzeit keine Kinder in Ihrer Gruppe eingetragen.'
                }
              </EmptyDescription>
            </EmptyState>
          )}
        </PageContainer>
      )}
    </>
  );
};

export default Checkin; 