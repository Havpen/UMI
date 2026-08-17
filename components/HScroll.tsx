"use client";

import { forwardRef, useCallback, useEffect, useRef } from "react";

type Axis = "x" | "y" | null;

type Props = {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
  snap?: "center";
  drag?: boolean;
};

type Anim = { frame: number; active: boolean };

const anims = new WeakMap<HTMLElement, Anim>();

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getAnim(node: HTMLElement) {
  let anim = anims.get(node);
  if (!anim) {
    anim = { frame: 0, active: false };
    anims.set(node, anim);
  }
  return anim;
}

export function cancelScrollAnim(node: HTMLElement) {
  const anim = anims.get(node);
  if (!anim) return;
  cancelAnimationFrame(anim.frame);
  anim.active = false;
}

function easeOutQuint(t: number) {
  return 1 - (1 - t) ** 5;
}

export function animateScrollLeft(node: HTMLElement, left: number) {
  const anim = getAnim(node);
  cancelAnimationFrame(anim.frame);
  const start = node.scrollLeft;
  const delta = left - start;
  if (Math.abs(delta) < 2) {
    anim.active = false;
    return;
  }
  if (prefersReducedMotion()) {
    node.scrollLeft = left;
    anim.active = false;
    return;
  }

  anim.active = true;
  const duration = Math.min(780, Math.max(540, 400 + Math.abs(delta) * 0.95));
  const t0 = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / duration);
    node.scrollLeft = start + delta * easeOutQuint(t);
    if (t < 1) {
      anim.frame = requestAnimationFrame(tick);
    } else {
      anim.active = false;
    }
  };

  anim.frame = requestAnimationFrame(tick);
}

function cardLeft(node: HTMLElement, card: HTMLElement) {
  return card.offsetLeft - (node.clientWidth - card.offsetWidth) / 2;
}

export function scrollToCard(node: HTMLElement, index: number) {
  const items = [...node.querySelectorAll<HTMLElement>("[data-card]")];
  const card = items[Math.max(0, Math.min(items.length - 1, index))];
  if (!card) return;
  animateScrollLeft(node, cardLeft(node, card));
}

function snapToCenter(node: HTMLElement) {
  if (getAnim(node).active) return;
  const items = [...node.querySelectorAll<HTMLElement>("[data-card]")];
  if (!items.length) return;
  const mid = node.scrollLeft + node.clientWidth / 2;
  let best = items[0];
  let bestDist = Infinity;
  for (const item of items) {
    const dist = Math.abs(item.offsetLeft + item.offsetWidth / 2 - mid);
    if (dist < bestDist) {
      bestDist = dist;
      best = item;
    }
  }
  animateScrollLeft(node, cardLeft(node, best));
}

export const HScroll = forwardRef<HTMLDivElement, Props>(function HScroll(
  { children, className = "", center = false, snap, drag: canDrag = true },
  forwarded,
) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({
    tracking: false,
    moved: false,
    axis: null as Axis,
    startX: 0,
    startY: 0,
    startScroll: 0,
  });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) forwarded.current = node;
    },
    [forwarded],
  );

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!drag.current.tracking) return;
      const node = nodeRef.current;
      const wasHorizontal = drag.current.axis === "x";
      drag.current.tracking = false;
      drag.current.axis = null;
      node?.classList.remove("is-dragging");
      if (node?.hasPointerCapture(event.pointerId)) {
        node.releasePointerCapture(event.pointerId);
      }
      if (wasHorizontal && snap === "center" && node) snapToCenter(node);
    },
    [snap],
  );

  useEffect(() => {
    if (snap !== "center") return;
    const node = nodeRef.current;
    if (!node) return;
    let idle = 0;

    const settle = () => {
      if (drag.current.tracking || getAnim(node).active) return;
      snapToCenter(node);
    };

    const onScroll = () => {
      if (drag.current.tracking || getAnim(node).active) return;
      window.clearTimeout(idle);
      idle = window.setTimeout(settle, 120);
    };

    const onEnd = () => {
      window.clearTimeout(idle);
      settle();
    };

    node.addEventListener("scroll", onScroll, { passive: true });
    node.addEventListener("scrollend", onEnd);
    return () => {
      window.clearTimeout(idle);
      node.removeEventListener("scroll", onScroll);
      node.removeEventListener("scrollend", onEnd);
    };
  }, [snap]);

  return (
    <div
      ref={setRefs}
      className={`scroll-touch relative w-full min-w-0 max-w-full select-none ${center ? "flex" : ""} ${className}`}
      onDragStart={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        const node = nodeRef.current;
        if (node) cancelScrollAnim(node);
        if (!canDrag) return;
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        if (!node) return;
        drag.current = {
          tracking: true,
          moved: false,
          axis: null,
          startX: event.clientX,
          startY: event.clientY,
          startScroll: node.scrollLeft,
        };
      }}
      onPointerMove={(event) => {
        if (!canDrag || !drag.current.tracking) return;
        const node = nodeRef.current;
        if (!node) return;
        const dx = event.clientX - drag.current.startX;
        const dy = event.clientY - drag.current.startY;
        if (!drag.current.axis) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
          drag.current.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
          if (drag.current.axis === "y") {
            drag.current.tracking = false;
            return;
          }
          drag.current.moved = true;
          node.classList.add("is-dragging");
          if (!node.hasPointerCapture(event.pointerId)) {
            node.setPointerCapture(event.pointerId);
          }
        }
        if (drag.current.axis !== "x") return;
        node.scrollLeft = drag.current.startScroll - dx;
      }}
      onPointerUp={canDrag ? endDrag : undefined}
      onPointerCancel={canDrag ? endDrag : undefined}
      onClickCapture={(event) => {
        if (!canDrag || !drag.current.moved) return;
        event.preventDefault();
        event.stopPropagation();
        drag.current.moved = false;
      }}
    >
      {center ? <span className="min-w-0 shrink grow basis-0" aria-hidden /> : null}
      {children}
      {center ? <span className="min-w-0 shrink grow basis-0" aria-hidden /> : null}
    </div>
  );
});
