import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import AppLogo from './ui/AppLogo';
import MascotBear from './ui/MascotBear';
import IconWrapper from './ui/IconWrapper';
import { 
  FaUniversity, 
  FaChalkboardTeacher, 
  FaUserFriends, 
  FaUsers, 
  FaEnvelope, 
  FaStickyNote 
} from 'react-icons/fa';

// SVG icon map for sidebar
const icons = {
  Dashboard: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor" opacity=".5"/><rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor" opacity=".5"/></svg>
  ),
  Gruppen: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M17 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/><circle cx="17" cy="13" r="4" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  Kinder: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  Personal: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  Statistiken: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="13" width="4" height="8" rx="2" fill="currentColor"/><rect x="10" y="9" width="4" height="12" rx="2" fill="currentColor" opacity=".5"/><rect x="17" y="5" width="4" height="16" rx="2" fill="currentColor"/></svg>
  ),
  Benachrichtigungen: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  Monatsbericht: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  Tagesbericht: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  Berichte: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  Institutionen: <IconWrapper icon={FaUniversity} size={22} />,
  Erzieher: <IconWrapper icon={FaChalkboardTeacher} size={22} />,
  Eltern: <IconWrapper icon={FaUserFriends} size={22} />,
  'Meine Gruppe': <IconWrapper icon={FaUsers} size={22} />,
  Nachrichten: <IconWrapper icon={FaEnvelope} size={22} />,
  Notizen: <IconWrapper icon={FaStickyNote} size={22} />,
};

const SidebarContainer = styled.nav`
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  background: ${({ theme }) => theme.colors.surface};
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-shadow: 2px 0 16px rgba(44,62,80,0.06);
  z-index: 100;
  border-radius: 0;
  margin: 0;
  overflow: hidden;
  @media (max-width: 700px) {
    width: 56px;
    min-width: 56px;
    max-width: 56px;
    align-items: center;
  }
`;

const SidebarLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textSecondary};
  font-weight: 600;
  font-size: 18px;
  text-decoration: none;
  border-radius: 12px;
  margin: 4px 8px;
  background: ${({ $active, theme }) => $active ? theme.colors.background : 'transparent'};
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }
  @media (max-width: 700px) {
    justify-content: center;
    gap: 0;
    padding: 0;
    font-size: 0;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    margin: 8px auto;
    background: transparent;
    box-shadow: none;
    border: none;
    color: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.textSecondary};
    span {
      display: none;
    }
    svg {
      margin: 0 auto;
      display: block;
      color: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.textSecondary};
    }
  }
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
`;
const LogoDivider = styled.div`
  width: 80%;
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 0 auto 8px auto;
`;
const NavList = styled.ul`
  list-style: none;
  padding: 4px 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  min-height: 250px;
  max-height: calc(100vh - 350px);
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textSecondary};
  }
  
  /* Gradient overlay for scroll indication */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20px;
    background: linear-gradient(transparent, ${({ theme }) => theme.colors.surface});
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;
const NavItem = styled.li<{ $active: boolean }>`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  a {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 18px;
    color: ${({ theme, $active }) => ($active ? theme.colors.primaryDark : theme.colors.textPrimary)};
    background: ${({ theme, $active }) => ($active ? theme.colors.primary + '10' : 'transparent')};
    text-decoration: none;
    font-weight: ${({ theme, $active }) => ($active ? 700 : 400)};
    font-size: clamp(0.95rem, 1.2vw, 1.15rem);
    border-left: 4px solid ${({ theme, $active }) => ($active ? theme.colors.accent : 'transparent')};
    border-radius: 0 16px 16px 0;
    box-shadow: ${({ $active }) => ($active ? '0 2px 8px rgba(76,175,80,0.08)' : 'none')};
    transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, padding 0.2s, font-size 0.2s;
    svg {
      color: ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.textSecondary)};
      flex-shrink: 0;
      transition: color 0.2s;
      width: 1.5em;
      height: 1.5em;
    }
    &:hover, &:focus {
      background: ${({ theme }) => theme.colors.accent}22;
      color: ${({ theme }) => theme.colors.primary};
      outline: none;
      svg {
        color: ${({ theme }) => theme.colors.primary};
      }
    }
    &[aria-current='page'] {
      font-weight: 700;
      color: ${({ theme }) => theme.colors.primaryDark};
      svg {
        color: ${({ theme }) => theme.colors.accent};
      }
    }
    @media (max-width: 700px) {
      background: transparent !important;
      border: none !important;
      border-left: none !important;
      box-shadow: none !important;
      color: ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.textSecondary)};
      font-weight: 600;
      svg {
        color: ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.textSecondary)};
      }
    }
  }
`;
const LogoutIconButton = styled.button`
  display: none;
  @media (max-width: 700px) {
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.colors.error};
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    margin: 6px auto 10px auto;
    box-shadow: none;
    cursor: pointer;
    transition: background 0.2s;
    padding: 0;
    &:hover, &:focus {
      background: ${({ theme }) => theme.colors.primaryDark};
      outline: none;
    }
    svg {
      width: 20px;
      height: 20px;
      display: block;
      margin: 0 auto;
    }
  }
`;
const BearSpacer = styled.div`
  flex: 1 1 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  max-height: 140px;
  margin-top: 60px;
  margin-left: -25px;
  @media (max-width: 700px) {
    display: none;
  }
`;
const UserSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 16px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;
const UserName = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 2px;
  text-align: center;
`;
const UserEmail = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 8px;
  text-align: center;
`;
const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.error};
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 22px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: clamp(0.9rem, 1vw, 1.05rem);
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  margin-bottom: 4px;
  box-shadow: 0 2px 8px rgba(244,67,54,0.08);
  transition: background 0.2s, box-shadow 0.2s;
  z-index: 1;
  min-height: 44px;
  overflow: visible;
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.primaryDark};
    box-shadow: 0 4px 16px rgba(244,67,54,0.16);
    outline: none;
  }
  @media (max-width: 700px) {
    display: none;
  }
`;

const navItemsByRole = {
  SUPER_ADMIN: [
    { label: 'Dashboard', path: '/superadmin/dashboard' },
    { label: 'Institutionen', path: '/superadmin/institutionen' },
    { label: 'Erzieher', path: '/superadmin/erzieher' },
    { label: 'Eltern', path: '/superadmin/eltern' },
    { label: 'Statistiken', path: '/superadmin/statistiken' },
    { label: 'Berichte', path: '/superadmin/berichte' },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Gruppen', path: '/admin/gruppen' },
    { label: 'Kinder', path: '/admin/kinder' },
    { label: 'Personal', path: '/admin/personal' },
    { label: 'Statistiken', path: '/admin/statistiken' },
    { label: 'Benachrichtigungen', path: '/admin/benachrichtigungen' },
    { label: 'Monatsbericht', path: '/admin/monatsbericht' },
    { label: 'Tagesbericht', path: '/admin/tagesbericht' },
    { label: 'Berichte', path: '/admin/berichte' },
  ],
  EDUCATOR: [
    { label: 'Dashboard', path: '/educator/dashboard' },
    { label: 'Meine Gruppe', path: '/educator/meine-gruppe' },
    { label: 'Kinder', path: '/educator/kinder' },
    { label: 'Nachrichten', path: '/educator/nachrichten' },
    { label: 'Notizen', path: '/educator/notizen' },
  ],
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { benutzer, loading } = useUser();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    window.location.href = '/login';
  };

  if (loading || !benutzer || !benutzer.role) return null;
  const navItems = navItemsByRole[benutzer.role as keyof typeof navItemsByRole] || [];

  return (
    <SidebarContainer>
      <LogoArea>
        <Link to="/">
          <AppLogo size={36} variant="icon" />
        </Link>
      </LogoArea>
      <LogoDivider />
      <NavList>
        {navItems.map((item: { label: string; path: string }) => (
          <NavItem key={item.path} $active={location.pathname === item.path}>
            <SidebarLink to={item.path} $active={location.pathname === item.path} title={item.label}>
              {icons[item.label as keyof typeof icons]}
              <span>{item.label}</span>
            </SidebarLink>
          </NavItem>
        ))}
      </NavList>
      <BearSpacer>
        <MascotBear size={120} height={80} mood="help" variant="vertical" noWaving />
      </BearSpacer>
      <UserSection>
        <LogoutButton onClick={handleLogout} aria-label="Abmelden">
          Abmelden
        </LogoutButton>
        <LogoutIconButton onClick={handleLogout} title="Abmelden" aria-label="Abmelden">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9M13 5V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </LogoutIconButton>
      </UserSection>
    </SidebarContainer>
  );
};

export default Sidebar; 