import { Suspense } from "react";
import { MenuShell } from "@/components/MenuShell";

export default function MenuGroupLayout() {
  return (
    <Suspense fallback={null}>
      <MenuShell />
    </Suspense>
  );
}