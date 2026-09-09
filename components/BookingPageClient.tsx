"use client";

import { useEffect } from "react";
import { useCopy, useHours } from "@/lib/i18n";
import { track, useBooking } from "./booking";

export function BookingPageClient() {
  const { setOpen } = useBooking();
  const t = useCopy();
  const hallHours = useHours();

  useEffect(() => {
    track("booking_open");
    setOpen(true);
  }, [setOpen]);

  return (
    <main className="relative page-shell pb-20 pt-28 text-center">
      <h1 className="font-serif text-4xl md:text-5xl">{t.bookingTitle}</h1>
      <p className="mt-4 text-lg">{t.bookingLead}</p>
      <p className="mt-2 text-ink-soft">
        {t.hoursLine(
          t.addressFull,
          hallHours.map((row) => `${row.days} ${row.open}–${row.close}`).join(", "),
        )}
      </p>
      <button
        type="button"
        className="mt-8 rounded-full bg-ink px-5 py-3 text-paper"
        onClick={() => {
          track("booking_open");
          setOpen(true);
        }}
      >
        {t.openRequest}
      </button>
    </main>
  );
}
