"use client";

import { MenuTabs } from "./MenuTabs";
import { PageBack } from "./PageBack";

export function MenuPageHeader({
  title,
  current,
  menuBack = false,
  takeaway = false,
  onSelect,
}: {
  title: string;
  current?: string;
  menuBack?: boolean;
  takeaway?: boolean;
  onSelect?: (id: string, href: string) => void;
}) {
  return (
    <>
      <div className="relative pt-6">
        {menuBack ? (
          <div className="mb-4 hidden md:absolute md:left-0 md:top-6 md:z-10 md:mb-0 md:block">
            <PageBack takeaway={takeaway} onSelect={onSelect} />
          </div>
        ) : null}
        <h1 key={title} className="menu-fade-section w-full text-center font-serif text-6xl leading-none md:text-8xl">
          {title}
        </h1>
      </div>
      <div className="mt-12">
        <MenuTabs current={current} takeaway={takeaway} onSelect={onSelect} />
      </div>
    </>
  );
}
