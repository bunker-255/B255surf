import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const LANG_KEY = 'app_language';

function getBrowserLanguage(): Language {
  const navLang = navigator.language.toLowerCase();
  if (navLang.startsWith('ru')) return 'ru';
  if (navLang.startsWith('he')) return 'he';
  return 'en';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_KEY) as Language;
    return saved || getBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[lang][key] || translations['en'][key];
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
