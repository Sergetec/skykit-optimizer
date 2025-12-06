import { useCallback, useEffect, useState } from 'react';

export type Language = 'en' | 'ro';

const STORAGE_KEY = 'skykit-language';

const getPreferredLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'ro') {
    return stored;
  }

  return 'en';
};

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(getPreferredLanguage);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'en' ? 'ro' : 'en'));
  }, []);

  return { language, setLanguage, toggleLanguage };
}

export default useLanguage;
