import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export const THEME_STORAGE_KEY = 'rbb_theme_preference';

/**
 * Valid theme preferences:
 * - 'light': Royal Heritage Light Mode (Recommended default for RBB)
 * - 'dark': Royal Heritage Dark Mode
 */
function getStoredThemePreference() {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark') {
      return 'dark';
    }
  } catch {
    // Ignore localStorage access errors in restricted frames
  }
  return 'light';
}

function applyThemeClass(resolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

export function ThemeProvider({ children }) {
  const [themePreference, setThemePreferenceState] = useState(getStoredThemePreference);

  const resolvedTheme = themePreference === 'dark' ? 'dark' : 'light';

  // Sync `.dark` class on <html> immediately when resolvedTheme changes
  useEffect(() => {
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  const setThemePreference = useCallback((nextPref) => {
    const valid = nextPref === 'dark' ? 'dark' : 'light';
    setThemePreferenceState(valid);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, valid);
    } catch {
      // Ignore storage failures
    }
    applyThemeClass(valid);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemePreferenceState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore storage failures
      }
      applyThemeClass(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themePreference: resolvedTheme,
        resolvedTheme,
        isDark: resolvedTheme === 'dark',
        setThemePreference,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      themePreference: 'light',
      resolvedTheme: 'light',
      isDark: false,
      setThemePreference: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
