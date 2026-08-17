"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { site } from "@/lib/content";
import { track, useBooking } from "./booking";
import { Price } from "./BynSign";
import { useCart } from "./cart";

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.1em] w-[1.1em]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </svg>
  );
}

export function HeaderCartButton({ className = "" }: { className?: string }) {
  const { count, panelOpen, setPanelOpen } = useCart();
  if (count === 0) return null;

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-base text-paper md:px-5 md:text-lg lg:px-6 lg:py-2 lg:text-xl ${className}`}
      data-cart-toggle
      aria-expanded={panelOpen}
      onClick={() => setPanelOpen(!panelOpen)}
    >
      <BagIcon />
      Корзина
      <span className="text-paper/70">{count}</span>
    </button>
  );
}

export function HeaderCartPanel() {
  const { items, count, sumLabel, clear, panelOpen, setPanelOpen, setCheckoutOpen } = useCart();
  const { setOpen: setBookingOpen } = useBooking();
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const [panelLeft, setPanelLeft] = useState(0);

  useLayoutEffect(() => {
    function measure() {
      const shell = document.querySelector("header .page-shell");
      const btn = Array.from(document.querySelectorAll("[data-cart-toggle]")).find(
        (el) => (el as HTMLElement).offsetParent,
      );
      if (!shell || !btn) return;
      const shellRect = shell.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPanelLeft(Math.max(0, btnRect.left - shellRect.left));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [panelOpen, count]);

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (!panelOpen) {
      setPanelHeight(0);
      return;
    }
    const sync = () => setPanelHeight(el.scrollHeight);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [panelOpen, items]);

  useEffect(() => {
    if (!panelOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setPanelOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen, setPanelOpen]);

  if (count === 0) return null;

  return (
    <>
      {panelOpen ? (
        <button
          type="button"
          aria-label="Закрыть корзину"
          className="pointer-events-auto fixed inset-0 z-30 cursor-default"
          onClick={() => setPanelOpen(false)}
        />
      ) : null}
      <div
        className="pointer-events-auto absolute right-0 top-full z-40 mt-2 overflow-hidden rounded-3xl shadow-[0_16px_50px_rgba(44,39,35,0.12)]"
        style={{
          height: panelHeight,
          left: panelLeft,
          transition: "height 0.32s ease-out",
        }}
      >
        <div ref={panelRef} className="glass px-4 py-4 text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-serif text-xl tracking-[0.18em]">{site.name}</p>
              <p className="mt-1 text-sm text-ink-soft">
                <Price value={sumLabel} /> · самовывоз сегодня
              </p>
            </div>
            <button type="button" aria-label="Очистить корзину" className="text-ink-soft" onClick={clear}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M5 7h14M10 7V5h4v2M8 7l1 13h6l1-13" />
              </svg>
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {items.map((item) => (
              <img
                key={item.id}
                src={asset("/media/dish-placeholder.jpg")}
                alt={item.name}
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
              />
            ))}
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-full bg-ink py-2.5 text-paper"
            onClick={() => {
              track("takeaway_open");
              setPanelOpen(false);
              setBookingOpen(false);
              setCheckoutOpen(true);
            }}
          >
            Оформить заказ
          </button>
        </div>
      </div>
    </>
  );
}
