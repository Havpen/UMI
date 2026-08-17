"use client";

import { useEffect } from "react";
import { track, useBooking } from "./booking";

export function BookingPageClient() {
  const { setOpen } = useBooking();

  useEffect(() => {
    track("booking_open");
    setOpen(true);
  }, [setOpen]);

  return (
    <button
      type="button"
      className="mt-8 rounded-full bg-ink px-5 py-3 text-paper"
      onClick={() => {
        track("booking_open");
        setOpen(true);
      }}
    >
      Открыть заявку
    </button>
  );
}
