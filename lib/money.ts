export function parsePrice(price: string) {
  return Number.parseFloat(price.replace(",", "."));
}

export function formatSum(value: number) {
  return value.toFixed(2).replace(".", ",");
}
