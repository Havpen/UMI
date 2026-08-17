import { hours, site } from "@/lib/content";

export function JsonLd() {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: site.city,
      addressCountry: "BY",
    },
    telephone: site.phoneHref.replace("tel:", ""),
    openingHours: hours.map((row) => `${row.days} ${row.open}-${row.close}`),
    servesCuisine: ["AsianFusion", "Japanese", "Thai"],
    menu: `${origin}/menu`,
    image: `${origin}/media/og.jpg`,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
