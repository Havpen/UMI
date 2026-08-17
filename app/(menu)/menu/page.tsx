import type { Metadata } from "next";
import { seo } from "@/lib/content";

export const metadata: Metadata = {
  title: seo["/menu"].title,
  description: seo["/menu"].description,
};

export default function MenuPage() {
  return null;
}
