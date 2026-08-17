import type { Metadata } from "next";
import { Aggregators, DayTiles } from "@/components/Blocks";
import { Hero } from "@/components/Hero";
import { HitsCarousel } from "@/components/HitsCarousel";
import { Interior } from "@/components/Interior";
import { JsonLd } from "@/components/JsonLd";
import { MapBand } from "@/components/MapBand";
import { homeSeoText, seo } from "@/lib/content";

export const metadata: Metadata = {
  title: seo["/"].title,
  description: seo["/"].description,
};

export default function HomePage() {
  return (
    <main className="home-fade">
      <JsonLd />
      <Hero />
      <HitsCarousel />
      <Aggregators />
      <DayTiles />
      <Interior />
      <MapBand />
      <p className="sr-only">{homeSeoText}</p>
    </main>
  );
}
