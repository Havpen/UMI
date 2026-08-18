"use client";

import { ReactNode, useEffect, useRef } from "react";

function fitPanel(layer: HTMLElement, panel: HTMLElement, inner: HTMLElement) {
  const vv = window.visualViewport;
  if (vv) {
    layer.style.top = `${vv.offsetTop}px`;
    layer.style.left = `${vv.offsetLeft}px`;
    layer.style.width = `${vv.width}px`;
    layer.style.height = `${vv.height}px`;
  } else {
    layer.style.top = "0";
    layer.style.left = "0";
    layer.style.width = "100%";
    layer.style.height = "100%";
  }

  inner.style.transform = "none";
  inner.style.marginBottom = "0";
  panel.style.overflowY = "auto";

  const keyboard = (vv?.height ?? window.innerHeight) < window.innerHeight - 80;
  if (keyboard || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const avail = panel.clientHeight;
  const need = inner.scrollHeight;
  if (avail <= 0 || need <= avail) return;

  const scale = Math.max(0.72, avail / need);
  inner.style.transformOrigin = "top center";
  inner.style.transform = `scale(${scale})`;
  inner.style.marginBottom = `${(scale - 1) * need}px`;
  panel.style.overflowY = scale * need > avail + 1 ? "auto" : "hidden";
}

export function SheetShell({
  visible,
  onClose,
  fitKey = "",
  children,
}: {
  visible: boolean;
  onClose: () => void;
  fitKey?: string | number;
  children: ReactNode;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const panel = panelRef.current;
    const inner = innerRef.current;
    if (!layer || !panel || !inner) return;

    const run = () => fitPanel(layer, panel, inner);
    const frame = requestAnimationFrame(run);
    const observer = new ResizeObserver(run);
    observer.observe(inner);
    observer.observe(layer);
    window.visualViewport?.addEventListener("resize", run);
    window.visualViewport?.addEventListener("scroll", run);
    window.addEventListener("resize", run);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.visualViewport?.removeEventListener("resize", run);
      window.visualViewport?.removeEventListener("scroll", run);
      window.removeEventListener("resize", run);
    };
  }, [visible, fitKey]);

  return (
    <div ref={layerRef} className="booking-layer">
      <button
        type="button"
        className={`booking-backdrop absolute inset-0 bg-[rgba(44,39,35,0.28)] ${visible ? "is-on" : ""}`}
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div ref={panelRef} className={`glass booking-panel ${visible ? "is-on" : ""}`}>
        <div ref={innerRef} className="booking-panel-inner">
          {children}
        </div>
      </div>
    </div>
  );
}

