import type { Metadata } from "next";
import Link from "next/link";
import { AggregatorLinks } from "@/components/AggregatorLinks";
import { seo } from "@/lib/content";

export const metadata: Metadata = {
  title: seo["/delivery"].title,
  description: seo["/delivery"].description,
};

export default function DeliveryPage() {
  return (
    <main className="relative page-shell pb-20 pt-28 text-center">
      <h1 className="font-serif text-4xl md:text-5xl">Заказ с собой</h1>
      <p className="mx-auto mt-6 max-w-3xl text-lg">
        Самовывоз из ресторана UMI — заявкой на сайте. Доставку везут агрегаторы, корзины и оплаты у нас нет.
      </p>
      <div className="mt-8 rounded-3xl bg-paper-2 px-5 py-6">
        <p>Доставка</p>
        <AggregatorLinks />
      </div>
      <Link href="/menu?mode=takeaway" className="mt-8 inline-block rounded-full bg-ink px-5 py-3 text-paper">
        Собрать заказ на вынос
      </Link>
    </main>
  );
}
