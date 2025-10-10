/**
 * Format numbers using US standards (thousands, millions, billions)
 * Instead of Indian standards (lakhs, crores)
 */
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0';
  
  // Use en-US locale for consistent formatting
  return value.toLocaleString('en-US');
}

/**
 * Format numbers with abbreviated suffixes (K, M, B)
 * Example: 1,234,567 → 1.23M
 */
export function formatNumberCompact(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2) + 'B';
  } else if (absValue >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + 'M';
  } else if (absValue >= 1_000) {
    return (value / 1_000).toFixed(2) + 'K';
  }
  
  return value.toLocaleString('en-US');
}
