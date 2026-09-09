"use client";

import Link from "next/link";
import { AggregatorLinks } from "@/components/AggregatorLinks";
import { useCopy } from "@/lib/i18n";
import { navHref } from "@/lib/paths";

export function DeliveryPageClient() {
  const t = useCopy();
  return (
    <main className="relative page-shell pb-20 pt-28 text-center">
      <h1 className="font-serif text-4xl md:text-5xl">{t.deliveryTitle}</h1>
      <p className="mx-auto mt-6 max-w-3xl text-lg">{t.deliveryLead}</p>
      <div className="mt-8 rounded-3xl bg-paper-2 px-5 py-6">
        <p>{t.deliveryHeading}</p>
        <AggregatorLinks />
      </div>
      <Link href={navHref("/menu")} className="mt-8 inline-block rounded-full bg-ink px-5 py-3 text-paper">
        {t.collectTakeaway}
      </Link>
    </main>
  );
}
