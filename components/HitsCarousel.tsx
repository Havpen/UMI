"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { asset } from "@/lib/asset";
import { menuCategories } from "@/lib/content";
import { HScroll, scrollToCard } from "./HScroll";

const sections = [
  ...menuCategories.map((cat) => ({ id: cat.id, title: cat.title, href: cat.href })),
  { id: "lunch", title: "Ланч", href: "/lunch" },
  { id: "brunch", title: "Бранч", href: "/brunch" },
];

function Arrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Предыдущий раздел" : "Следующий раздел"}
      onClick={onClick}
      className="hover-grow glass flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg"
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
}

function cardsOf(scroller: HTMLDivElement | null) {
  return scroller ? [...scroller.querySelectorAll<HTMLElement>("[data-card]")] : [];
}

export function HitsCarousel() {
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
      if (reduce) {
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
    <section className="px-0 py-16">
      <div className="page-shell text-center">
        <h2 className="font-serif text-6xl">Меню</h2>

        <div className="mt-8 flex w-full items-center gap-3 lg:gap-5">
          <Arrow dir="prev" onClick={() => goTo(active.current - 1)} />
          <HScroll
            ref={scroller}
            snap="center"
            className="snap-row min-w-0 flex-1 gap-4 py-6 [--card:min(19rem,82%)] px-[max(0px,calc((100%-var(--card))/2))] md:gap-5 md:px-0 md:[--card:calc((100%-2rem)/3)] lg:gap-5 lg:[--card:calc((100%-5rem)/5)]"
          >
            {sections.map((section) => (
              <Link
                key={section.id}
                data-card
                href={section.href}
                className="w-[var(--card)] shrink-0"
                draggable={false}
              >
                <div
                  data-card-visual
                  className="origin-center overflow-hidden rounded-3xl bg-paper-2 will-change-transform"
                >
                  <div
                    className="aspect-[4/3] bg-cover bg-center"
                    style={{ backgroundImage: `url(${asset("/media/dish-placeholder.jpg")})` }}
                    aria-hidden
                  />
                  <div className="px-4 py-5 text-center lg:px-5 lg:py-6">
                    <p className="font-serif text-xl leading-tight lg:text-2xl">{section.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </HScroll>
          <Arrow dir="next" onClick={() => goTo(active.current + 1)} />
        </div>

        <Link
          href="/menu"
          className="hover-grow mt-8 inline-flex rounded-full bg-ink px-8 py-3 text-xl text-paper lg:px-10 lg:py-3.5 lg:text-2xl"
        >
          Всё меню
        </Link>
      </div>
    </section>
  );
}
