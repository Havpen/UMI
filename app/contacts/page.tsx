import type { Metadata } from "next";
import { ContactDetails } from "@/components/ContactDetails";
import { MapBand } from "@/components/MapBand";
import { seo } from "@/lib/content";

export const metadata: Metadata = {
  title: seo["/contacts"].title,
  description: seo["/contacts"].description,
};

export default function ContactsPage() {
  return (
    <main className="relative flex min-h-dvh flex-col pt-28">
      <ContactDetails />
      <MapBand title={false} fill />
    </main>
  );
}
