import React from 'react';
import styled from 'styled-components';
import ProfileDropdown from './ProfileDropdown';
import { useDarkMode } from '../styles/theme';
import { ThemeContext, DefaultTheme } from 'styled-components';
import { useUser } from './UserContext';
import { logout as logoutApi } from '../services/authApi';

const SIDEBAR_WIDTH = 200;
const HEADER_HEIGHT_DESKTOP = 64;
const HEADER_HEIGHT_MOBILE = 56;

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FixedHeader = styled.header`
  position: fixed;
  top: 0;
  left: ${SIDEBAR_WIDTH}px;
  right: 0;
  width: auto;
  height: ${HEADER_HEIGHT_DESKTOP}px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.border}20;
  border: none;
  border-radius: 0;
  z-index: 1000;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: all 0.2s ease;
  overflow: hidden;
  
  @media (max-width: 768px) {
    left: 0;
    width: 100%;
    height: ${HEADER_HEIGHT_MOBILE}px;
    padding: 0 16px;
  }
  
  @media (max-width: 480px) {
    padding: 0 12px;
  }
  
  @media (max-width: 360px) {
    padding: 0 8px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  gap: 16px;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.headline2.fontSize};
  font-weight: ${({ theme }) => theme.typography.headline2.fontWeight};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.headline3.fontSize};
    letter-spacing: 0.3px;
  }
  
  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.body1.fontSize};
    font-weight: 600;
    max-width: 120px;
  }
  
  @media (max-width: 360px) {
    max-width: 100px;
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchBar = styled.input`
  width: 280px;
  padding: 8px 36px 8px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all 0.2s ease;
  outline: none;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
  
  @media (max-width: 1024px) {
    width: 200px;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: 0;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
  }
  
  @media (max-width: 360px) {
    gap: 4px;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.colors.textPrimary};
  min-width: 36px;
  height: 36px;
  
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.accent}15;
    outline: none;
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    padding: 6px;
    min-width: 32px;
    height: 32px;
  }
  
  @media (max-width: 480px) {
    padding: 4px;
    min-width: 28px;
    height: 28px;
  }
`;

const DarkModeButton = styled(IconButton)`
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.primary}15;
  }
`;

const NotificationButton = styled(IconButton)`
  position: relative;
  
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.warning}15;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: ${({ theme }) => theme.colors.error};
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.surface};
  
  @media (max-width: 768px) {
    top: 2px;
    right: 2px;
    width: 6px;
    height: 6px;
  }
`;

const MobileSearchButton = styled(IconButton)`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);

const SearchIconSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const Header: React.FC<HeaderProps> = ({ title, showSearch, searchValue, onSearchChange }) => {
  const { logout } = useUser();
  const { mode, toggle } = useDarkMode();
  const theme = React.useContext(ThemeContext) as DefaultTheme;
  
  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      window.location.href = '/login';
    }
  };
  
  return (
    <FixedHeader>
      <HeaderContent>
        <LeftSection>
          <Title title={title}>{title}</Title>
          {showSearch && (
            <SearchWrapper>
              <SearchBar
                type="text"
                placeholder="Suchen..."
                value={searchValue}
                onChange={onSearchChange}
                aria-label="Suchen"
              />
              <SearchIcon>
                <SearchIconSVG />
              </SearchIcon>
            </SearchWrapper>
          )}
        </LeftSection>
        
        <RightSection>
          <DarkModeButton 
            onClick={toggle} 
            aria-label={mode === 'dark' ? 'Lichtmodus aktivieren' : 'Dunkelmodus aktivieren'}
          >
            {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
          </DarkModeButton>
          
          <NotificationButton aria-label="Benachrichtigungen">
            <BellIcon />
            <NotificationBadge />
          </NotificationButton>
          
          <ProfileDropdown onLogout={handleLogout} />
        </RightSection>
      </HeaderContent>
    </FixedHeader>
  );
};

export default Header; 