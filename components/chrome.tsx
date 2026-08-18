"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { nav, site } from "@/lib/content";
import { isMenuPath } from "@/lib/menuSection";
import { normPath } from "@/lib/paths";
import { track, useBooking } from "./booking";
import { useCart } from "./cart";
import { HeaderCartButton, HeaderCartPanel } from "./HeaderCart";
import { useMenuJump, useMenuView } from "./MenuView";
import { shouldSoftClick, useSoftNav } from "./softNav";

function BrandMark({ className = "" }: { className?: string }) {
  const pathname = normPath(usePathname());
  const go = useSoftNav();
  const fromMenu =
    pathname === "/menu" ||
    pathname.startsWith("/menu/") ||
    pathname === "/lunch" ||
    pathname === "/brunch";

  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center ${className}`}
      aria-label="UMI"
      onClick={(event) => {
        if (!fromMenu || !shouldSoftClick(event)) return;
        event.preventDefault();
        go("/");
      }}
    >
      <img
        src={`${asset("/brand/umi-mark-transparent.png")}?v=6`}
        alt=""
        width={1329}
        height={799}
        className="brand-mark"
      />
    </Link>
  );
}

function NavLinks({ onNavigate, className = "" }: { onNavigate?: () => void; className?: string }) {
  const pathname = normPath(usePathname());
  const jumpMenu = useMenuJump();
  const section = useMenuView()?.section ?? "";

  return nav.map((item) => {
    const active =
      item.href === "/lunch"
        ? section === "lunch"
        : item.href === "/brunch"
          ? section === "brunch"
          : item.href === "/menu"
            ? isMenuPath(pathname) && section !== "lunch" && section !== "brunch"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
    <Link
      key={item.href}
      href={item.href}
      prefetch
      onClick={(event) => {
        onNavigate?.();
        if (!shouldSoftClick(event)) return;
        jumpMenu(item.href, event);
      }}
      className={`shrink-0 whitespace-nowrap ${active ? "text-ink" : "hover:text-ink"} ${className}`}
    >
      {item.label}
    </Link>
    );
  });
}

export function Header() {
  const { setOpen } = useBooking();
  const { panelOpen, setPanelOpen, setCheckoutOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);

  useEffect(() => {
    router.prefetch("/menu");
    router.prefetch("/lunch");
    router.prefetch("/brunch");
    router.prefetch("/delivery");
    router.prefetch("/contacts");
  }, [router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (panelOpen) setMenuOpen(false);
  }, [panelOpen]);

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (!menuOpen) {
      setPanelHeight(0);
      return;
    }
    const sync = () => setPanelHeight(el.scrollHeight);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function openBooking() {
    track("click_booking_cta");
    track("booking_open");
    setOpen(true);
    setMenuOpen(false);
    setPanelOpen(false);
    setCheckoutOpen(false);
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-3">
      {menuOpen ? (
        <button
          type="button"
          aria-label="Закрыть меню"
          className="pointer-events-auto fixed inset-0 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div className="page-shell relative">
      <div className="glass pointer-events-auto relative w-full overflow-hidden rounded-[1.75rem] px-6 md:hidden">
        <div className="flex h-14 items-center justify-between gap-3">
          <BrandMark />
          <div className="flex items-center gap-1">
            <HeaderCartButton className="px-3 py-1.5 text-sm md:px-5 md:text-lg" />
            <button
              type="button"
              className="-mr-2 flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              onClick={() => {
                setPanelOpen(false);
                setMenuOpen((open) => !open);
              }}
            >
            <span className="relative block h-3.5 w-[1.15rem]" aria-hidden>
              <span
                className={`absolute left-0 h-px w-full bg-ink transition duration-200 ${
                  menuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-ink transition duration-200 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 h-px w-full bg-ink transition duration-200 ${
                  menuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
                }`}
              />
            </span>
          </button>
          </div>
        </div>
        <div
          className="overflow-hidden transition-[height] duration-300 ease-out"
          style={{ height: panelHeight }}
        >
          <nav
            id="mobile-nav"
            ref={panelRef}
            className="flex flex-col items-start gap-3 pb-2.5 pt-3 text-[1.094rem] text-ink-soft"
          >
            <div className="flex flex-col items-start gap-2.5">
              <NavLinks className="py-0.5" onNavigate={() => setMenuOpen(false)} />
            </div>
            <button
              type="button"
              className="rounded-full bg-ink px-6 py-3.5 text-lg text-paper"
              onClick={openBooking}
            >
              Забронировать
            </button>
          </nav>
        </div>
      </div>

      <div className="glass pointer-events-auto relative hidden h-14 w-full items-center rounded-full pl-6 pr-4 md:flex md:h-[3.75rem] md:pl-8 md:pr-4 lg:h-[4.5rem] lg:pl-10 lg:pr-3">
        <BrandMark className="relative z-10 shrink-0" />
        <nav className="pointer-events-auto absolute left-1/2 flex max-w-[min(100%,36rem)] -translate-x-1/2 justify-center gap-5 overflow-x-auto px-1 text-[1.094rem] text-ink-soft md:text-lg lg:max-w-[min(100%,48rem)] lg:text-xl">
          <NavLinks />
        </nav>
        <div className="relative z-10 ml-auto flex items-center gap-2">
          <HeaderCartButton />
          <button
            type="button"
            className="rounded-full bg-ink px-5 py-1.5 text-base text-paper md:px-6 md:text-lg lg:px-8 lg:py-2 lg:text-xl"
            onClick={openBooking}
          >
            Забронировать
          </button>
        </div>
      </div>
      <HeaderCartPanel />
      </div>
    </header>
  );
}

export function Footer() {
  const pathname = normPath(usePathname());
  if (pathname === "/" || pathname === "/contacts") return null;

  return (
    <footer className="px-4 py-3 text-center">
      <Link href="/" className="font-sans text-sm tracking-[0.22em] text-ink">
        UMI
      </Link>
      <p className="mt-1 text-xs text-ink-soft">
        {site.addressFull}
        {" · "}
        <a href={site.phoneHref} onClick={() => track("click_phone")}>
          {site.phone}
        </a>
      </p>
    </footer>
  );
}

export function FloatingBook() {
  const pathname = normPath(usePathname());
  const { setOpen } = useBooking();
  const { setPanelOpen, setCheckoutOpen } = useCart();
  const [visible, setVisible] = useState(false);
  const onHome = pathname === "/";

  useEffect(() => {
    if (!onHome) {
      setVisible(false);
      return;
    }

    const hero = document.querySelector("[data-hero]");
    const maps = [...document.querySelectorAll("[data-map-canvas]")];
    let heroInView = Boolean(hero);
    let mapCoversFab = false;

    function sync() {
      setVisible(!heroInView && !mapCoversFab);
    }

    const heroIo = hero
      ? new IntersectionObserver(
          ([entry]) => {
            heroInView = Boolean(entry?.isIntersecting);
            sync();
          },
          { threshold: 0.12 },
        )
      : null;

    const mapIo =
      maps.length > 0
        ? new IntersectionObserver(
            (entries) => {
              mapCoversFab = entries.some((entry) => entry.isIntersecting);
              sync();
            },
            { rootMargin: "-82% 0px 0px 0px", threshold: 0 },
          )
        : null;

    if (hero && heroIo) heroIo.observe(hero);
    maps.forEach((el) => mapIo?.observe(el));
    sync();

    return () => {
      heroIo?.disconnect();
      mapIo?.disconnect();
    };
  }, [onHome]);

  if (!onHome) return null;

  return (
    <button
      type="button"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/70 bg-[rgba(255,252,247,0.94)] px-5 py-3 text-sm text-ink shadow-[0_12px_40px_rgba(44,39,35,0.18)] transition-opacity duration-300 md:hidden ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={() => {
        track("click_booking_cta");
        track("booking_open");
        setPanelOpen(false);
        setCheckoutOpen(false);
        setOpen(true);
      }}
    >
      Забронировать
    </button>
  );
}
