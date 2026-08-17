import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { menuCategories, seo } from "@/lib/content";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return menuCategories.map((cat) => ({ category: cat.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const key = `/menu/${category}` as keyof typeof seo;
  const meta = seo[key];
  if (!meta) return {};
  return { title: meta.title, description: meta.description };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = menuCategories.find((item) => item.id === category);
  if (!cat) notFound();
  return null;
}
