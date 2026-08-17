"use client";

import Link from "next/link";

const btn =
  "glass inline-flex items-center justify-center rounded-full px-6 py-3.5 text-lg text-ink shadow-[0_8px_30px_rgba(44,39,35,0.06)] md:px-8 md:py-4 md:text-xl lg:px-10 lg:py-5 lg:text-2xl";

export function PageBack({
  takeaway = false,
  className = "",
  onSelect,
}: {
  takeaway?: boolean;
  className?: string;
  onSelect?: (id: string, href: string) => void;
}) {
  const href = takeaway ? "/menu?mode=takeaway" : "/menu";

  return (
    <nav className={`flex flex-wrap items-center justify-start ${className}`}>
      <Link
        href={href}
        className={btn}
        onClick={(event) => {
          if (!onSelect) return;
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
            return;
          }
          event.preventDefault();
          onSelect("hits", "/menu");
        }}
      >
        К меню
      </Link>
    </nav>
  );
}
