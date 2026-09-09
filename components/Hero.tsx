"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { asset } from "@/lib/asset";
import { useCopy } from "@/lib/i18n";
import { useLocale } from "@/lib/locale";
import { navHref } from "@/lib/paths";
import { track, useBooking } from "./booking";

function fitHeroInner(disk: HTMLElement, inner: HTMLElement) {
  inner.style.transform = "none";
  const styles = getComputedStyle(disk);
  const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
  const avail = disk.clientHeight - padY;
  const need = inner.scrollHeight;
  if (avail <= 0 || need <= avail) return;
  inner.style.transform = `scale(${Math.max(0.72, avail / need)})`;
}

export function Hero() {
  const { setOpen } = useBooking();
  const { locale } = useLocale();
  const t = useCopy();
  const videoRef = useRef<HTMLVideoElement>(null);
  const diskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const disk = diskRef.current;
    const inner = disk?.querySelector<HTMLElement>("[data-hero-inner]");
    if (!disk || !inner) return;

    const fit = () => fitHeroInner(disk, inner);
    const observer = new ResizeObserver(fit);
    observer.observe(disk);
    void document.fonts?.ready.then(fit);
    fit();
    return () => observer.disconnect();
  }, [locale]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;

    const leavePiP = () => {
      if (document.pictureInPictureElement === video) {
        void document.exitPictureInPicture();
      }
    };
    const blockMenu = (event: Event) => event.preventDefault();

    video.addEventListener("enterpictureinpicture", leavePiP);
    video.addEventListener("contextmenu", blockMenu);
    return () => {
      video.removeEventListener("enterpictureinpicture", leavePiP);
      video.removeEventListener("contextmenu", blockMenu);
    };
  }, []);

  return (
    <section data-hero className="hero-stage">
      <img
        src={`${asset("/media/hero-poster.jpg")}?v=2`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
        decoding="async"
      />
      <video
        ref={videoRef}
        className="hero-video absolute inset-0 h-full w-full object-cover pointer-events-none motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={`${asset("/media/hero-poster.jpg")}?v=2`}
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback"
      >
        <source src={`${asset("/media/hero.mp4")}?v=2`} type="video/mp4" />
        <source src={`${asset("/media/hero.webm")}?v=2`} type="video/webm" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-paper/40 via-transparent to-paper/8" />

      <div className="relative z-10 h-full">
        <div ref={diskRef} className="hero-disk glass">
          <div className="hero-disk-inner" data-hero-inner>
            <img
              src={`${asset("/brand/umi-mark-transparent.png")}?v=6`}
              alt="UMI"
              width={1329}
              height={799}
              className="hero-logo"
              fetchPriority="high"
              decoding="async"
            />
            <div className="hero-copy">
              <h1>{t.h1}.</h1>
              <p className="hero-tag text-ink-soft">
                {t.taglineLine1}
                <br />
                {t.taglineLine2}
              </p>
              <div className="hero-cta">
                <button
                  type="button"
                  className="hero-book"
                  onClick={() => {
                    track("click_booking_cta");
                    track("booking_open");
                    setOpen(true);
                  }}
                >
                  {t.bookTable}
                </button>
                <Link href={navHref("/menu")} className="hero-takeaway">
                  {t.takeawayCta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
