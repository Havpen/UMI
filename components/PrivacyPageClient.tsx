"use client";

import { site } from "@/lib/content";
import { useCopy } from "@/lib/i18n";
import { legalProfile } from "@/lib/legal";
import { useLocale } from "@/lib/locale";
import { privacyCopy } from "@/lib/privacyCopy";

function linkify(text: string) {
  const parts = text.split(/(https:\/\/cpd\.by)/g);
  return parts.map((part, index) =>
    part === "https://cpd.by" ? (
      <a key={index} href="https://cpd.by" target="_blank" rel="noopener noreferrer" className="underline decoration-ink/25 underline-offset-[0.35em]">
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export function PrivacyPageClient() {
  const { locale } = useLocale();
  const t = useCopy();
  const doc = privacyCopy[locale];
  const legal = legalProfile();
  const hall = locale === "en" ? legal.hallAddressEn : legal.hallAddressRu;

  return (
    <main className="relative flex min-h-dvh flex-col px-5 pb-16 pt-28 md:px-10">
      <article className="mx-auto w-full max-w-2xl">
        <p className="text-sm text-ink-soft">{doc.kicker}</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">{doc.title}</h1>
        <p className="mt-6 text-lg leading-relaxed">{doc.lead}</p>
        <p className="mt-4 leading-relaxed text-ink-soft">{doc.law}</p>

        <div className="mt-8 rounded-3xl bg-paper-2 px-5 py-6 md:px-7">
          {legal.operator ? (
            <p className="leading-relaxed">{doc.operatorNamed(legal.operator, legal.unp, legal.legalAddress)}</p>
          ) : (
            <p className="leading-relaxed">{doc.operatorPending}</p>
          )}
          <p className="mt-3 leading-relaxed">
            {doc.hall}: {hall}.
          </p>
          <p className="mt-3 leading-relaxed">
            {doc.contacts}:{" "}
            {legal.email ? (
              <>
                <a href={`mailto:${legal.email}`} className="underline decoration-ink/25 underline-offset-[0.35em]">
                  {legal.email}
                </a>
                {", "}
              </>
            ) : null}
            <a href={legal.phoneHref} className="underline decoration-ink/25 underline-offset-[0.35em]">
              {legal.phone}
            </a>
            {legal.site ? (
              <>
                {". "}
                {t.privacySite}: {legal.site}
              </>
            ) : null}
          </p>
        </div>

        {doc.sections.map((section) => (
          <section key={section.title} id={section.id} className="mt-10 scroll-mt-28">
            <h2 className="font-serif text-2xl md:text-3xl">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 leading-relaxed text-ink-soft">
                {linkify(paragraph)}
              </p>
            ))}
          </section>
        ))}

        <p className="mt-12 text-sm text-ink-soft">
          {site.name}, {hall}.
        </p>
      </article>
    </main>
  );
}
