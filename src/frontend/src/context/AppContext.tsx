import { createContext, useContext, type ReactNode } from 'react';
import { useGameState, type UseGameStateResult } from '../hooks/useGameState';
import { useTheme, type Theme } from '../hooks/useTheme';
import { useLanguage, type Language } from '../hooks/useLanguage';
import { POLL_INTERVAL_IDLE } from '../constants/config';

interface AppContextValue {
  game: UseGameStateResult;
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const game = useGameState(POLL_INTERVAL_IDLE);
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  const value: AppContextValue = {
    game,
    theme,
    language,
    toggleTheme,
    toggleLanguage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Re-export types for convenience
export type { Theme } from '../hooks/useTheme';
export type { Language } from '../hooks/useLanguage';
export type { UseGameStateResult } from '../hooks/useGameState';
