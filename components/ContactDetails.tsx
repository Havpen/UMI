"use client";

import Link from "next/link";
import { site } from "@/lib/content";
import { useCopy, useHours } from "@/lib/i18n";
import { navHref } from "@/lib/paths";
import { track } from "./booking";

export function ContactDetails() {
  const t = useCopy();
  const hallHours = useHours();
  return (
    <section className="px-5 pb-6 pt-12 text-center md:px-10">
      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-4xl md:text-5xl">{t.contactsTitle}</h1>
        <p className="mt-6 text-lg">{t.contactsLine(site.name, t.addressFull, t.floor)}</p>
        <p className="mt-2 text-ink-soft">
          {t.landmark}. {t.noParking}
        </p>
        <a href={site.phoneHref} className="mt-6 block" onClick={() => track("click_phone")}>
          {site.phone}
        </a>
        <a
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block"
          onClick={() => track("click_instagram")}
        >
          Instagram {site.instagramHandle}
        </a>
        <table className="mx-auto mt-8 text-sm">
          <tbody>
            {hallHours.map((row) => (
              <tr key={row.days}>
                <td className="pr-8 py-1 text-right text-ink-soft">{row.days}</td>
                <td className="py-1 text-left">
                  {row.open}–{row.close}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link
          href={navHref("/privacy")}
          className="mt-8 inline-block underline decoration-ink/25 underline-offset-[0.35em]"
        >
          {t.privacyLink}
        </Link>
      </div>
    </section>
  );
}
