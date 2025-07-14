import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import MascotBear from './ui/MascotBear';
import { fetchProfile } from '../services/profileApi';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDUCATOR' | 'PARENT' | string;
  avatarUrl?: string | null;
  [key: string]: any;
}

interface UserContextType {
  benutzer: User | null;
  setBenutzer: (user: User | null) => void;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserContextProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  disableAutoFetch?: boolean;
}

export const UserContextProvider = ({ children, initialUser = null, disableAutoFetch = false }: UserContextProviderProps) => {
  const [benutzer, setBenutzer] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser); // Set loading to false if initialUser is provided
  const [sessionExpired, setSessionExpired] = useState(false);
  const location = useLocation();
  const didAutoFetch = useRef(false);
  const modalId = useRef(`session-modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const refreshProfile = async () => {
    if (location.pathname === '/login') {
      setLoading(false);
      return;
    }
    try {
      const profile = await fetchProfile();
      setBenutzer(profile);
    } catch (error: any) {
      setBenutzer(null);
      if (error?.response?.status === 401) {
        setSessionExpired(true);
      }
    }
  };

  const logout = () => {
    setBenutzer(null);
    setLoading(false);
  };

  useEffect(() => {
    if (!disableAutoFetch && !benutzer && loading && !didAutoFetch.current) {
      didAutoFetch.current = true;
      setLoading(true);
      refreshProfile().finally(() => setLoading(false));
    }
  }, [benutzer, loading, location.pathname, disableAutoFetch]);

  return (
    <UserContext.Provider value={{ benutzer, setBenutzer, loading, refreshProfile, logout }}>
      {children}
      {sessionExpired && (
        <div 
          key={modalId.current}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}
          data-testid="session-expired-modal"
        >
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32, textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,0.12)'
          }}>
            <MascotBear size={80} mood="sad" />
            <h2>Sitzung abgelaufen</h2>
            <p data-testid="session-expired-message">Bitte melde dich erneut an. Deine Sitzung ist abgelaufen.</p>
            <button 
              onClick={() => { setSessionExpired(false); window.location.href = '/login'; }}
              style={{
                marginTop: 16, padding: '10px 24px', borderRadius: 8, background: '#4CAF50', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer'
              }}
              data-testid="session-expired-login-button"
            >
              Zur Anmeldung
            </button>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (ctx === undefined) {
    throw new Error('useUser must be used within a UserContextProvider');
  }
  return ctx;
}; 