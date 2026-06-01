/**
 * Shared currency formatting utility.
 *
 * @param value  - Numeric amount to format (defaults to 0 when falsy).
 * @param locale - BCP-47 locale tag, defaults to "en-IN".
 */
export function formatCurrency(value: number, locale: string = "en-IN") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);
}
