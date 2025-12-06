/**
 * Format a cost value with appropriate suffix (K for thousands, M for millions)
 */
export function formatCost(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Format a number with locale-specific separators
 */
export function formatNumber(value: number, locale: string = 'en-US'): string {
  return value.toLocaleString(locale);
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
