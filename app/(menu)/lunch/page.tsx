import type { Metadata } from "next";
import { seo } from "@/lib/content";

export const metadata: Metadata = {
  title: seo["/lunch"].title,
  description: seo["/lunch"].description,
};

export default function LunchPage() {
  return null;
}
