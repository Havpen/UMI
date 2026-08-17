import { asset } from "@/lib/asset";

export function BynSign({ className = "" }: { className?: string }) {
  const mask = `url(${asset("/brand/byn-sign.png")}?v=1)`;
  return (
    <span
      className={`inline-block h-[0.7em] w-[0.6em] shrink-0 self-center bg-current ${className}`}
      style={{
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
      aria-label="белорусский рубль"
      role="img"
    />
  );
}

export function Price({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-[0.15em] ${className}`}>
      <span>{value}</span>
      <BynSign />
    </span>
  );
}
