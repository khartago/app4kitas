import React from 'react';
import styled from 'styled-components';
import ProfileDropdown from './ProfileDropdown';
import { useDarkMode } from '../styles/theme';
import { ThemeContext, DefaultTheme } from 'styled-components';

const SIDEBAR_WIDTH = 200;
const HEADER_HEIGHT_DESKTOP = 64;
const HEADER_HEIGHT_MOBILE = 48;

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
  color: ${({ theme }) => theme.components.appBar.textColor};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  box-shadow: none;
  border: none;
  border-radius: 0;
  z-index: 1000;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: background 0.18s, box-shadow 0.18s;
  overflow: visible;
  @media (max-width: 700px) {
    left: 0;
    width: 100%;
    height: ${HEADER_HEIGHT_MOBILE}px;
    padding: 0 8px;
    border-radius: 0;
  }
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.headline2.fontSize};
  font-weight: ${({ theme }) => theme.typography.headline2.fontWeight};
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  letter-spacing: 1.2px;
  white-space: nowrap;
  overflow: visible;
  flex-shrink: 0;
  z-index: 1;
  @media (max-width: 600px) {
    font-size: ${({ theme }) => theme.typography.body1.fontSize};
  }
`;

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  @media (max-width: 900px) {
    justify-content: flex-end;
  }
`;

const SearchBar = styled.input`
  width: 320px;
  max-width: 100%;
  padding: 8px 36px 8px 14px;
  border-radius: ${({ theme }) => theme.components.input.borderRadius};
  border: 1.5px solid ${({ theme }) => theme.components.input.borderColor};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: border-color 0.18s;
  outline: none;
  &:focus {
    border-color: ${({ theme }) => theme.components.input.focusedBorderColor};
  }
  @media (max-width: 600px) {
    width: 120px;
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
  font-size: 1.2em;
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  @media (max-width: 600px) {
    gap: 10px;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
  transition: background 0.18s;
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.accent}22;
    outline: none;
  }
`;

const DarkModeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
  transition: background 0.18s;
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.accent}22;
    outline: none;
  }
`;

const SunIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="5" stroke="#FFC107" strokeWidth="2" fill="#FFC107"/><g stroke="#FFC107" strokeWidth="2"><line x1="11" y1="1" x2="11" y2="4"/><line x1="11" y1="18" x2="11" y2="21"/><line x1="1" y1="11" x2="4" y2="11"/><line x1="18" y1="11" x2="21" y2="11"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="15.66" y1="15.66" x2="17.78" y2="17.78"/><line x1="4.22" y1="17.78" x2="6.34" y2="15.66"/><line x1="15.66" y1="6.34" x2="17.78" y2="4.22"/></g></svg>
);

const MoonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M18 14.5A8 8 0 0 1 7.5 4c0-.2 0-.4.02-.6A8 8 0 1 0 18 14.5z" fill="#FFC107" stroke="#FFC107" strokeWidth="2"/></svg>
);

const BellIcon = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" focusable="false">
    <path d="M13 23c1.38 0 2.5-1.12 2.5-2.5h-5A2.5 2.5 0 0 0 13 23zm7-5V12c0-3.07-1.63-5.64-5-6.32V5a2 2 0 1 0-4 0v.68C6.63 6.36 5 8.92 5 12v6l-1.29 1.29A1 1 0 0 0 5 21h16a1 1 0 0 0 .71-1.71L20 18z" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

const Header: React.FC<HeaderProps> = ({ title, showSearch, searchValue, onSearchChange }) => {
  const handleLogout = () => {
    localStorage.removeItem('jwt');
    window.location.href = '/login';
  };
  const { mode, toggle } = useDarkMode();
  const theme = React.useContext(ThemeContext) as DefaultTheme;
  return (
    <FixedHeader>
      <CenterSection>
        <Title>{title}</Title>
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
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="8.5" cy="8.5" r="6.5" stroke="#757575" strokeWidth="2"/><path d="M16 16L13 13" stroke="#757575" strokeWidth="2" strokeLinecap="round"/></svg>
            </SearchIcon>
          </SearchWrapper>
        )}
      </CenterSection>
      <RightSection>
        <DarkModeButton onClick={toggle} aria-label={mode === 'dark' ? 'Lichtmodus aktivieren' : 'Dunkelmodus aktivieren'}>
          {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
        </DarkModeButton>
        <IconButton tabIndex={0} aria-label="Benachrichtigungen">
          <BellIcon color={theme.colors.primary} />
        </IconButton>
        <ProfileDropdown onLogout={handleLogout} />
      </RightSection>
    </FixedHeader>
  );
};

export default Header; 