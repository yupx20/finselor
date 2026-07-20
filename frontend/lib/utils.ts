/**
 * Format a number as Indonesian Rupiah currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with compact notation (e.g., 15M, 3.5K).
 */
export function formatCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toString();
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date string to a short format (e.g., "Jul 15").
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get the current month name.
 */
export function getCurrentMonthName(): string {
  return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Chart color palette for consistent styling.
 */
export const CHART_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#F43F5E", // rose
  "#06B6D4", // cyan
  "#EC4899", // pink
  "#14B8A6", // teal
  "#EF4444", // red
  "#A855F7", // purple
  "#F97316", // orange
  "#84CC16", // lime
];

/**
 * Get today's date formatted as YYYY-MM-DD for input fields.
 */
export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}
