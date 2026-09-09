import type { Metadata } from "next";
import { BookingPageClient } from "@/components/BookingPageClient";
import { seo } from "@/lib/content";

export const metadata: Metadata = {
  title: seo["/booking"].title,
  description: seo["/booking"].description,
};

export default function BookingPage() {
  return <BookingPageClient />;
}
