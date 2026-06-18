/**
 * Format a number or numeric-string as MAD currency.
 */
export function formatMAD(amount: number | string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
  }).format(n);
}

/**
 * Parse a price string from the DB (numeric as string) to a number.
 */
export function parsePrice(price: string): number {
  return parseFloat(price) || 0;
}
