export type ViewAxis = 'horizontal' | 'vertical' | 'diagonal';

export interface IConfiguration {
  sensorId: string | null;
  lensId: string | null;
  targetId: string | null;
  workingDistanceMm: number;
  aperture: number;
  viewAxis: ViewAxis;
}

export interface IWarning {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
}

export interface ICalculationResult {
  fovHorizontalMm: number;
  fovVerticalMm: number;
  fovDiagonalMm: number;

  magnification: number;

  pixelsPerMmH: number;
  pixelsPerMmV: number;
  objectResolutionMmPerPx: number;

  dofTotalMm: number;
  dofNearMm: number;
  dofFarMm: number;

  halfAngleHorizontalDeg: number;
  halfAngleVerticalDeg: number;
  halfAngleDiagonalDeg: number;

  effectiveAperture: number;

  imageDistanceMm: number;

  warnings: IWarning[];
}
