"use client";

import { useCopy } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.2rem] w-[1.2rem]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <circle cx="12" cy="12" r="3.6" />
      <path
        d="M12 3.2v1.6M12 19.2v1.6M4.9 4.9l1.1 1.1M18 18l1.1 1.1M3.2 12h1.6M19.2 12h1.6M4.9 19.1l1.1-1.1M18 6l1.1-1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.2rem] w-[1.2rem]" fill="currentColor" aria-hidden>
      <path d="M14.8 3.2a8.7 8.7 0 1 0 6 15.3 8.6 8.6 0 0 1-6-15.3Z" />
    </svg>
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const t = useCopy();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink ${className}`}
      aria-label={dark ? t.themeLight : t.themeDark}
      aria-pressed={dark}
      suppressHydrationWarning
      onClick={toggleTheme}
    >
      {dark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
