import type { MetadataRoute } from "next";
import { menuCategories } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const paths = [
    "",
    "/menu",
    ...menuCategories.map((cat) => cat.href),
    "/lunch",
    "/brunch",
    "/delivery",
    "/booking",
    "/contacts",
  ];
  return paths.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.7 }));
}
