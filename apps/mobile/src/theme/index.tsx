import React, { createContext, useContext } from 'react';
import { lightTheme, darkTheme, Theme } from './tokens';
import { useThemeStore } from '../stores/themeStore';

const ThemeContext = createContext<Theme>(lightTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useThemeStore((state) => state.theme);
  const themeConfig = theme === 'dark' ? darkTheme : lightTheme;

  return <ThemeContext.Provider value={themeConfig}>{children}</ThemeContext.Provider>;
};
