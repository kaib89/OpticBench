export interface ISensor {
  id: string;
  name: string;
  resolutionMp: number;
  pixelSizeMicron: number;
  sensorSizeInch: string;
  sensorDiagonalMm: number;
  shutterType: string;
  aspectRatio: number;
  aspectRatioLabel: string;
  sourceUrl?: string;
  isDefault: boolean;
}

// Abgeleitete Werte – nicht gespeichert, bei Bedarf berechnen
export function getSensorWidthMm(sensor: ISensor): number {
  return sensor.sensorDiagonalMm / Math.sqrt(1 + Math.pow(1 / sensor.aspectRatio, 2));
}

export function getSensorHeightMm(sensor: ISensor): number {
  return getSensorWidthMm(sensor) / sensor.aspectRatio;
}

export function getPixelsH(sensor: ISensor): number {
  return Math.round(Math.sqrt(sensor.resolutionMp * 1e6 * sensor.aspectRatio));
}

export function getPixelsV(sensor: ISensor): number {
  return Math.round(getPixelsH(sensor) / sensor.aspectRatio);
}
