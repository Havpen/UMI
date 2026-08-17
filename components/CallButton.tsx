"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/content";
import { track } from "./booking";

function canDirectCall() {
  return (
    window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
    window.matchMedia("(max-width: 767px)").matches
  );
}

const face = "col-start-1 row-start-1 transition-opacity duration-500 ease-out";

export function CallButton({ className = "" }: { className?: string }) {
  const [mobile, setMobile] = useState(false);
  const [showNumber, setShowNumber] = useState(false);

  useEffect(() => {
    setMobile(canDirectCall());
  }, []);

  const cls = `grid rounded-full border border-ink py-3 text-center ${className}`;

  if (mobile) {
    return (
      <a href={site.phoneHref} className={cls} onClick={() => track("click_phone")}>
        Позвонить
      </a>
    );
  }

  return (
    <a
      href={site.phoneHref}
      className={cls}
      onClick={(event) => {
        if (showNumber) {
          track("click_phone");
          return;
        }
        event.preventDefault();
        setShowNumber(true);
      }}
    >
      <span className={`${face} ${showNumber ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        Позвонить
      </span>
      <span className={`${face} ${showNumber ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        {site.phone}
      </span>
    </a>
  );
}
