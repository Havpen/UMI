import { interiors } from "@/lib/content";
import { asset } from "@/lib/asset";

function shotClass(layout: (typeof interiors)[number]["layout"]) {
  if (layout === "hero") return "interior-shot-hero col-span-2 row-span-2 md:col-span-3";
  if (layout === "wide") return "md:col-span-2";
  if (layout === "tall") return "row-span-2";
  if (layout === "end") return "col-span-2 md:col-span-1";
  return "";
}

export function Interior() {
  return (
    <section className="py-16">
      <div className="page-shell text-center">
        <h2 className="font-serif text-6xl">О нас и интерьер</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink-soft">
          Один зал в центре Гомеля. Азиатское ядро и европейские блюда — рядом. Частично открытая кухня, барная стойка, закуток для небольшой компании.
        </p>
        <div className="interior-grid mt-8 text-left">
          {interiors.map((shot, i) => (
            <figure key={shot.src} className={`interior-shot ${shotClass(shot.layout)}`}>
              <div className="interior-shot-frame">
                <img
                  src={asset(shot.src)}
                  alt={shot.alt}
                  width={1600}
                  height={1200}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
              <figcaption>
                <p className="font-serif text-lg leading-tight md:text-xl">{shot.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-snug text-[#f4efe6]/88 md:text-sm">{shot.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
