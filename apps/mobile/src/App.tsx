import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState } from 'react-native';
import { AppNavigator } from './navigation/AppNavigator';
import { ThemeProvider } from './theme/index';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { useOnboardingStore } from './stores/onboardingStore';

export default function App() {
  const loadSession = useAuthStore((state) => state.loadSession);
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);
  const loadTheme = useThemeStore((state) => state.loadTheme);
  const loadDraft = useOnboardingStore((state) => state.loadDraft);
  const theme = useThemeStore((state) => state.theme);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Load persisted data on app start
    loadTheme();
    loadSession();
    loadDraft();

    // Check session expiry on app state change
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        session
      ) {
        // Check if session is expired
        const expiresAt = new Date(session.expiresAt);
        const now = new Date();
        
        if (expiresAt < now) {
          // Session expired, logout user
          logout();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [session]);

  return (
    <ThemeProvider>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </ThemeProvider>
  );
}
