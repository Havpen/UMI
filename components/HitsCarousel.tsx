"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { asset } from "@/lib/asset";
import { dishPhoto, type Hit } from "@/lib/content";
import { dishName, localizeCategory, useCopy } from "@/lib/i18n";
import { useLocale } from "@/lib/locale";
import { navHref } from "@/lib/paths";
import { HScroll, scrollToCard } from "./HScroll";

function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const t = useCopy();
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? t.prevSection : t.nextSection}
      onClick={onClick}
      className="hover-grow glass flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg md:h-11 md:w-11"
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
}

function cardsOf(scroller: HTMLDivElement | null) {
  return scroller ? [...scroller.querySelectorAll<HTMLElement>("[data-card]")] : [];
}

export function HitsCarousel({
  categories,
}: {
  categories: { id: string; href: string; title: string; h1: string; cover?: Hit }[];
}) {
  const t = useCopy();
  const { locale } = useLocale();
  const scroller = useRef<HTMLDivElement>(null);
  const active = useRef(0);

  const updateFocus = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mid = el.scrollLeft + el.clientWidth / 2;
    const items = cardsOf(el);
    let best = 0;
    let bestDist = Infinity;
    items.forEach((card, index) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
      const visual = card.querySelector<HTMLElement>("[data-card-visual]");
      if (!visual) return;
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      if (reduce || mobile) {
        visual.style.transform = "";
        return;
      }
      const t = Math.min(1, dist / Math.max(card.offsetWidth, 1));
      visual.style.transform = `scale(${(1.07 - t * 0.07).toFixed(3)})`;
    });
    active.current = best;
  }, []);

  const goTo = useCallback((index: number) => {
    const el = scroller.current;
    if (!el) return;
    scrollToCard(el, index);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateFocus);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    updateFocus();
    const observer = new ResizeObserver(updateFocus);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [updateFocus]);

  return (
    <section className="py-16">
      <div className="page-shell text-center">
        <h2 className="font-serif text-6xl">{t.menu}</h2>

        <div className="mt-8 flex w-full items-center gap-1.5 md:gap-4">
          <Arrow dir="prev" onClick={() => goTo(active.current - 1)} />
          <HScroll ref={scroller} snap="center" className="snap-row min-w-0 flex-1 items-stretch gap-3 overflow-x-auto py-2 md:gap-4 md:py-5">
            {categories.map((cat) => {
              const cover = cat.cover;
              const localized = localizeCategory(cat, locale);
              const coverName = cover ? dishName(cover.id, cover.name, locale, cover.nameEn) : localized.h1;
              return (
                <article
                  key={cat.id}
                  data-card
                  className="flex w-full max-w-full shrink-0 flex-col self-stretch md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
                >
                  <Link
                    href={navHref(cat.href)}
                    draggable={false}
                    data-card-visual
                    className="flex h-full min-h-full w-full max-w-full flex-1 flex-col origin-center overflow-hidden rounded-3xl bg-paper-2 text-center will-change-transform md:origin-center"
                  >
                    <img
                      src={asset(dishPhoto(cover))}
                      alt={cover ? `${coverName}${t.dishAltSuffix}` : localized.h1}
                      className="aspect-[4/3] w-full object-cover"
                      draggable={false}
                      decoding="async"
                    />
                    <div className="flex flex-1 flex-col justify-center px-4 py-4 lg:px-5 lg:py-5">
                      <p className="font-serif text-xl leading-tight lg:text-2xl">{localized.title}</p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </HScroll>
          <Arrow dir="next" onClick={() => goTo(active.current + 1)} />
        </div>

        <Link
          href={navHref("/menu")}
          className="hover-grow mt-8 inline-flex rounded-full bg-ink px-8 py-3 text-xl text-paper lg:px-10 lg:py-3.5 lg:text-2xl"
        >
          {t.allMenu}
        </Link>
      </div>
    </section>
  );
}
