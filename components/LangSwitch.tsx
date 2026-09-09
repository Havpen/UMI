"use client";

import { useLocale } from "@/lib/locale";
import { useCopy } from "@/lib/i18n";

export function LangSwitch({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const t = useCopy();

  return (
    <div
      className={`flex items-center gap-1 text-[0.7rem] tracking-[0.14em] md:text-xs ${className}`}
      role="group"
      aria-label={t.language}
    >
      <button
        type="button"
        className={locale === "ru" ? "text-ink" : "text-ink-soft hover:text-ink"}
        aria-pressed={locale === "ru"}
        onClick={() => setLocale("ru")}
      >
        RU
      </button>
      <span className="text-ink-soft/40" aria-hidden>
        |
      </span>
      <button
        type="button"
        className={locale === "en" ? "text-ink" : "text-ink-soft hover:text-ink"}
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}
