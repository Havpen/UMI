"use client";

import { forwardRef, useCallback, useEffect, useRef } from "react";

type Axis = "x" | "y" | null;
type Sample = { t: number; x: number };

type Props = {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
  snap?: "center";
  drag?: boolean;
};

type Anim = { frame: number; active: boolean };

const anims = new WeakMap<HTMLElement, Anim>();
const COAST_FRICTION = 0.0028;
const COAST_MIN_VELOCITY = 0.06;
const COAST_MAX_VELOCITY = 2.6;
const SNAP_FLICK_VELOCITY = 0.1;
const SETTLE_OMEGA = 0.0054;
const SETTLE_ZETA = 1.5;

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

function maxScrollLeft(node: HTMLElement) {
  return Math.max(0, node.scrollWidth - node.clientWidth);
}

function releaseVelocity(samples: Sample[], now: number, lastX: number) {
  const recent = samples.filter((sample) => now - sample.t <= 90);
  if (!recent.length) return 0;
  const first = recent[0];
  const dt = now - first.t;
  if (dt < 12) return 0;
  return Math.max(-COAST_MAX_VELOCITY, Math.min(COAST_MAX_VELOCITY, -(lastX - first.x) / dt));
}

function settleScrollLeft(node: HTMLElement, target: number, velocity = 0) {
  const anim = getAnim(node);
  cancelAnimationFrame(anim.frame);
  const max = maxScrollLeft(node);
  const end = Math.max(0, Math.min(max, target));
  let x = node.scrollLeft;
  let v = velocity;

  if (Math.abs(end - x) < 0.5 && Math.abs(v) < 0.02) {
    node.scrollLeft = end;
    anim.active = false;
    return;
  }

  if (prefersReducedMotion()) {
    node.scrollLeft = end;
    anim.active = false;
    return;
  }

  const delta = end - x;
  if (v * delta > 0) {
    const cap = Math.abs(delta) * SETTLE_OMEGA * 2.4 + 0.28;
    if (Math.abs(v) > cap) v = Math.sign(v) * cap;
  }

  let last = performance.now();
  anim.active = true;

  const tick = (now: number) => {
    const dt = Math.min(32, now - last);
    last = now;
    const acc = -SETTLE_OMEGA * SETTLE_OMEGA * (x - end) - 2 * SETTLE_ZETA * SETTLE_OMEGA * v;
    v += acc * dt;
    x += v * dt;

    if (x <= 0) {
      x = 0;
      v = 0;
    } else if (x >= max) {
      x = max;
      v = 0;
    }

    node.scrollLeft = x;

    if (Math.abs(end - x) < 0.3 && Math.abs(v) < 0.012) {
      node.scrollLeft = end;
      anim.active = false;
      return;
    }
    anim.frame = requestAnimationFrame(tick);
  };

  anim.frame = requestAnimationFrame(tick);
}

function coastScrollLeft(node: HTMLElement, velocity: number) {
  if (Math.abs(velocity) < COAST_MIN_VELOCITY) return;
  const target = node.scrollLeft + velocity / COAST_FRICTION;
  settleScrollLeft(node, target, velocity);
}

export function animateScrollLeft(node: HTMLElement, left: number) {
  settleScrollLeft(node, left, 0);
}

function cardLeft(node: HTMLElement, card: HTMLElement) {
  return card.offsetLeft - (node.clientWidth - card.offsetWidth) / 2;
}

export function scrollToCard(node: HTMLElement, index: number) {
  const items = cardsOf(node);
  const card = items[Math.max(0, Math.min(items.length - 1, index))];
  if (!card) return;
  animateScrollLeft(node, cardLeft(node, card));
}

function cardsOf(node: HTMLElement) {
  return [...node.querySelectorAll<HTMLElement>("[data-card]")];
}

function indexAtCenter(node: HTMLElement, left: number, items: HTMLElement[]) {
  const mid = left + node.clientWidth / 2;
  let best = 0;
  let bestDist = Infinity;
  items.forEach((item, index) => {
    const dist = Math.abs(item.offsetLeft + item.offsetWidth / 2 - mid);
    if (dist < bestDist) {
      bestDist = dist;
      best = index;
    }
  });
  return best;
}

function snapToCenter(node: HTMLElement, fromLeft = node.scrollLeft) {
  if (getAnim(node).active) return;
  const items = cardsOf(node);
  if (!items.length) return;
  animateScrollLeft(node, cardLeft(node, items[indexAtCenter(node, fromLeft, items)]));
}

function snapAfterDrag(node: HTMLElement, startScroll: number, velocity: number) {
  const items = cardsOf(node);
  if (!items.length) return;

  const from = indexAtCenter(node, startScroll, items);
  const nearest = indexAtCenter(node, node.scrollLeft, items);
  const card = items[from];
  const dragged = node.scrollLeft - startScroll;
  const threshold = Math.max(28, Math.min(node.clientWidth * 0.08, card.offsetWidth * 0.18));
  let next = from;

  if (Math.abs(nearest - from) > 1) {
    next = nearest;
  } else if (velocity > SNAP_FLICK_VELOCITY || dragged > threshold) {
    next = from + 1;
  } else if (velocity < -SNAP_FLICK_VELOCITY || dragged < -threshold) {
    next = from - 1;
  }

  next = Math.max(0, Math.min(items.length - 1, next));
  settleScrollLeft(node, cardLeft(node, items[next]), velocity);
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
    lastX: 0,
    samples: [] as Sample[],
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
      if (node) node.style.touchAction = "";
      if (node?.hasPointerCapture(event.pointerId)) {
        node.releasePointerCapture(event.pointerId);
      }
      if (wasHorizontal && node) {
        const now = performance.now();
        const x = Number.isFinite(event.clientX) ? event.clientX : drag.current.lastX;
        drag.current.samples.push({ t: now, x });
        const velocity = releaseVelocity(drag.current.samples, now, x);
        if (snap === "center") {
          snapAfterDrag(node, drag.current.startScroll, velocity);
        } else {
          coastScrollLeft(node, velocity);
        }
      }
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

    settle();
    node.addEventListener("scroll", onScroll, { passive: true });
    node.addEventListener("scrollend", onEnd);
    return () => {
      window.clearTimeout(idle);
      node.removeEventListener("scroll", onScroll);
      node.removeEventListener("scrollend", onEnd);
    };
  }, [snap]);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || !canDrag) return;
    const blockIfHorizontal = (event: Event) => {
      if (drag.current.axis === "x") event.preventDefault();
    };
    node.addEventListener("touchmove", blockIfHorizontal, { passive: false });
    return () => node.removeEventListener("touchmove", blockIfHorizontal);
  }, [canDrag]);

  return (
    <div
      ref={setRefs}
      className={`scroll-touch relative min-w-0 max-w-full select-none ${center ? "flex" : ""} ${className}`}
      onDragStart={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        const node = nodeRef.current;
        if (node) cancelScrollAnim(node);
        if (!canDrag) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if (!node) return;
        drag.current = {
          tracking: true,
          moved: false,
          axis: null,
          startX: event.clientX,
          startY: event.clientY,
          startScroll: node.scrollLeft,
          lastX: event.clientX,
          samples: [{ t: performance.now(), x: event.clientX }],
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
          node.style.touchAction = "none";
          node.classList.add("is-dragging");
          if (!node.hasPointerCapture(event.pointerId)) {
            node.setPointerCapture(event.pointerId);
          }
        }
        if (drag.current.axis !== "x") return;
        if (Math.abs(dx) > 14) drag.current.moved = true;
        const now = performance.now();
        drag.current.lastX = event.clientX;
        drag.current.samples.push({ t: now, x: event.clientX });
        const samples = drag.current.samples;
        while (samples.length > 1 && now - samples[0].t > 90) samples.shift();
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
