import type { Language } from '../hooks/useLanguage';

export function pickLanguage<T>(language: Language, values: { en: T; ro: T }): T {
  return language === 'ro' ? values.ro : values.en;
}
