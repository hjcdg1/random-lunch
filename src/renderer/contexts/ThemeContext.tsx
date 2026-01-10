import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ThemeMode } from '../../shared/types';

interface ThemeContextType {
  theme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme preference from settings
    window.electron
      .loadSettings()
      .then(settings => {
        setThemeState(settings.theme);
      })
      .catch(error => {
        console.error('Failed to load theme settings:', error);
      });

    // Get current system theme
    window.electron
      .getSystemTheme()
      .then(theme => {
        setSystemTheme(theme);
      })
      .catch(error => {
        console.error('Failed to get system theme:', error);
      });

    // Listen for system theme changes
    window.electron.onSystemThemeChange(theme => {
      console.log('System theme changed to:', theme);
      setSystemTheme(theme);
    });
  }, []);

  // Calculate effective theme
  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(effectiveTheme);
    console.log('Applied theme:', effectiveTheme);
  }, [effectiveTheme]);

  const setTheme = async (newTheme: ThemeMode) => {
    console.log('Setting theme to:', newTheme);
    setThemeState(newTheme);
    try {
      await window.electron.saveSettings({ theme: newTheme });
    } catch (error) {
      console.error('Failed to save theme setting:', error);
    }
  };

  const value: ThemeContextType = {
    theme,
    effectiveTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
