import type { Metadata } from "next";
import { Aggregators, DayTiles, HomeSeoText } from "@/components/Blocks";
import { Hero } from "@/components/Hero";
import { HitsCarousel } from "@/components/HitsCarousel";
import { Interior } from "@/components/Interior";
import { JsonLd } from "@/components/JsonLd";
import { MapBand } from "@/components/MapBand";
import { getPublicMenu } from "@/lib/hallMenuData";
import { seo } from "@/lib/content";

export const dynamic = process.env.GITHUB_PAGES === "true" ? "force-static" : "force-dynamic";

export const metadata: Metadata = {
  title: seo["/"].title,
  description: seo["/"].description,
};

export default async function HomePage() {
  const { hits, publicCategories } = await getPublicMenu();
  const categories = publicCategories.map((cat) => ({
    ...cat,
    cover: hits.find((dish) => dish.category === cat.id && dish.image),
  }));
  return (
    <main className="home-fade">
      <JsonLd />
      <Hero />
      <HitsCarousel categories={categories} />
      <Aggregators />
      <DayTiles />
      <Interior />
      <MapBand />
      <HomeSeoText />
    </main>
  );
}
