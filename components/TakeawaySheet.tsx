"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { dishPhoto, minskNow, todayHallHours } from "@/lib/content";
import { isHoneypot, sanitizePhoneInput, validateCommentField, validateTakeawayName, validatePhone } from "@/lib/commentModeration";
import { dishName, fieldMessage, useCopy } from "@/lib/i18n";
import { useLocale } from "@/lib/locale";
import { navHref } from "@/lib/paths";
import { isStaticHost } from "@/lib/staticHost";
import { POLICY_REVISION } from "@/lib/legal";
import { track } from "./booking";
import { Price } from "./BynSign";
import { CallButton } from "./CallButton";
import { ConsentFields } from "./ConsentFields";
import { useCart } from "./cart";
import { Photo } from "./Photo";
import { SheetShell } from "./SheetShell";
import { TimeField } from "./TimeField";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function pickupBounds() {
  const hours = todayHallHours();
  const now = minskNow();
  const open = timeToMinutes(hours.open);
  const closeRaw = timeToMinutes(hours.close);
  const close = hours.close === "00:00" ? 24 * 60 : closeRaw;
  const current = now.getHours() * 60 + now.getMinutes();
  const min = Math.max(open, current);
  return {
    open: hours.open,
    close: hours.close === "00:00" ? "23:59" : hours.close,
    minTime: `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`,
    closed: current >= close,
  };
}

export function TakeawaySheet() {
  const { items, remove, clear, sumLabel, checkoutOpen, setCheckoutOpen, setPanelOpen } = useCart();
  const t = useCopy();
  const { locale } = useLocale();
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(checkoutOpen);
  const [visible, setVisible] = useState(false);
  const [consentPd, setConsentPd] = useState(false);
  const [consentTg, setConsentTg] = useState(false);
  const bounds = useMemo(() => pickupBounds(), [checkoutOpen]);

  useEffect(() => {
    if (checkoutOpen) {
      setSent(false);
      setError("");
      setConsentPd(false);
      setConsentTg(false);
      setMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), 360);
    return () => window.clearTimeout(timer);
  }, [checkoutOpen]);

  useEffect(() => {
    if (!checkoutOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [checkoutOpen]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (items.length === 0) {
      setError(t.emptyCart);
      return;
    }
    const data = new FormData(event.currentTarget);
    if (isHoneypot(data.get("website"))) {
      setSent(true);
      return;
    }
    const nameError = validateTakeawayName(String(data.get("guestName") ?? ""));
    if (nameError) {
      setError(fieldMessage(nameError, t, t.sendFailTakeaway));
      return;
    }
    const phoneError = validatePhone(String(data.get("phone") ?? ""));
    if (phoneError) {
      setError(fieldMessage(phoneError, t, t.sendFailTakeaway));
      return;
    }
    const commentError = validateCommentField(String(data.get("comment") ?? ""));
    if (commentError) {
      setError(fieldMessage(commentError, t, t.sendFailTakeaway));
      return;
    }
    if (!consentPd || !consentTg) {
      setError(t.consentNeed);
      return;
    }
    const payload = {
      name: String(data.get("guestName") ?? "").trim(),
      phone: data.get("phone"),
      time: data.get("time"),
      persons: data.get("persons"),
      comment: data.get("comment"),
      website: data.get("website"),
      items,
      sum: sumLabel,
      consentPd: true,
      consentTg: true,
      policyRevision: POLICY_REVISION,
    };
    if (isStaticHost) {
      setError(t.sendFailTakeaway);
      return;
    }
    try {
      const res = await fetch("/api/takeaway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(fieldMessage(json.error, t, t.sendFailTakeaway));
        return;
      }
      track("takeaway_submit");
      setSent(true);
      clear();
    } catch {
      setError(t.sendFailTakeaway);
    }
  }

  if (!mounted) return null;

  return (
    <SheetShell
      visible={visible}
      onClose={() => setCheckoutOpen(false)}
      fitKey={`${sent ? "sent" : "form"}-${items.length}`}
    >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-serif text-2xl">{t.takeawayTitle}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {t.takeawayHint}
            </p>
          </div>
          <button type="button" className="text-sm text-ink-soft" onClick={() => setCheckoutOpen(false)}>
            {t.close}
          </button>
        </div>

        {sent ? (
          <p>{t.takeawaySent}</p>
        ) : (
          <form className="grid min-w-0 gap-3" onSubmit={onSubmit}>
            <div className="grid grid-cols-4 gap-x-2 gap-y-3">
              {items.map((item) => {
                const name = dishName(item.id, item.name, locale, item.nameEn);
                return (
                <div key={item.id} className="min-w-0">
                  <div className="relative aspect-square overflow-hidden rounded-xl">
                    <Photo
                      src={dishPhoto(item)}
                      alt={`${name}${t.dishAltSuffix}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <button
                      type="button"
                      aria-label={`${t.removeDish} ${name}`}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[0.7rem] leading-none text-paper"
                      onClick={() => remove(item.id)}
                    >
                      ×
                    </button>
                    {item.qty > 1 ? (
                      <span className="absolute bottom-1 left-1 rounded bg-ink/80 px-1 text-[0.65rem] text-paper">
                        ×{item.qty}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-center text-[0.7rem] font-medium leading-tight">
                    {name}
                  </p>
                </div>
                );
              })}
              <button
                type="button"
                aria-label={t.addMore}
                className="flex aspect-square items-center justify-center self-start rounded-xl border border-ink/15 bg-ink/[0.06] text-2xl text-ink"
                onClick={() => {
                  setCheckoutOpen(false);
                  setPanelOpen(false);
                  router.push(navHref("/menu"));
                }}
              >
                +
              </button>
            </div>

            <p className="text-sm">
              {t.sum} <Price value={sumLabel} />
            </p>

            {bounds.closed ? (
              <p className="text-sm">{t.kitchenClosed}</p>
            ) : (
              <>
                <label className="grid gap-1 text-sm">
                  {t.name}
                  <input
                    required
                    name="guestName"
                    autoComplete="given-name"
                    maxLength={40}
                    pattern="\S+"
                    title={t.nameOneWordTitle}
                    className="w-full min-w-0 max-w-full rounded-xl border border-line bg-paper px-3 py-2"
                    onInput={(event) => {
                      event.currentTarget.value = event.currentTarget.value.replace(/\s+/g, "");
                    }}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  {t.phone}
                  <input
                    required
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    maxLength={13}
                    pattern="\+?\d+"
                    title={t.phoneTitle}
                    placeholder="+375290000000"
                    className="w-full min-w-0 max-w-full rounded-xl border border-line bg-paper px-3 py-2"
                    onInput={(event) => {
                      event.currentTarget.value = sanitizePhoneInput(event.currentTarget.value);
                    }}
                  />
                </label>
                <div className="grid min-w-0 grid-cols-2 gap-3">
                  <label className="grid min-w-0 gap-1 text-sm">
                    {t.timeToday}
                    <TimeField name="time" min={bounds.minTime} max={bounds.close} defaultValue={bounds.minTime} />
                  </label>
                  <label className="grid min-w-0 gap-1 text-sm">
                    {t.persons}
                    <input
                      required
                      name="persons"
                      type="number"
                      min={1}
                      max={20}
                      defaultValue={1}
                      className="persons-stepper w-full min-w-0 max-w-full rounded-xl border border-line bg-paper px-3 py-2"
                    />
                  </label>
                </div>
                <label className="grid gap-1 text-sm">
                  {t.comment}
                  <textarea name="comment" rows={2} maxLength={500} className="w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-2" />
                </label>
                <label className="sr-only" aria-hidden="true">
                  {t.website}
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
                <p className="text-xs text-ink-soft">
                  {t.pickupLine(t.addressFull, bounds.open, todayHallHours().close)}
                </p>
                {error ? <p className="text-sm">{error}</p> : null}
                {isStaticHost ? null : (
                  <ConsentFields
                    purpose="takeaway"
                    pd={consentPd}
                    tg={consentTg}
                    onPd={setConsentPd}
                    onTg={setConsentTg}
                  />
                )}
                <CallButton />
                {isStaticHost ? null : (
                  <button type="submit" disabled={items.length === 0 || !consentPd || !consentTg} className="rounded-full bg-ink py-3 text-paper disabled:opacity-40">
                    {t.send}
                  </button>
                )}
              </>
            )}
          </form>
        )}
    </SheetShell>
  );
}
