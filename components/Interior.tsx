"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { interiors, site } from "@/lib/content";
import { asset } from "@/lib/asset";
import { localizeInterior, useCopy } from "@/lib/i18n";
import { useLocale } from "@/lib/locale";
import { track } from "./booking";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function shotClass(layout: (typeof interiors)[number]["layout"]) {
  if (layout === "hero") return "interior-shot-hero col-span-2 row-span-2 md:col-span-3";
  if (layout === "wide") return "md:col-span-2";
  if (layout === "tall") return "row-span-2";
  if (layout === "end") return "col-span-2 md:col-span-1";
  return "";
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function InteriorViewer({
  index,
  shots,
  onClose,
  onIndex,
}: {
  index: number;
  shots: Array<(typeof interiors)[number]>;
  onClose: () => void;
  onIndex: (next: number) => void;
}) {
  const t = useCopy();
  const shot = shots[index];
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef({ dist: 0, scale: 1 });
  const drag = useRef({ x: 0, y: 0, tx: 0, ty: 0, moved: false });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });

  const resetView = useCallback(() => {
    scaleRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    resetView();
  }, [index, resetView]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const applyScale = useCallback((next: number, origin?: { x: number; y: number }) => {
    const prev = scaleRef.current;
    const clamped = clamp(next, MIN_SCALE, MAX_SCALE);
    const stage = stageRef.current;
    if (origin && stage && clamped !== prev) {
      const rect = stage.getBoundingClientRect();
      const px = origin.x - rect.left - rect.width / 2;
      const py = origin.y - rect.top - rect.height / 2;
      const { x: tx, y: ty } = panRef.current;
      panRef.current = {
        x: px - ((px - tx) / prev) * clamped,
        y: py - ((py - ty) / prev) * clamped,
      };
    }
    if (clamped <= MIN_SCALE + 0.01) {
      panRef.current = { x: 0, y: 0 };
      scaleRef.current = 1;
      setScale(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    scaleRef.current = clamped;
    setScale(clamped);
    setPan({ ...panRef.current });
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        onIndex((index - 1 + shots.length) % shots.length);
        return;
      }
      if (event.key === "ArrowRight") {
        onIndex((index + 1) % shots.length);
        return;
      }
      if (event.key === "+" || event.key === "=") applyScale(scaleRef.current * 1.2);
      if (event.key === "-" || event.key === "_") applyScale(scaleRef.current / 1.2);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyScale, index, onClose, onIndex, shots.length]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onNativeWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.12 : 0.89;
      applyScale(scaleRef.current * factor, { x: event.clientX, y: event.clientY });
    };
    stage.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onNativeWheel);
  }, [applyScale]);

  function onPointerDown(event: PointerEvent) {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      tx: panRef.current.x,
      ty: panRef.current.y,
      moved: false,
    };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      pinch.current = { dist: Math.hypot(dx, dy) || 1, scale: scaleRef.current };
    }
  }

  function onPointerMove(event: PointerEvent) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      applyScale(pinch.current.scale * (dist / pinch.current.dist), {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
      });
      return;
    }
    if (scaleRef.current <= 1.02) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    if (Math.hypot(dx, dy) > 4) drag.current.moved = true;
    panRef.current = { x: drag.current.tx + dx, y: drag.current.ty + dy };
    setPan({ ...panRef.current });
  }

  function onPointerUp(event: PointerEvent) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 1) {
      const left = [...pointers.current.values()][0];
      drag.current = {
        x: left.x,
        y: left.y,
        tx: panRef.current.x,
        ty: panRef.current.y,
        moved: drag.current.moved,
      };
    }
  }

  function onDoubleClick(event: MouseEvent) {
    if (scaleRef.current > 1.2) applyScale(1);
    else applyScale(2.4, { x: event.clientX, y: event.clientY });
  }

  if (!shot) return null;

  return (
    <div
      className="interior-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={shot.title}
      onClick={(event) => {
        if (event.target === event.currentTarget && !drag.current.moved) onClose();
      }}
    >
      <button type="button" className="interior-viewer-close" onClick={onClose} aria-label={t.close}>
        ×
      </button>
      <button
        type="button"
        className="interior-viewer-nav is-prev"
        onClick={() => onIndex((index - 1 + shots.length) % shots.length)}
        aria-label={t.prevPhoto}
      >
        ‹
      </button>
      <button
        type="button"
        className="interior-viewer-nav is-next"
        onClick={() => onIndex((index + 1) % shots.length)}
        aria-label={t.nextPhoto}
      >
        ›
      </button>
      <div
        ref={stageRef}
        className="interior-viewer-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        onClick={(event) => {
          if (drag.current.moved) return;
          if (event.target === event.currentTarget && scaleRef.current <= 1.02) onClose();
        }}
      >
        <img
          src={asset(shot.src)}
          alt={shot.alt}
          draggable={false}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
        />
      </div>
      <div className="interior-viewer-bar">
        <p className="font-serif text-xl text-paper">{shot.title}</p>
        <p className="mt-1 max-w-xl text-sm text-paper/80">{shot.caption}</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <button type="button" className="interior-viewer-zoom" onClick={() => applyScale(scaleRef.current / 1.25)} aria-label={t.zoomOut}>
            −
          </button>
          <button type="button" className="interior-viewer-zoom" onClick={() => applyScale(scaleRef.current * 1.25)} aria-label={t.zoomIn}>
            +
          </button>
        </div>
        <p className="mt-2 text-xs text-paper/65">{t.zoomHint}</p>
      </div>
    </div>
  );
}

export function Interior() {
  const [open, setOpen] = useState<number | null>(null);
  const t = useCopy();
  const { locale } = useLocale();
  const shots = interiors.map((shot) => localizeInterior(shot, locale));

  return (
    <section className="py-16">
      <div className="page-shell text-center">
        <h2 className="font-serif text-6xl">{t.interiorTitle}</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink-soft">{t.interiorLead}</p>
        <div className="interior-grid mt-8 text-left">
          {shots.map((shot, i) => (
            <figure key={shot.src} className={`interior-shot ${shotClass(shot.layout)}`}>
              <button
                type="button"
                className="interior-shot-frame"
                onClick={() => setOpen(i)}
                aria-label={`${t.openPhoto} ${shot.title}`}
              >
                <img
                  src={asset(shot.src)}
                  alt={shot.alt}
                  width={1600}
                  height={1200}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </button>
              <figcaption>
                <p className="font-serif text-lg leading-tight md:text-xl">{shot.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-snug text-[#f4efe6]/88 md:text-sm">{shot.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <a
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center justify-center gap-2.5 text-ink-soft"
          onClick={() => track("click_instagram")}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
            <circle cx="12" cy="12" r="3.6" />
            <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
          </svg>
          <span>
            {t.instagramPrefix}{" "}
            <span className="text-ink underline decoration-ink/25 underline-offset-[0.35em]">{site.instagramHandle}</span>
          </span>
        </a>
      </div>
      {open !== null ? (
        <InteriorViewer index={open} shots={shots} onClose={() => setOpen(null)} onIndex={setOpen} />
      ) : null}
    </section>
  );
}
