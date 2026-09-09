import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categorySeo, menuCategories } from "@/lib/content";
import { getPublicMenu } from "@/lib/hallMenuData";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = process.env.GITHUB_PAGES !== "true";

export function generateStaticParams() {
  return menuCategories.map((cat) => ({ category: cat.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = menuCategories.find((item) => item.id === category);
  if (!cat) return {};
  const meta = categorySeo(category);
  const { hits } = await getPublicMenu();
  const empty = !hits.some((dish) => dish.category === category);
  return {
    title: meta?.title,
    description: meta?.description,
    robots: empty ? { index: false, follow: false } : undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = menuCategories.find((item) => item.id === category);
  if (!cat) notFound();
  return null;
}
