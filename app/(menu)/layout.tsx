import { Suspense } from "react";
import { MenuShell } from "@/components/MenuShell";
import { getPublicMenu } from "@/lib/hallMenuData";

export const dynamic = "force-static";

export default async function MenuGroupLayout() {
  const { hits, publicCategories } = await getPublicMenu();
  return (
    <Suspense fallback={null}>
      <MenuShell dishes={hits} categories={publicCategories} />
    </Suspense>
  );
}
