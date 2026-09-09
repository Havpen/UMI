import type { Metadata } from "next";
import { DeliveryPageClient } from "@/components/DeliveryPageClient";
import { seo } from "@/lib/content";

export const metadata: Metadata = {
  title: seo["/delivery"].title,
  description: seo["/delivery"].description,
};

export default function DeliveryPage() {
  return <DeliveryPageClient />;
}
