"use client";

import Link from "next/link";
import { useCopy } from "@/lib/i18n";
import { navHref } from "@/lib/paths";
import { AggregatorLinks } from "./AggregatorLinks";
import { Photo } from "./Photo";

export function Aggregators() {
  const t = useCopy();
  return (
    <section className="pt-12">
      <div className="page-shell rounded-3xl bg-paper-2 px-5 py-10 text-center md:px-8">
        <h2 className="font-serif text-6xl">{t.aggregatorsTitle}</h2>
        <p className="mx-auto mt-2 max-w-xl text-ink-soft">{t.aggregatorsText}</p>
        <AggregatorLinks />
        <Link
          href={navHref("/menu")}
          className="hover-grow mt-8 inline-block rounded-full bg-ink px-5 py-3 text-paper"
        >
          {t.collectTakeaway}
        </Link>
      </div>
    </section>
  );
}

export function DayTiles() {
  const t = useCopy();
  return (
    <section className="pt-6 pb-8 md:pt-10 xl:pt-14">
      <div className="page-shell isolate grid gap-6 md:grid-cols-2 md:gap-10 xl:gap-14">
        <Link
          href="/lunch"
          className="hover-grow relative isolate overflow-hidden rounded-3xl"
        >
          <Photo
            src="/media/day-lunch.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="glass relative flex flex-col items-center justify-center px-6 py-10 text-center">
            <p className="text-sm text-ink-soft">{t.dayLunchKicker}</p>
            <h2 className="mt-2 font-serif text-3xl">{t.dayLunchTitle}</h2>
            <p className="mt-3 text-ink-soft">{t.lunchTile}</p>
          </div>
        </Link>
        <Link
          href="/brunch"
          className="hover-grow relative isolate overflow-hidden rounded-3xl"
        >
          <Photo
            src="/media/day-brunch.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="glass relative flex flex-col items-center justify-center px-6 py-10 text-center">
            <p className="text-sm text-ink-soft">{t.dayBrunchKicker}</p>
            <h2 className="mt-2 font-serif text-3xl">{t.dayBrunchTitle}</h2>
            <p className="mt-3 text-ink-soft">{t.brunchTile}</p>
          </div>
        </Link>
      </div>
    </section>
  );
}

export function HomeSeoText() {
  const t = useCopy();
  return <p className="sr-only">{t.homeSeo}</p>;
}
