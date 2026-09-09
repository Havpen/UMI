import type { ImgHTMLAttributes } from "react";
import { asset } from "@/lib/asset";
import { webpSrc } from "@/lib/mediaSrc";

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string };

export function Photo({ src, alt = "", ...rest }: Props) {
  return (
    <picture className="contents">
      <source srcSet={asset(webpSrc(src))} type="image/webp" />
      <img src={asset(src)} alt={alt} {...rest} />
    </picture>
  );
}
