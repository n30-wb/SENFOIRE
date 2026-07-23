import { createContext, useContext, useState, useCallback } from 'react';
import fr from '../locales/fr';
import wo from '../locales/wo';
import en from '../locales/en';

const locales = { fr, wo, en };
const LANG_KEY = 'senfoire_lang';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem(LANG_KEY) || 'fr';
  });

  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = locales[lang];
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
    }
    return value;
  }, [lang]);

  const changeLang = useCallback((newLang) => {
    if (locales[newLang]) {
      setLang(newLang);
      localStorage.setItem(LANG_KEY, newLang);
    }
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t, changeLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
