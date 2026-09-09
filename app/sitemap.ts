import type { MetadataRoute } from "next";
import { getPublicMenu } from "@/lib/hallMenuData";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { publicCategories } = await getPublicMenu();
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const slash = process.env.GITHUB_PAGES === "true";
  const paths = [
    "",
    "/menu",
    ...publicCategories.map((cat) => cat.href),
    "/lunch",
    "/brunch",
    "/delivery",
    "/booking",
    "/contacts",
  ];
  return paths.map((path) => ({
    url: path === "" ? `${base}${slash ? "/" : ""}` : `${base}${path}${slash ? "/" : ""}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
