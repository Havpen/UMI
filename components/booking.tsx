"use client";

import { createContext, useContext, useMemo, useState } from "react";

type BookingContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}

export function track(event: string, params?: Record<string, string>) {
  if (typeof window === "undefined") return;
  const payload = { event, ...params };
  const w = window as Window & {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  };
  w.dataLayer?.push(payload);
  w.gtag?.("event", event, params);
}
