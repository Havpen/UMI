"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/content";
import { useCopy } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

const LIGHT_MAP_FILTER = "grayscale(1) contrast(0.92) brightness(1.1)";
const DARK_MAP_FILTER = "grayscale(1) sepia(0.45) brightness(0.55) contrast(1.08)";

function paintMapTiles(ground: HTMLElement | null, dark: boolean) {
  if (!ground) return;
  ground.style.filter = dark ? DARK_MAP_FILTER : LIGHT_MAP_FILTER;
}

const routeHref = `https://yandex.by/maps/?rtext=~${site.coords.lat},${site.coords.lng}&rtt=auto`;

type YMap = {
  destroy: () => void;
  container: { fitToViewport: () => void };
  panes: { get: (name: string) => { getElement: () => HTMLElement } | undefined };
  geoObjects: { add: (obj: unknown) => void };
  controls: { get: (name: string) => { options: { set: (k: string, v: unknown) => void } } | undefined };
};

type YMaps = {
  ready: (cb: () => void) => void;
  Map: new (el: HTMLElement, state: object, options?: object) => YMap;
  Placemark: new (coords: number[], props: object, options: object) => unknown;
  templateLayoutFactory: { createClass: (html: string) => unknown };
};

declare global {
  interface Window {
    ymaps?: YMaps;
  }
}

function loadYmaps(): Promise<YMaps> {
  if (window.ymaps) return Promise.resolve(window.ymaps);
  return new Promise((resolve, reject) => {
    const done = () => (window.ymaps ? resolve(window.ymaps) : reject(new Error("ymaps")));
    const existing = document.getElementById("yandex-maps-api") as HTMLScriptElement | null;
    if (existing) {
      if (window.ymaps) done();
      else existing.addEventListener("load", done, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "yandex-maps-api";
    script.async = true;
    script.defer = true;
    const key = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY;
    const params = new URLSearchParams({
      lang: "ru_RU",
      load: "package.standard",
      mode: "release",
    });
    if (key) params.set("apikey", key);
    script.referrerPolicy = "origin";
    script.src = `https://api-maps.yandex.ru/2.1/?${params}`;
    script.onload = done;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function MapBand({
  title,
  fill = false,
}: {
  title?: string | false;
  fill?: boolean;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLElement | null>(null);
  const { theme } = useTheme();
  const dark = theme === "dark";
  const t = useCopy();
  const heading = title === false ? false : (title ?? t.findUs);

  useEffect(() => {
    paintMapTiles(groundRef.current, dark);
  }, [dark]);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    let map: YMap | undefined;
    let cancelled = false;
    let idleId = 0;
    let usedTimeout = false;

    const start = () => {
      loadYmaps().then((ymaps) => {
        ymaps.ready(() => {
          if (cancelled || !el) return;
          map = new ymaps.Map(
            el,
            {
              center: [site.coords.lat, site.coords.lng],
              zoom: 16,
              controls: ["zoomControl"],
            },
            {
              suppressMapOpenBlock: true,
              yandexMapDisablePoiInteractivity: true,
              autoFitToViewport: "always",
            },
          );
          map.controls.get("zoomControl")?.options.set("position", { right: 12, bottom: 48 });
          const ground = map.panes.get("ground")?.getElement() ?? null;
          groundRef.current = ground;
          paintMapTiles(ground, document.documentElement.getAttribute("data-theme") === "dark");
          const flagLayout = ymaps.templateLayoutFactory.createClass(
            '<div class="umi-ymap-flag">UMI</div>',
          );
          map.geoObjects.add(
            new ymaps.Placemark(
              [site.coords.lat, site.coords.lng],
              {},
              {
                iconLayout: flagLayout,
                iconShape: {
                  type: "Rectangle",
                  coordinates: [
                    [-40, -18],
                    [40, 18],
                  ],
                },
              },
            ),
          );
          map.container.fitToViewport();
        });
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        if (window.requestIdleCallback) {
          idleId = window.requestIdleCallback(start);
        } else {
          usedTimeout = true;
          idleId = window.setTimeout(start, 1);
        }
      },
      { rootMargin: "80px" },
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (idleId) {
        if (usedTimeout) window.clearTimeout(idleId);
        else window.cancelIdleCallback(idleId);
      }
      map?.destroy();
      groundRef.current = null;
    };
  }, []);

  return (
    <section className={`relative z-0 isolate ${fill ? "mt-auto flex min-h-0 flex-col" : ""}`}>
      {heading ? <h2 className="px-5 pb-8 text-center font-serif text-6xl">{heading}</h2> : null}
      <div
        data-map-canvas
        className="relative z-0 h-[min(50vh,434px)] w-full overflow-hidden"
      >
        <div ref={mapRef} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-36 bg-gradient-to-b from-paper via-paper/75 to-transparent" />
        <div className="absolute bottom-14 left-1/2 z-10 -translate-x-1/2">
          <a
            href={routeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-grow inline-flex rounded-full bg-ink px-[1.875rem] py-[1.125rem] text-[1.3125rem] text-paper"
          >
            {t.route}
          </a>
        </div>
      </div>
    </section>
  );
}
