"use client";

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
  takeaway = false,
  onSelect,
}: {
  current?: string;
  takeaway?: boolean;
  onSelect?: (id: string, href: string) => void;
}) {
  return (
    <HScroll drag={false}>
      <div className="flex w-max min-w-full gap-3 py-1 md:gap-4">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={takeaway ? navHref(`${tab.href}?mode=takeaway`) : navHref(tab.href)}
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
  );
}
