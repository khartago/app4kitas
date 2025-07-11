import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from 'styled-components';
import { useUser } from '../../components/UserContext';
import { fetchAssignedChildren, fetchMyGroups } from '../../services/educatorApi';
import { Card } from '../../components/ui/AdminDashboardUI';
import { AnimatedMascotsLoader, ErrorMascot } from '../../components/ui/LoadingSpinner';
import Header from '../../components/Header';
import { 
  FaSearch, 
  FaChild, 
  FaUsers, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt,
  FaUserFriends,
  FaInfoCircle,
  FaCheckCircle,
  FaStickyNote,
  FaComments,
  FaChevronDown,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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

const GroupSelector = styled.div`
  position: relative;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const GroupSelect = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 13px;
    width: 100%;
    min-width: 0;
  }
  
  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 12px;
  }
`;

const GroupDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.border}20;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const GroupOption = styled.div<{ $isSelected: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  background: ${({ $isSelected, theme }) => 
    $isSelected ? theme.colors.primary + '10' : 'transparent'
  };
  color: ${({ $isSelected, theme }) => 
    $isSelected ? theme.colors.primary : theme.colors.textPrimary
  };
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent}10;
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 4px 8px;
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

const ChildCard = styled(Card)`
  padding: 20px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  min-height: 300px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.border}20;
  }
  
  @media (max-width: 768px) {
    padding: 16px;
    min-height: 280px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    min-height: 260px;
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
  flex-shrink: 0;
  
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

const ChildInfo = styled.div`
  flex: 1;
  min-width: 0;
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

const ChildGroup = styled.div`
    font-size: 12px;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const ChildDetails = styled.div`
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 10px;
  }
`;

const DetailRow = styled.div`
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

const DetailLabel = styled.span`
  font-size: 13px;
    color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;
  
const DetailValue = styled.span`
  font-size: 13px;
    color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const ParentsSection = styled.div`
  margin-top: 12px;
  
  @media (max-width: 768px) {
    margin-top: 10px;
  }
  
  @media (max-width: 480px) {
    margin-top: 8px;
  }
`;

const ParentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    padding: 6px 8px;
    gap: 6px;
    margin-bottom: 4px;
  }
`;

const ParentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const ParentName = styled.span`
  font-size: 13px;
    color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const ParentContact = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  
  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const ParentEmail = styled.span`
  font-size: 11px;
    color: ${({ theme }) => theme.colors.textSecondary};
  
  @media (max-width: 480px) {
    font-size: 10px;
  }
`;
  
const ParentPhone = styled.span`
  font-size: 11px;
    color: ${({ theme }) => theme.colors.primary};
  
  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  margin-top: auto;
  padding-top: 12px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
    padding-top: 8px;
  }
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'success' | 'secondary' }>`
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  
  background: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return theme.colors.primary;
      case 'success':
        return theme.colors.success;
      case 'secondary':
        return theme.colors.surfaceAlt;
      default:
        return theme.colors.surfaceAlt;
    }
  }};
  
  color: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
      case 'success':
        return 'white';
      default:
        return theme.colors.textPrimary;
    }
  }};
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${({ $variant, theme }) => {
      switch ($variant) {
        case 'primary':
          return theme.colors.primary + '30';
        case 'success':
          return theme.colors.success + '30';
        default:
          return theme.colors.border;
      }
    }};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 11px;
    gap: 4px;
    min-height: 36px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 10px;
    gap: 3px;
    min-height: 32px;
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

interface Child {
  id: string;
  name: string;
  birthdate: string;
  photoUrl?: string;
  groupId?: string;
  group?: {
    id: string;
    name: string;
  };
  parents?: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
  }>;
}

interface Group {
  id: string;
  name: string;
  children: Child[];
}

const Kinder: React.FC = () => {
  const { benutzer } = useUser();
  const [children, setChildren] = useState<Child[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'age'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (benutzer?.role !== 'EDUCATOR') return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Load groups first
        const groupsData = await fetchMyGroups(benutzer.id);
        setGroups(groupsData || []);
        
        // Load children from all groups
        const childrenData = await fetchAssignedChildren(benutzer.id);
        setChildren(childrenData || []);
      } catch (err) {
        setError('Fehler beim Laden der Kinder.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [benutzer]);

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return 'Alter unbekannt';
    
    const today = new Date();
    const birth = new Date(birthdate);
    
    // Check if the date is valid
    if (isNaN(birth.getTime())) {
      return 'Alter unbekannt';
    }
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    // Check if age is reasonable (between 0 and 18)
    if (age < 0 || age > 18) {
      return 'Alter unbekannt';
    }
    
    return age;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    // Basic phone formatting
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  const filteredAndSortedChildren = children
    .filter(child => {
      // Filter by selected group
      if (selectedGroupId !== 'all' && child.groupId !== selectedGroupId) {
        return false;
      }
      
      // Filter by search term
      return child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.parents?.some(parent => 
          parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (parent.phone && parent.phone.includes(searchTerm))
        );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'age':
          const ageA = calculateAge(a.birthdate);
          const ageB = calculateAge(b.birthdate);
          // Handle both number and string return types
          if (typeof ageA === 'number' && typeof ageB === 'number') {
          comparison = ageA - ageB;
          } else if (typeof ageA === 'string' && typeof ageB === 'string') {
            comparison = ageA.localeCompare(ageB);
          } else if (typeof ageA === 'number') {
            comparison = -1; // Numbers come before strings
          } else {
            comparison = 1; // Strings come after numbers
          }
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleQuickAction = (action: string, childId: string) => {
    switch (action) {
      case 'checkin':
        navigate(`/educator/checkin?childId=${childId}`);
        break;
      case 'notes':
        navigate(`/educator/notizen?childId=${childId}`);
        break;
      case 'messages':
        // For now, navigate to general chat since child-specific messaging might not be implemented
        navigate('/educator/chat');
        break;
      default:
        break;
    }
  };

  const getSelectedGroupName = () => {
    if (selectedGroupId === 'all') return 'Alle Gruppen';
    const group = groups.find(g => g.id === selectedGroupId);
    return group?.name || 'Alle Gruppen';
  };

  if (benutzer?.role !== 'EDUCATOR') return <ErrorMascot />;
  if (loading) return <AnimatedMascotsLoader text="Lade Kinder..." />;
  if (error) return <ErrorMascot text={error} />;

  // Calculate meaningful stats for educators
  const totalChildren = children.length;
  const totalParents = new Set(children.flatMap(child => child.parents?.map(p => p.id) || [])).size;
  const averageAge = totalChildren > 0 
    ? Math.round(children.reduce((sum, child) => {
        const age = calculateAge(child.birthdate);
        return sum + (typeof age === 'number' ? age : 0);
      }, 0) / totalChildren)
    : 0;
  const totalGroups = groups.length;
  
  // Age distribution for better insights
  const ageGroups = {
    under3: children.filter(child => {
      const age = calculateAge(child.birthdate);
      return typeof age === 'number' && age < 3;
    }).length,
    age3to6: children.filter(child => {
      const age = calculateAge(child.birthdate);
      return typeof age === 'number' && age >= 3 && age <= 6;
    }).length,
    over6: children.filter(child => {
      const age = calculateAge(child.birthdate);
      return typeof age === 'number' && age > 6;
    }).length
  };

  return (
    <>
      <Header title="Meine Kinder" />
      <PageContainer>
        {/* Statistics */}
        <StatsSection>
        <StatsGrid>
          <StatCard>
              <StatNumber>{totalChildren}</StatNumber>
              <StatLabel>Kinder</StatLabel>
          </StatCard>
          <StatCard>
              <StatNumber>{ageGroups.age3to6}</StatNumber>
              <StatLabel>3-6 Jahre</StatLabel>
          </StatCard>
          <StatCard>
              <StatNumber>{averageAge}</StatNumber>
              <StatLabel>Ø Alter</StatLabel>
          </StatCard>
          <StatCard>
              <StatNumber>{totalGroups}</StatNumber>
              <StatLabel>Gruppen</StatLabel>
          </StatCard>
        </StatsGrid>
        </StatsSection>

        {/* Control Section */}
        <ControlSection>
          <SearchRow>
            <SearchInput
              placeholder="Kinder oder Eltern suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchRow>
          
          <FilterRow>
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
              <option value="age-asc">Alter aufsteigend</option>
              <option value="age-desc">Alter absteigend</option>
            </FilterSelect>
          
          {/* Group Selector */}
          {groups.length > 1 && (
            <GroupSelector>
              <GroupSelect onClick={() => setGroupDropdownOpen(!groupDropdownOpen)}>
                <span>{getSelectedGroupName()}</span>
                <FaChevronDown style={{ fontSize: '12px' }} />
              </GroupSelect>
              <GroupDropdown $isOpen={groupDropdownOpen}>
                <GroupOption 
                  $isSelected={selectedGroupId === 'all'}
                  onClick={() => {
                    setSelectedGroupId('all');
                    setGroupDropdownOpen(false);
                  }}
                >
                  Alle Gruppen ({totalChildren})
                </GroupOption>
                {groups.map(group => (
                  <GroupOption 
                    key={group.id}
                    $isSelected={selectedGroupId === group.id}
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setGroupDropdownOpen(false);
                    }}
                  >
                    {group.name} ({group.children?.length || 0})
                  </GroupOption>
                ))}
              </GroupDropdown>
            </GroupSelector>
          )}
          </FilterRow>
        </ControlSection>

        {/* Children Grid */}
        {filteredAndSortedChildren.length > 0 ? (
          <ChildrenGrid>
            {filteredAndSortedChildren.map(child => (
              <ChildCard key={child.id}>
                <CardHeader>
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
                  <ChildInfo>
                    <ChildName>{child.name}</ChildName>
                    <ChildAge>
                      {(() => {
                        const age = calculateAge(child.birthdate);
                        return typeof age === 'number' ? `${age} Jahre` : age;
                      })()}
                    </ChildAge>
                    {child.group && (
                      <ChildGroup>{child.group.name}</ChildGroup>
                    )}
                  </ChildInfo>
                </CardHeader>

                <ChildDetails>
                  <DetailRow>
                    <DetailLabel>Geboren:</DetailLabel>
                    <DetailValue>{formatDate(child.birthdate)}</DetailValue>
                  </DetailRow>
                  
                  {child.parents && child.parents.length > 0 && (
                    <ParentsSection>
                      <DetailRow>
                        <DetailLabel>Eltern:</DetailLabel>
                      </DetailRow>
                      {child.parents.map((parent, index) => (
                        <ParentItem key={parent.id}>
                          <ParentInfo>
                            <ParentName>{parent.name}</ParentName>
                            <ParentContact>
                              <FaEnvelope style={{ color: theme.colors.textSecondary, fontSize: '11px' }} />
                              <ParentEmail>{parent.email}</ParentEmail>
                            </ParentContact>
                          {parent.phone && (
                              <ParentContact>
                                <FaPhone style={{ color: theme.colors.primary, fontSize: '11px' }} />
                                <ParentPhone>{formatPhone(parent.phone)}</ParentPhone>
                              </ParentContact>
                          )}
                          </ParentInfo>
                        </ParentItem>
                      ))}
                    </ParentsSection>
                  )}
                </ChildDetails>

                <ActionButtons>
                  <ActionButton 
                    $variant="primary" 
                    onClick={() => handleQuickAction('checkin', child.id)}
                  >
                    <FaCheckCircle />
                    Check-in
                  </ActionButton>
                  <ActionButton 
                    $variant="success" 
                    onClick={() => handleQuickAction('notes', child.id)}
                  >
                    <FaStickyNote />
                    Notizen
                  </ActionButton>
                  <ActionButton 
                    $variant="secondary" 
                    onClick={() => handleQuickAction('messages', child.id)}
                  >
                    <FaComments />
                    Chat
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
              {searchTerm 
                ? 'Versuchen Sie andere Suchkriterien.'
                : 'Es sind derzeit keine Kinder in Ihrer Gruppe eingetragen.'
              }
            </EmptyDescription>
          </EmptyState>
        )}
      </PageContainer>
    </>
  );
};

export default Kinder; 