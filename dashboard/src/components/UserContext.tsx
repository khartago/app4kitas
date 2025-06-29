import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
}

const UserContext = createContext<UserContextType>({
  benutzer: null,
  setBenutzer: () => {},
  loading: true,
  refreshProfile: async () => {},
});

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [benutzer, setBenutzer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const refreshProfile = async () => {
    try {
      const profile = await fetchProfile();
      setBenutzer(profile);
    } catch {
      setBenutzer(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    refreshProfile().finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ benutzer, setBenutzer, loading, refreshProfile }}>
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