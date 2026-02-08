import type { ISensor } from '../models/sensor';
import { getSensorWidthMm, getSensorHeightMm, getPixelsH, getPixelsV } from '../models/sensor';
import type { ILens } from '../models/lens';
import type { ITarget } from '../models/target';
import type { ICalculationResult } from '../models/config';
import { validate } from './validation';

export function calculate(
  sensor: ISensor,
  lens: ILens,
  target: ITarget,
  workingDistanceMm: number,
  aperture: number
): ICalculationResult {
  const f = lens.focalLengthMm;
  const doObj = workingDistanceMm;

  const sensorW = getSensorWidthMm(sensor);
  const sensorH = getSensorHeightMm(sensor);
  const sensorD = sensor.sensorDiagonalMm;
  const pixH = getPixelsH(sensor);
  const pixV = getPixelsV(sensor);

  // Bildabstand: 1/f = 1/do + 1/di  =>  di = (f * do) / (do - f)
  const imageDistanceMm = (f * doObj) / (doObj - f);

  // Abbildungsmaßstab β = f / (do - f)
  const magnification = f / (doObj - f);
  const absMag = Math.abs(magnification);

  // Field of View: FOV = sensorSize / |β|
  const fovHorizontalMm = sensorW / absMag;
  const fovVerticalMm = sensorH / absMag;
  const fovDiagonalMm = sensorD / absMag;

  // Pixel pro mm auf Objekt
  const pixelsPerMmH = pixH / fovHorizontalMm;
  const pixelsPerMmV = pixV / fovVerticalMm;
  const objectResolutionMmPerPx = fovHorizontalMm / pixH;

  // Tiefenschärfe (DoF)
  // Zerstreuungskreis = 1 Pixel
  const c = sensor.pixelSizeMicron / 1000; // µm -> mm
  const fSquared = f * f;
  const denomNear = fSquared + aperture * c * (doObj - f);
  const denomFar = fSquared - aperture * c * (doObj - f);

  const dofNearMm = (doObj * fSquared) / denomNear;

  let dofFarMm: number;
  if (denomFar <= 0) {
    dofFarMm = Infinity;
  } else {
    dofFarMm = (doObj * fSquared) / denomFar;
  }

  const dofTotalMm = dofFarMm === Infinity ? Infinity : dofFarMm - dofNearMm;

  // AOV: standard angle of view (constant, lens+sensor property)
  const halfAngleHorizontalDeg = Math.atan(sensorW / (2 * f)) * (180 / Math.PI);
  const halfAngleVerticalDeg = Math.atan(sensorH / (2 * f)) * (180 / Math.PI);
  const halfAngleDiagonalDeg = Math.atan(sensorD / (2 * f)) * (180 / Math.PI);

  // Effektive Blende
  const effectiveAperture = aperture * (1 + absMag);

  // Warnungen
  const warnings = validate(sensor, lens, target, workingDistanceMm, {
    fovHorizontalMm,
    fovVerticalMm,
    dofTotalMm,
  });

  return {
    fovHorizontalMm,
    fovVerticalMm,
    fovDiagonalMm,
    magnification,
    pixelsPerMmH,
    pixelsPerMmV,
    objectResolutionMmPerPx,
    dofTotalMm,
    dofNearMm,
    dofFarMm,
    halfAngleHorizontalDeg,
    halfAngleVerticalDeg,
    halfAngleDiagonalDeg,
    effectiveAperture,
    imageDistanceMm,
    warnings,
  };
}
