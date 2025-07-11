import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider } from './styles/theme';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import styled from 'styled-components';
import EducatorRoutes from './routes/EducatorRoutes';
import AdminRoutes from './routes/AdminRoutes';
import SuperAdminRoutes from './routes/SuperAdminRoutes';
import Header from './components/Header';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Credits from './pages/Credits';
import { UserContextProvider, useUser } from './components/UserContext';
import { createGlobalStyle } from 'styled-components';

// Hilfsfunktion zum JWT-Decode (ohne externe Abhängigkeit)
function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

const SIDEBAR_WIDTH = 200;
const HEADER_HEIGHT = 56;

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;
const MainContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-left: ${SIDEBAR_WIDTH}px;
  margin-top: 0;
  background: ${({ theme }) => theme.colors.background};
  @media (max-width: 700px) {
    margin-left: 56px;
  }
`;
const Main = styled.main`
  flex: 1;
  padding: 0;
  margin: 55px 23px;
  background: ${({ theme }) => theme.colors.background};
  overflow-x: auto;
  @media (max-width: 700px) {
    padding-top: 0;
    margin: 24px 16px;
  }
`;

const routeTitles: Record<string, string> = {
  '/dashboard/superadmin/dashboard': 'Super Admin Dashboard',
  '/dashboard/superadmin/berichte': 'Berichte & Auswertungen',
  '/dashboard/superadmin/statistiken': 'Plattformweite Statistiken',
  '/dashboard/superadmin/eltern': 'Eltern-Übersicht',
  '/dashboard/superadmin/erzieher': 'Erzieher-Übersicht',
  '/dashboard/superadmin/institutionen': 'Institutionen-Übersicht (Admins)',
  '/dashboard/admin/dashboard': 'Admin Dashboard',
  '/dashboard/admin/statistiken': 'Check-in/out Statistiken',
  '/dashboard/admin/kinder': 'Kinderverwaltung',
  '/dashboard/admin/gruppen': 'Gruppenverwaltung',
  '/dashboard/admin/personal': 'Personalverwaltung',
  '/dashboard/admin/benachrichtigungen': 'Benachrichtigungen',
  '/dashboard/admin/monatsbericht': 'Monatsbericht',
  '/dashboard/admin/tagesbericht': 'Tagesbericht',
  '/dashboard/admin/berichte': 'Berichte',
  '/dashboard/educator/dashboard': 'Mein Tag',
  '/dashboard/educator/notizen': 'Tagesnotizen',
  '/dashboard/educator/chat': 'Chat',
  '/dashboard/educator/kinder': 'Kinder',
  '/dashboard/educator/meine-gruppe': 'Meine Gruppe',
};

function getTitle(pathname: string, role: string) {
  // Normalize path to lowercase and remove trailing slash
  const path = pathname.toLowerCase().replace(/\/$/, '');
  // Try exact match
  if (routeTitles[path]) return routeTitles[path];
  // No fallback to role name, just return empty string
  return '';
}

const AppRoutes: React.FC = () => {
  const { benutzer, loading } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Redirect dashboard paths to appropriate dashboard - must be before any conditional returns
  React.useEffect(() => {
    if (!loading && benutzer && benutzer.role && location.pathname === '/dashboard') {
      const role = benutzer.role.toUpperCase();
      if (role === 'SUPER_ADMIN') {
        navigate('/dashboard/superadmin/dashboard', { replace: true });
      } else if (role === 'ADMIN') {
        navigate('/dashboard/admin/dashboard', { replace: true });
      } else if (role === 'EDUCATOR') {
        navigate('/dashboard/educator/dashboard', { replace: true });
      }
    }
  }, [location.pathname, benutzer, loading, navigate]);
  
  if (loading) return <div>Lädt...</div>;
  if (!benutzer || !benutzer.role) return <Navigate to="/login" replace />;
  
  const role = benutzer.role.toUpperCase();
  const title = getTitle(location.pathname, role);
  
  return (
    <Layout>
      <Sidebar />
      <MainContentWrapper>
        {title && <Header title={title} />}
        <Main>
          <Routes>
            {role === 'SUPER_ADMIN' && <Route path="/superadmin/*" element={<SuperAdminRoutes />} />}
            {role === 'ADMIN' && <Route path="/admin/*" element={<AdminRoutes />} />}
            {role === 'EDUCATOR' && <Route path="/educator/*" element={<EducatorRoutes />} />}
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Main>
      </MainContentWrapper>
    </Layout>
  );
};

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <GlobalStyle />
      <Router>
        <UserContextProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/dashboard/*" element={<AppRoutes />} />
          </Routes>
        </UserContextProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App; 