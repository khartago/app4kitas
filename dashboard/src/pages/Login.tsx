import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import AppLogo from '../components/ui/AppLogo';
import MascotBear from '../components/ui/MascotBear';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { login } from '../services/authApi';
import { useDarkMode } from '../styles/theme';

const GlobalNoScroll = createGlobalStyle`
  html, body, #root {
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  @media (max-width: 600px) {
    html, body, #root {
      overflow: auto;
    }
  }
`;

const Background = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(120deg, ' + theme.colors.background + ' 60%, #23272F 100%)'
    : 'linear-gradient(120deg, ' + theme.colors.background + ' 60%, #fffbe7 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  @media (max-width: 600px) {
    overflow: auto;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 48px 36px 40px 36px;
  border-radius: 32px;
  box-shadow: 0 8px 32px rgba(44, 62, 80, 0.10), 0 2px 8px rgba(44, 62, 80, 0.04);
  min-width: 340px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  overflow: visible;
  @media (max-width: 600px) {
    padding: 10px 6vw 16px 6vw;
    min-width: 220px;
    max-width: 90vw;
    width: auto;
    border-radius: 16px;
  }
  @media (max-width: 375px) {
    padding: 6px 2vw 10px 2vw;
    min-width: 0;
    border-radius: 10px;
  }
`;

const MascotInCard = styled.div`
  position: absolute;
  top: 8px;
  right: 10px;
  z-index: 3;
  @media (max-width: 375px) {
    top: 2px;
    right: 2px;
    svg { width: 60px !important; height: 60px !important; }
  }
`;

const MascotMobile = styled.div`
  display: none;
  @media (max-width: 600px) {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1px;
    margin-top: 6px;
  }
`;

const Welcome = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 10px;
  text-align: center;
  @media (max-width: 600px) {
    font-size: 1.3rem;
  }
  @media (max-width: 375px) {
    font-size: 1.05rem;
    margin-bottom: 6px;
  }
`;

const Subheadline = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 32px;
  text-align: center;
  @media (max-width: 600px) {
    font-size: 0.95rem;
    margin-bottom: 18px;
  }
  @media (max-width: 375px) {
    font-size: 0.85rem;
    margin-bottom: 10px;
  }
`;

const Headline = styled.h2`
  ${({ theme }) => `
    font-family: ${theme.typography.fontFamily};
    font-size: ${theme.typography.headline2.fontSize + 2}px;
    font-weight: ${theme.typography.headline2.fontWeight};
    color: ${theme.colors.textPrimary};
  `}
  margin-bottom: 32px;
  text-align: center;
  @media (max-width: 375px) {
    font-size: 1.1rem !important;
    margin-bottom: 16px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.components.input.padding};
  border-radius: ${({ theme }) => theme.components.input.borderRadius};
  border: 1.5px solid ${({ theme }) => theme.components.input.borderColor};
  margin-bottom: 18px;
  font-size: 16px;
  background: ${({ theme }) => theme.colors.surface};
  transition: border 0.2s, box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.components.input.focusedBorderColor};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}22;
  }
  @media (max-width: 375px) {
    font-size: 13px;
    padding: 8px 10px;
    margin-bottom: 10px;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.components.button.padding};
  border-radius: ${({ theme }) => theme.components.button.borderRadius};
  background: ${({ theme }) => theme.components.button.background};
  color: ${({ theme }) => theme.colors.surface};
  font-weight: bold;
  border: none;
  cursor: pointer;
  margin-top: 8px;
  font-size: 17px;
  letter-spacing: 0.01em;
  box-shadow: ${({ theme }) => theme.components.button.boxShadow};
  transition: background 0.18s, box-shadow 0.18s, color 0.18s, transform 0.12s;
  &:hover:not(:disabled), &:focus-visible:not(:disabled) {
    background: ${({ theme }) => theme.components.button.hoverBackground};
    color: ${({ theme }) => theme.colors.surface};
    box-shadow: 0 8px 32px ${({ theme }) => theme.colors.primary}29;
    transform: translateY(-1px) scale(1.01);
  }
  &:active:not(:disabled) {
    background: ${({ theme }) => theme.components.button.activeBackground};
    transform: scale(0.98);
  }
  &:disabled {
    background: ${({ theme }) => theme.components.button.disabledBackground};
    color: ${({ theme }) => theme.components.button.disabledColor};
    opacity: ${({ theme }) => theme.components.button.disabledOpacity};
    cursor: ${({ theme }) => theme.components.button.disabledCursor};
  }
  @media (max-width: 375px) {
    font-size: 14px;
    padding: 10px 0;
    margin-top: 6px;
  }
`;

const ErrorMsg = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.mode === 'dark' ? '#2C2F36' : '#fff6f6'};
  border-radius: 12px;
  font-size: ${({ theme }) => theme.typography.body2.fontSize}px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  padding: 16px 18px;
  margin-bottom: 22px;
  width: 90%;
  max-width: 420px;
  min-height: 48px;
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 2px 8px rgba(244,67,54,0.07);
  text-align: center;
  svg {
    margin-right: 10px;
    flex-shrink: 0;
  }
`;

const mascotBearCss = `
  .mascot-bear-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .mascot-bear {
    /* No width/height here! Let SVG size prop control it. */
  }
`;

const MascotBearResponsiveStyle = createGlobalStyle`
  ${mascotBearCss}
`;

const DarkModeButton = styled.button`
  position: absolute;
  top: 18px;
  left: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
  transition: background 0.18s;
  z-index: 10;
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.accent}22;
    outline: none;
  }
  @media (max-width: 375px) {
    top: 6px;
    left: 6px;
    padding: 2px;
    svg { width: 20px !important; height: 20px !important; }
  }
`;

const MoonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M18 14.5A8 8 0 0 1 7.5 4c0-.2 0-.4.02-.6A8 8 0 1 0 18 14.5z" fill="#FFC107" stroke="#FFC107" strokeWidth="2"/></svg>
);
const SunIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="5" fill="#FFC107" stroke="#FFC107" strokeWidth="2"/><path d="M11 1v2M11 19v2M21 11h-2M3 11H1M17.07 17.07l-1.41-1.41M6.34 6.34L4.93 4.93M17.07 4.93l-1.41 1.41M6.34 17.07l-1.41-1.41" stroke="#FFC107" strokeWidth="2" strokeLinecap="round"/></svg>
);

function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mobileMascotSize, setMobileMascotSize] = useState(130);
  const navigate = useNavigate();
  const { benutzer, setBenutzer, loading: userLoading } = useUser();
  const { mode, toggle } = useDarkMode();

  useEffect(() => {
    if (!userLoading && benutzer) {
      // User is already connected, redirect based on role
      const role = (benutzer.role || '').toUpperCase();
      if (role === 'SUPER_ADMIN') {
        navigate('/superadmin/dashboard', { replace: true });
      } else if (role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (role === 'EDUCATOR') {
        navigate('/educator', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [benutzer, userLoading, navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setMobileMascotSize(Math.min(130, window.innerWidth - 48));
      } else {
        setMobileMascotSize(130);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      setBenutzer(data.user);
      const role = (data.user?.role || (decodeJWT(data.token)?.role))?.toUpperCase();
      if (role === 'SUPER_ADMIN') {
        navigate('/superadmin/dashboard', { replace: true });
      } else if (role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (role === 'EDUCATOR') {
        navigate('/educator', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setError('Login fehlgeschlagen. Bitte überprüfe deine Zugangsdaten.');
    } finally {
      setLoading(false);
    }
  };

  if (!userLoading && benutzer) return null;

  return (
    <>
      <GlobalNoScroll />
      <MascotBearResponsiveStyle />
      <Background>
        <Card>
          <DarkModeButton onClick={toggle} aria-label={mode === 'dark' ? 'Lichtmodus aktivieren' : 'Dunkelmodus aktivieren'}>
            {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
          </DarkModeButton>
          <MascotInCard>
            <span className="mascot-bear-wrapper">
              <MascotBear
                size={window.innerWidth <= 375 ? 60 : window.innerWidth <= 600 ? 90 : 110}
                className="mascot-bear"
                mood="happy"
                waving
              />
            </span>
          </MascotInCard>
          <AppLogo size={56} variant="vertical" />
          <Welcome>Willkommen zurück!</Welcome>
          <Subheadline>Bitte melden Sie sich an, um fortzufahren.</Subheadline>
          <Headline>Anmeldung</Headline>
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            {error && (
              <ErrorMsg>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#F44336" opacity="0.15"/><path d="M12 8v4m0 4h.01" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {error}
              </ErrorMsg>
            )}
            <Input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
            <Input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Anmelden...' : 'Anmelden'}
            </Button>
          </form>
        </Card>
      </Background>
    </>
  );
};

export default Login; 