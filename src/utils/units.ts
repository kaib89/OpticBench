export function formatMm(value: number, decimals = 1): string {
  if (!isFinite(value)) return '∞';
  return `${value.toFixed(decimals)} mm`;
}

export function formatDeg(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}°`;
}

export function formatRatio(value: number, decimals = 4): string {
  if (Math.abs(value) < 1) {
    return `1:${(1 / Math.abs(value)).toFixed(1)}`;
  }
  return `${Math.abs(value).toFixed(decimals)}:1`;
}

export function formatPxPerMm(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)} px/mm`;
}

export function formatAperture(value: number): string {
  return `f/${value.toFixed(1)}`;
}

// Standard f-stop 1/3 stops
export const FSTOPS_THIRD = [
  1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8,
  3.2, 3.5, 4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8.0, 9.0,
  10, 11, 13, 14, 16, 18, 20, 22,
];

export function getAvailableFStops(min: number, max: number): number[] {
  return FSTOPS_THIRD.filter(f => f >= min - 0.05 && f <= max + 0.05);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
