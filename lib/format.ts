export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return '';
  const formatted = String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return formatted + " so'm";
}