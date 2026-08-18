"use client";

import { useCallback, useEffect, useRef } from "react";
import { HScroll } from "./HScroll";
import { menuCategories } from "@/lib/content";
import { navHref } from "@/lib/paths";
import Link from "next/link";

function tabClass(active: boolean) {
  return `inline-flex grow shrink-0 items-center justify-center rounded-full px-6 py-3.5 text-lg whitespace-nowrap md:px-8 md:py-4 md:text-xl lg:px-10 lg:py-5 lg:text-2xl ${
    active ? "bg-ink text-paper" : "bg-paper-2"
  }`;
}

const tabs = [
  { id: "hits", href: "/menu", label: "Все хиты" },
  ...menuCategories.map((cat) => ({ id: cat.id, href: cat.href, label: cat.title })),
  { id: "lunch", href: "/lunch", label: "Ланч" },
  { id: "brunch", href: "/brunch", label: "Бранч" },
];

export function MenuTabs({
  current,
  onSelect,
}: {
  current?: string;
  onSelect?: (id: string, href: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateFade = useCallback(() => {
    const wrap = wrapRef.current;
    const node = scrollRef.current;
    if (!wrap || !node) return;
    const max = node.scrollWidth - node.clientWidth;
    wrap.classList.toggle("is-fade-start", node.scrollLeft > 1);
    wrap.classList.toggle("is-fade-end", max > 1 && node.scrollLeft < max - 1);
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    updateFade();
    node.addEventListener("scroll", updateFade, { passive: true });
    const observer = new ResizeObserver(updateFade);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    document.fonts?.ready.then(updateFade);
    return () => {
      node.removeEventListener("scroll", updateFade);
      observer.disconnect();
    };
  }, [updateFade]);

  return (
    <div ref={wrapRef} className="menu-ribbon">
      <HScroll ref={scrollRef}>
        <div className="flex w-max min-w-full gap-3 py-1 md:gap-4">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={navHref(tab.href)}
              prefetch
              draggable={false}
              className={tabClass(current ? current === tab.id : tab.id === "hits")}
              onClick={(event) => {
                if (!onSelect) return;
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
                  return;
                }
                event.preventDefault();
                onSelect(tab.id, tab.href);
              }}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </HScroll>
    </div>
  );
}
