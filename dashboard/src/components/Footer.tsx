import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaBalanceScale, FaInfoCircle, FaLifeRing, FaStar, FaFileAlt, FaShieldAlt, FaGavel } from 'react-icons/fa';
import AppLogo from './ui/AppLogo';

const FooterWrapper = styled.footer`
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 -2px 16px 0 rgba(0,0,0,0.03);
  padding: 2.5rem 0 1.5rem 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const BrandName = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.3rem 0;
  letter-spacing: 0.5px;
  text-align: center;
`;

const BrandDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
  margin: 0 0 1.2rem 0;
  line-height: 1.5;
  text-align: center;
`;

const NavLinks = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 1.7rem;
  list-style: none;
  padding: 0;
  margin: 0 0 1.2rem 0;
  justify-content: center;
  @media (max-width: 600px) {
    gap: 1rem;
  }
`;

const NavLink = styled.li<{ active?: boolean }>`
  a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.textPrimary};
    text-decoration: none;
    font-weight: 600;
    font-size: 1.08rem;
    padding: 0.5rem 1.1rem;
    border-radius: 8px;
    background: ${({ theme, active }) => active ? theme.colors.primary + '10' : 'transparent'};
    transition: all 0.2s;
    cursor: pointer;
    position: relative;
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
      background: ${({ theme }) => theme.colors.primary}08;
      box-shadow: 0 2px 8px 0 ${({ theme }) => theme.colors.primary}10;
    }
  }
`;

const Copyright = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85rem;
  margin: 1.2rem 0 0 0;
  opacity: 0.8;
  text-align: center;
`;

const navItems = [
  { label: 'Startseite', path: '/', icon: <FaHome size={16} /> },
  { label: 'Compliance', path: '/compliance', icon: <FaBalanceScale size={16} /> },
  { label: 'Status', path: '/status', icon: <FaInfoCircle size={16} /> },
  { label: 'Hilfe', path: '/help', icon: <FaLifeRing size={16} /> },
  { label: 'Credits', path: '/credits', icon: <FaStar size={16} /> },
  { label: 'Impressum', path: '/impressum', icon: <FaFileAlt size={16} /> },
  { label: 'Datenschutz', path: '/privacy', icon: <FaShieldAlt size={16} /> },
  { label: 'Nutzungsbedingungen', path: '/terms', icon: <FaGavel size={16} /> },
];

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  return (
    <FooterWrapper>
      <LogoWrapper><AppLogo size={56} variant="icon" /></LogoWrapper>
      <BrandName>App4KITAs</BrandName>
      <BrandDescription>
        Die moderne, DSGVO-konforme Kita-Management-Plattform für Europa.
      </BrandDescription>
      <NavLinks>
        {navItems.map((item) => (
          <NavLink key={item.path} active={location.pathname === item.path}>
            <a onClick={() => navigate(item.path)}>{item.icon}{item.label}</a>
          </NavLink>
        ))}
      </NavLinks>
      <Copyright>
        © {currentYear} App4KITAs. Alle Rechte vorbehalten.
      </Copyright>
    </FooterWrapper>
  );
};

export default Footer; 