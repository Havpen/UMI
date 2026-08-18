import Link from "next/link";
import { asset } from "@/lib/asset";
import { brunch, lunch } from "@/lib/content";
import { navHref } from "@/lib/paths";
import { AggregatorLinks } from "./AggregatorLinks";

export function Aggregators() {
  return (
    <section className="pt-12">
      <div className="page-shell rounded-3xl bg-paper-2 px-5 py-10 text-center md:px-8">
        <h2 className="font-serif text-6xl">Заказать с доставкой</h2>
        <p className="mx-auto mt-2 max-w-xl text-ink-soft">
          Доставку везут агрегаторы. На вынос можно оформить у нас — заявкой, без оплаты на сайте.
        </p>
        <AggregatorLinks />
        <Link
          href={navHref("/menu")}
          className="hover-grow mt-8 inline-block rounded-full bg-ink px-5 py-3 text-paper"
        >
          Собрать заказ на вынос
        </Link>
      </div>
    </section>
  );
}

export function DayTiles() {
  return (
    <section className="pt-6 pb-8 md:pt-10 xl:pt-14">
      <div className="page-shell isolate grid gap-6 md:grid-cols-2 md:gap-10 xl:gap-14">
        <Link
          href="/lunch"
          className="hover-grow relative isolate overflow-hidden rounded-3xl"
        >
          <img
            src={asset("/media/day-lunch.jpg")}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="glass relative flex flex-col items-center justify-center px-6 py-10 text-center">
            <p className="text-sm text-ink-soft">Бизнес-ланч</p>
            <h2 className="mt-2 font-serif text-3xl">Дневной ритм</h2>
            <p className="mt-3 text-ink-soft">{lunch.tile}</p>
          </div>
        </Link>
        <Link
          href="/brunch"
          className="hover-grow relative isolate overflow-hidden rounded-3xl"
        >
          <img
            src={asset("/media/day-brunch.jpg")}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="glass relative flex flex-col items-center justify-center px-6 py-10 text-center">
            <p className="text-sm text-ink-soft">Бранч</p>
            <h2 className="mt-2 font-serif text-3xl">Выходные</h2>
            <p className="mt-3 text-ink-soft">{brunch.hours}. Европейские завтраки в том же зале.</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
