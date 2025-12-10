'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale } from '@/i18n/config';

import enCommon from '@/locales/en/common.json';
import arCommon from '@/locales/ar/common.json';
import enDashboard from '@/locales/en/dashboard.json';
import arDashboard from '@/locales/ar/dashboard.json';
import enReports from '@/locales/en/reports.json';
import arReports from '@/locales/ar/reports.json';
import enUsers from '@/locales/en/users.json';
import arUsers from '@/locales/ar/users.json';

type Messages = typeof enCommon & typeof enDashboard & typeof enReports & typeof enUsers;

const messages: Record<Locale, Messages> = {
  en: { ...enCommon, ...enDashboard, ...enReports, ...enUsers } as Messages,
  ar: { ...arCommon, ...arDashboard, ...arReports, ...arUsers } as Messages,
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  messages: Messages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'ar')) {
      setLocaleState(savedLocale);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Update document direction and lang attribute
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
      // Save to localStorage
      localStorage.setItem('locale', locale);
    }
  }, [locale, mounted]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = messages[locale];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider 
      value={{ 
        locale, 
        setLocale, 
        t,
        messages: messages[locale]
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
