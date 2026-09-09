export function webpSrc(src: string) {
  const [path, query] = src.split("?");
  const next = path.replace(/\.(jpe?g|png)$/i, ".webp");
  return query ? `${next}?${query}` : next;
}
