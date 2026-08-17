import type { Metadata } from "next";
import { BookingPageClient } from "@/components/BookingPageClient";
import { hours, seo, site } from "@/lib/content";

export const metadata: Metadata = {
  title: seo["/booking"].title,
  description: seo["/booking"].description,
};

export default function BookingPage() {
  return (
    <main className="relative page-shell pb-20 pt-28 text-center">
      <h1 className="font-serif text-4xl md:text-5xl">Забронировать стол</h1>
      <p className="mt-4 text-lg">
        Имя, телефон, дата и время. Заявка не бронь — подтвердим звонком.
      </p>
      <p className="mt-2 text-ink-soft">
        {site.addressFull}. {hours.map((row) => `${row.days} ${row.open}–${row.close}`).join(", ")}.
      </p>
      <BookingPageClient />
    </main>
  );
}
