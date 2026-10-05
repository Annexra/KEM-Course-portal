'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'kem-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('light');
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () => setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    const timeout = window.setTimeout(updateSystemTheme, 0);
    mediaQuery.addEventListener('change', updateSystemTheme);

    return () => {
      window.clearTimeout(timeout);
      mediaQuery.removeEventListener('change', updateSystemTheme);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    const initialTheme = savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system'
      ? savedTheme
      : defaultTheme;
    const timeout = window.setTimeout(() => {
      setThemeState(initialTheme);
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;

    localStorage.setItem(storageKey, theme);
  }, [theme, resolvedTheme, mounted, storageKey]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((previous) => (previous === 'system' ? systemTheme : previous) === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
