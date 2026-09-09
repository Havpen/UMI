"use client";

import Link from "next/link";
import { useCopy } from "@/lib/i18n";
import { navHref } from "@/lib/paths";

export function ConsentFields({
  purpose,
  pd,
  tg,
  onPd,
  onTg,
}: {
  purpose: "booking" | "takeaway";
  pd: boolean;
  tg: boolean;
  onPd: (next: boolean) => void;
  onTg: (next: boolean) => void;
}) {
  const t = useCopy();
  const box = "mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-[var(--color-ink)]";
  const label = "flex items-start gap-2.5 text-left text-xs leading-snug text-ink-soft";
  const policy = (
    <Link href={navHref("/privacy")} className="underline decoration-ink/25 underline-offset-[0.35em]">
      {t.privacyLinkShort}
    </Link>
  );
  const risks = (
    <Link href={navHref("/privacy#telegram")} className="underline decoration-ink/25 underline-offset-[0.35em]">
      {t.privacyLinkShort}
    </Link>
  );

  return (
    <div className="grid gap-3">
      <label className={label}>
        <input type="checkbox" className={box} checked={pd} onChange={(event) => onPd(event.target.checked)} />
        <span>
          {purpose === "booking" ? t.consentPdBooking : t.consentPdTakeaway} {policy}.
        </span>
      </label>
      <label className={label}>
        <input type="checkbox" className={box} checked={tg} onChange={(event) => onTg(event.target.checked)} />
        <span>
          {t.consentTelegramBefore} {risks}. {t.consentTelegramAfter}
        </span>
      </label>
    </div>
  );
}
