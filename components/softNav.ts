"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

export const PAGE_LEAVE_MS = 80;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function shouldSoftClick(event: React.MouseEvent) {
  return !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0);
}

export function useSoftNav() {
  const router = useRouter();
  const busy = useRef(false);

  return (href: string) => {
    if (busy.current) return;
    const main = document.querySelector("main");
    if (!main || reducedMotion()) {
      router.push(href);
      return;
    }
    busy.current = true;
    main.classList.add("page-leave");
    window.setTimeout(() => {
      router.push(href);
      busy.current = false;
    }, PAGE_LEAVE_MS);
  };
}
