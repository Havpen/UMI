"use client";

import { hours, site } from "@/lib/content";
import { track } from "./booking";

export function ContactDetails() {
  return (
    <section className="px-5 pb-6 pt-12 text-center md:px-10">
      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-4xl md:text-5xl">Контакты</h1>
        <p className="mt-6 text-lg">
          {site.name}, {site.addressFull}, {site.floor}
        </p>
        <p className="mt-2 text-ink-soft">{site.landmark}. Парковки нет.</p>
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
            {hours.map((row) => (
              <tr key={row.days}>
                <td className="pr-8 py-1 text-right text-ink-soft">{row.days}</td>
                <td className="py-1 text-left">
                  {row.open}–{row.close}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
