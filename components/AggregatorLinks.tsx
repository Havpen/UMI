"use client";

import { aggregators } from "@/lib/content";
import { asset } from "@/lib/asset";
import { track } from "./booking";

export function AggregatorLinks() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-12">
      {aggregators.map((item) => (
        <a
          key={item.name}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="hover-grow flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(44,39,35,0.06)] sm:h-28 sm:w-28"
          onClick={() => track("click_aggregator", { service: item.name })}
        >
          <img
            src={asset(item.logo)}
            alt={item.name}
            width={160}
            height={160}
            className="h-full w-full object-contain"
          />
        </a>
      ))}
    </div>
  );
}
