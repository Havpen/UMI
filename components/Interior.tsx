import Image from "next/image";
import { interiors } from "@/lib/content";

export function Interior() {
  return (
    <section className="py-16">
      <div className="page-shell text-center">
        <h2 className="font-serif text-6xl">О нас и интерьер</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink-soft">
          Один зал в центре Гомеля. Азиатское ядро и европейские блюда — рядом. Частично открытая кухня, барная стойка, закуток для небольшой компании.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 text-left">
          <Image
            src={interiors[0].src}
            alt={interiors[0].alt}
            width={1000}
            height={750}
            className="col-span-2 h-64 w-full rounded-3xl object-cover md:h-[28rem] xl:h-[34rem]"
          />
          <Image
            src={interiors[1].src}
            alt={interiors[1].alt}
            width={800}
            height={600}
            className="h-40 w-full rounded-3xl object-cover md:h-64 xl:h-80"
          />
          <Image
            src={interiors[2].src}
            alt={interiors[2].alt}
            width={800}
            height={600}
            className="h-40 w-full rounded-3xl object-cover md:h-64 xl:h-80"
          />
        </div>
      </div>
    </section>
  );
}
