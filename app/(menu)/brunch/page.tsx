import type { Metadata } from "next";
import { seo } from "@/lib/content";

export const metadata: Metadata = {
  title: seo["/brunch"].title,
  description: seo["/brunch"].description,
};

export default function BrunchPage() {
  return null;
}
