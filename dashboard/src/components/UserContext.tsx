import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

const UserContext = createContext<UserContextType>({
  benutzer: null,
  setBenutzer: () => {},
  loading: true,
  refreshProfile: async () => {},
  logout: () => {},
});

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [benutzer, setBenutzer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const location = useLocation();

  const refreshProfile = async () => {
    // Don't fetch profile if we're on the login page
    if (location.pathname === '/login') {
      setLoading(false);
      return;
    }
    
    try {
      const profile = await fetchProfile();
      setBenutzer(profile);
    } catch (error: any) {
      setBenutzer(null);
      // If we get a 401 or similar, the session is invalid
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
    // Only fetch profile if no user is set and not on login page
    if (!benutzer && loading) {
      setLoading(true);
      refreshProfile().finally(() => setLoading(false));
    }
  }, [benutzer, loading, location.pathname]);

  return (
    <UserContext.Provider value={{ benutzer, setBenutzer, loading, refreshProfile, logout }}>
      {children}
      {sessionExpired && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32, textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,0.12)'
          }}>
            <MascotBear size={80} mood="sad" />
            <h2>Sitzung abgelaufen</h2>
            <p>Bitte melde dich erneut an.<br />Deine Sitzung ist abgelaufen.</p>
            <button onClick={() => { setSessionExpired(false); window.location.href = '/login'; }}
              style={{
                marginTop: 16, padding: '10px 24px', borderRadius: 8, background: '#4CAF50', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer'
              }}>
              Zur Anmeldung
            </button>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 