import type { Metadata } from "next";
import { PrivacyPageClient } from "@/components/PrivacyPageClient";
import { seo } from "@/lib/content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: seo["/privacy"].title,
  description: seo["/privacy"].description,
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
