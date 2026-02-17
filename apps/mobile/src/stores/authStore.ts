import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api/client';
import { User, Session } from '../types';

type AuthStatus = 'logged_out' | 'logging_in' | 'logged_in' | 'refreshing' | 'expired';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  refresh: () => Promise<Session>;
  logout: () => void;
  loadSession: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'logged_out',
  user: null,
  session: null,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ status: 'logging_in', error: null });
      
      const response = await apiClient.post('/v1/auth/login', { email, password });
      const { user, session } = response.data;

      set({
        status: 'logged_in',
        user,
        session,
        error: null,
      });

      // Persist session (optional for M1, but good to have)
      await AsyncStorage.setItem('@session', JSON.stringify(session));
      await AsyncStorage.setItem('@user', JSON.stringify(user));
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Login failed';
      set({ status: 'logged_out', error: errorMessage, user: null, session: null });
      throw error;
    }
  },

  refresh: async () => {
    try {
      set({ status: 'refreshing' });
      
      const currentSession = get().session;
      if (!currentSession?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/v1/auth/refresh', { 
        refreshToken: currentSession.refreshToken 
      });
      const { session } = response.data;

      set({
        status: 'logged_in',
        session,
        error: null,
      });

      // Persist new session
      await AsyncStorage.setItem('@session', JSON.stringify(session));
      
      return session;
    } catch (error: any) {
      // Refresh failed, logout user
      await get().logout();
      throw error;
    }
  },

  logout: async () => {
    set({ status: 'logged_out', user: null, session: null, error: null });
    
    // Clear persisted data
    await AsyncStorage.removeItem('@session');
    await AsyncStorage.removeItem('@user');
  },

  loadSession: async () => {
    try {
      const sessionData = await AsyncStorage.getItem('@session');
      const userData = await AsyncStorage.getItem('@user');

      if (sessionData && userData) {
        const session = JSON.parse(sessionData);
        const user = JSON.parse(userData);

        // Check if session is expired
        const expiresAt = new Date(session.expiresAt);
        if (expiresAt > new Date()) {
          set({ status: 'logged_in', user, session });
        } else {
          set({ status: 'expired' });
          await get().logout();
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
