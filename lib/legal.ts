import { site } from "./content";

export const POLICY_REVISION = "10.09.2026";

export function legalProfile() {
  return {
    operator: process.env.NEXT_PUBLIC_LEGAL_OPERATOR?.trim() || "",
    unp: process.env.NEXT_PUBLIC_LEGAL_UNP?.trim() || "",
    legalAddress: process.env.NEXT_PUBLIC_LEGAL_ADDRESS?.trim() || "",
    email: process.env.NEXT_PUBLIC_PD_EMAIL?.trim() || "",
    phone: site.phone,
    phoneHref: site.phoneHref,
    hallAddressRu: `Республика Беларусь, г. Гомель, ${site.address}`,
    hallAddressEn: `Republic of Belarus, Gomel, ${site.address}`,
    site: (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, ""),
  };
}

export function isConsentGiven(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}
