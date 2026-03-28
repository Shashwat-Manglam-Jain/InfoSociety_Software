"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AppLocale, TranslationKey } from "./translations";
import { defaultLocale, localeOptions, translate } from "./translations";

const STORAGE_KEY = "infopath.locale.v1";

type LanguageContextValue = {
  locale: AppLocale;
  localeOptions: typeof localeOptions;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function parseLocale(value: string | null): AppLocale | null {
  if (value && localeOptions.some((option) => option.code === value)) {
    return value as AppLocale;
  }

  return null;
}

function resolveBrowserLocale(): AppLocale {
  if (typeof window === "undefined") return defaultLocale;

  const browser = window.navigator.language?.toLowerCase() ?? "";
  if (browser.startsWith("hi")) return "hi";
  if (browser.startsWith("mr")) return "mr";

  return defaultLocale;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(defaultLocale);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let preferred = defaultLocale;

    try {
      preferred = parseLocale(window.localStorage.getItem(STORAGE_KEY)) ?? resolveBrowserLocale();
    } catch {
      preferred = resolveBrowserLocale();
    }

    setLocaleState((current) => (current === preferred ? current : preferred));
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore storage write failures (private mode, quota, etc.)
      }
    }
  }, []);

  const t = useMemo(() => {
    return (key: TranslationKey, vars?: Record<string, string | number>) => translate(locale, key, vars);
  }, [locale]);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        localeOptions,
        setLocale,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return ctx;
}
