"use client";

import { FormEvent, useEffect, useState } from "react";
import { hours, site } from "@/lib/content";
import { isHoneypot, sanitizePhoneInput, validateCommentField, validateGuestName, validatePhone } from "@/lib/commentModeration";
import { track, useBooking } from "./booking";
import { CallButton } from "./CallButton";
import { SheetShell } from "./SheetShell";
import { TimeField } from "./TimeField";

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
    if (isHoneypot(data.get("website"))) {
      setSent(true);
      return;
    }
    const nameError = validateGuestName(String(data.get("name") ?? ""));
    if (nameError) {
      setError(nameError);
      return;
    }
    const phoneError = validatePhone(String(data.get("phone") ?? ""));
    if (phoneError) {
      setError(phoneError);
      return;
    }
    const commentError = validateCommentField(String(data.get("comment") ?? ""));
    if (commentError) {
      setError(commentError);
      return;
    }
    const payload = Object.fromEntries(data.entries());
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error || "Не удалось отправить заявку. Позвоните нам — подтвердим стол по телефону.");
        return;
      }
      track("booking_submit");
      setSent(true);
    } catch {
      setError("Не удалось отправить заявку. Позвоните нам — подтвердим стол по телефону.");
    }
  }

  if (!mounted) return null;

  return (
    <SheetShell visible={visible} onClose={() => setOpen(false)} fitKey={sent ? "sent" : "form"}>
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
                maxLength={13}
                pattern="\+?\d+"
                title="Только цифры, «+» только в начале, до 13 символов"
                placeholder="+375290000000"
                className="rounded-xl border border-line bg-paper px-3 py-2"
                onInput={(event) => {
                  event.currentTarget.value = sanitizePhoneInput(event.currentTarget.value);
                }}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid min-w-0 gap-1 text-sm">
                Дата
                <input
                  required
                  name="date"
                  type="date"
                  lang="ru"
                  min={todayISO()}
                  className="w-full min-w-0 max-w-full rounded-xl border border-line bg-paper px-3 py-2"
                />
              </label>
              <label className="grid min-w-0 gap-1 text-sm">
                Время
                <TimeField name="time" min="11:00" max="23:45" />
              </label>
            </div>
            <label className="grid gap-1 text-sm">
              Гостей
              <input required name="guests" type="number" min={1} defaultValue={2} className="rounded-xl border border-line bg-paper px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm">
              Комментарий
              <textarea name="comment" rows={2} maxLength={500} className="rounded-xl border border-line bg-paper px-3 py-2" />
            </label>
            <label className="sr-only" aria-hidden="true">
              Сайт
              <input name="website" tabIndex={-1} autoComplete="off" />
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
    </SheetShell>
  );
}
