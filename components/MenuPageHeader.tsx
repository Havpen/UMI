"use client";

import { MenuTabs } from "./MenuTabs";

export function MenuPageHeader({
  title,
  current,
  onSelect,
}: {
  title: string;
  current?: string;
  onSelect?: (id: string, href: string) => void;
}) {
  return (
    <>
      <div className="relative pt-6">
        <h1 className="w-full text-center font-serif text-6xl leading-none md:text-8xl">
          {title}
        </h1>
      </div>
      <div className="mt-12">
        <MenuTabs current={current} onSelect={onSelect} />
      </div>
    </>
  );
}
