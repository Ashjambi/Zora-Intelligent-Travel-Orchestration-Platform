
import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import { translations } from '../locales/translations';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: any }) => any;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getNestedTranslation = (data: any, language: string, key: string): any => {
  if (!data || !data[language]) return undefined;
  
  const keys = key.split('.');
  let result: any = data[language];
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return undefined;
    }
  }
  return result;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('zora_preferred_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'ar';
  });

  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.body.dir = dir;
    document.body.className = `lang-${language}`;
    localStorage.setItem('zora_preferred_lang', language);
  }, [language]);

  const t = useMemo(() => (key: string, options?: { [key: string]: any }): any => {
    // 1. محاولة جلب الترجمة باللغة الحالية
    let translation = getNestedTranslation(translations, language, key);

    // 2. إذا لم تكن موجودة، جرب الإنجليزية كـ Fallback
    if (translation === undefined && language !== 'en') {
        translation = getNestedTranslation(translations, 'en', key);
    }

    // إصلاح: معالجة استرجاع الكائنات (Arrays/Objects) قبل إرجاع المفتاح
    // هذا يمنع إرجاع "نص" عندما يتوقع المكون "مصفوفة" مما يسبب توقف التطبيق
    if (options?.returnObjects) {
      if (translation && typeof translation === 'object') {
        return translation;
      }
      return []; // إرجاع مصفوفة فارغة بدلاً من كائن فارغ أو نص
    }

    // 3. إذا فشل كل شيء، ارجع المفتاح نفسه
    if (translation === undefined) return key;

    // إذا لم يكن نصاً (مثلاً مسار لم يكتمل)، ارجع المفتاح
    if (typeof translation !== 'string') {
        return key;
    }

    // معالجة المتغيرات {count}, {name}, إلخ
    let result = translation;
    if (options) {
      Object.keys(options).forEach(placeholder => {
        if (placeholder !== 'returnObjects') {
          result = result.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(options[placeholder]));
        }
      });
    }

    return result;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
    dir: (language === 'ar' ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
