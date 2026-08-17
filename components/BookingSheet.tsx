"use client";

import { FormEvent, useEffect, useState } from "react";
import { hours, site } from "@/lib/content";
import { track, useBooking } from "./booking";
import { CallButton } from "./CallButton";

function todayISO() {
  const now = new Date();
  const minsk = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Minsk" }));
  const y = minsk.getFullYear();
  const m = String(minsk.getMonth() + 1).padStart(2, "0");
  const d = String(minsk.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function BookingSheet({ startOpen = false }: { startOpen?: boolean }) {
  const { open, setOpen } = useBooking();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (startOpen) {
      setOpen(true);
      track("booking_open");
    }
  }, [startOpen, setOpen]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), 360);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const payload = Object.fromEntries(data.entries());
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("fail");
      track("booking_submit");
      setSent(true);
    } catch {
      setError("Не удалось отправить заявку. Позвоните нам — подтвердим стол по телефону.");
    }
  }

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className={`booking-backdrop absolute inset-0 bg-[rgba(44,39,35,0.28)] ${visible ? "is-on" : ""}`}
        aria-label="Закрыть"
        onClick={() => setOpen(false)}
      />
      <div
        className={`glass booking-panel absolute left-1/2 top-1/2 max-h-[90vh] w-[min(26.5rem,calc(100%-1.5rem))] overflow-y-auto rounded-3xl p-5 ${
          visible ? "is-on" : ""
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-serif text-2xl">Забронировать стол</p>
            <p className="mt-1 text-sm text-ink-soft">Заявка не бронь. Подтвердим по телефону.</p>
          </div>
          <button type="button" className="text-sm text-ink-soft" onClick={() => setOpen(false)}>
            Закрыть
          </button>
        </div>

        {sent ? (
          <p>Заявку получили, подтвердим по телефону.</p>
        ) : (
          <form className="grid gap-3" onSubmit={onSubmit}>
            <label className="grid gap-1 text-sm">
              Имя
              <input required name="name" className="rounded-xl border border-line bg-paper px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm">
              Телефон
              <input
                required
                name="phone"
                type="tel"
                inputMode="tel"
                placeholder="+375 29 000-00-00"
                className="rounded-xl border border-line bg-paper px-3 py-2"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                Дата
                <input required name="date" type="date" min={todayISO()} className="rounded-xl border border-line bg-paper px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                Время
                <input required name="time" type="time" className="rounded-xl border border-line bg-paper px-3 py-2" />
              </label>
            </div>
            <label className="grid gap-1 text-sm">
              Гостей
              <input required name="guests" type="number" min={1} defaultValue={2} className="rounded-xl border border-line bg-paper px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm">
              Комментарий
              <textarea name="comment" rows={3} className="rounded-xl border border-line bg-paper px-3 py-2" />
            </label>
            <p className="text-xs text-ink-soft">
              {site.addressFull}.{" "}
              {hours.map((row) => `${row.days} ${row.open}–${row.close}`).join(", ")}.
            </p>
            {error ? <p className="text-sm">{error}</p> : null}
            <CallButton />
            <button type="submit" className="rounded-full bg-ink py-3 text-paper">
              Отправить заявку
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
