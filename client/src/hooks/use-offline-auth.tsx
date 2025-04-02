import { useContext, createContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  saveAuthData,
  getAuthData,
  clearAuthData,
  isOnline
} from '@/lib/offline-storage';

interface OfflineAuthContextType {
  offlineMode: boolean;
  cachedUser: any | null;
  isLoading: boolean;
  persistUserForOffline: () => Promise<void>;
  clearOfflineUser: () => Promise<void>;
}

export const OfflineAuthContext = createContext<OfflineAuthContextType | null>(null);

export function OfflineAuthProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
  const [cachedUser, setCachedUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load cached user data on mount
  useEffect(() => {
    const loadCachedUser = async () => {
      try {
        const cached = await getAuthData();
        setCachedUser(cached);
      } catch (error) {
        console.error('Error loading cached user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCachedUser();
  }, []);

  // Update offline status when network status changes
  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-persist user data when user logs in
  useEffect(() => {
    if (user && isOnline()) {
      persistUserForOffline();
    }
  }, [user]);

  // Persist current user data for offline use
  const persistUserForOffline = async (): Promise<void> => {
    if (!user) return;
    
    try {
      // We don't store the full user object to avoid security issues
      // Only store the essential data needed for the UI when offline
      const userToCache = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage,
        isOffline: true,
        cachedAt: new Date().toISOString(),
      };
      
      await saveAuthData(userToCache);
      setCachedUser(userToCache);
    } catch (error) {
      console.error('Failed to persist user data for offline use:', error);
    }
  };

  // Clear cached user data
  const clearOfflineUser = async (): Promise<void> => {
    try {
      await clearAuthData();
      setCachedUser(null);
    } catch (error) {
      console.error('Failed to clear offline user data:', error);
    }
  };

  return (
    <OfflineAuthContext.Provider
      value={{
        offlineMode,
        cachedUser,
        isLoading,
        persistUserForOffline,
        clearOfflineUser,
      }}
    >
      {children}
    </OfflineAuthContext.Provider>
  );
}

export function useOfflineAuth() {
  const context = useContext(OfflineAuthContext);
  if (!context) {
    throw new Error('useOfflineAuth must be used within an OfflineAuthProvider');
  }
  return context;
}