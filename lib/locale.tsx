"use client";

import { createContext, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "ru" | "en";

const STORAGE_KEY = "umi_lang";
const COOKIE = "umi_lang";

function readLocale(): Locale {
  if (typeof document === "undefined") return "ru";
  const cookie = document.cookie.match(/(?:^|; )umi_lang=([^;]*)/);
  const fromCookie = cookie?.[1];
  if (fromCookie === "en" || fromCookie === "ru") return fromCookie;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ru") return stored;
  } catch {
    /* ignore */
  }
  return "ru";
}

function writeLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  document.cookie = `${COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
  document.documentElement.lang = locale === "en" ? "en" : "ru";
}

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (next: Locale) => void;
} | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru");

  useLayoutEffect(() => {
    const next = readLocale();
    setLocaleState(next);
    document.documentElement.lang = next === "en" ? "en" : "ru";
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (next: Locale) => {
        setLocaleState(next);
        writeLocale(next);
      },
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
