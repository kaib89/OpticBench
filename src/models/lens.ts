export interface ILens {
  id: string;
  name: string;
  focalLengthMm: number;
  apertureMin: number;
  apertureMax: number;
  minWorkingDistanceMm: number;
  maxImageCircleMm: number;
  isGeneric: boolean;
  isDefault: boolean;
}
