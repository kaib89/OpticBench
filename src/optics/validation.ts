import type { ISensor } from '../models/sensor';
import type { ILens } from '../models/lens';
import type { ITarget } from '../models/target';
import type { IWarning } from '../models/config';

interface PartialResults {
  fovHorizontalMm: number;
  fovVerticalMm: number;
  dofTotalMm: number;
}

export function validate(
  sensor: ISensor,
  lens: ILens,
  target: ITarget,
  workingDistanceMm: number,
  results: PartialResults
): IWarning[] {
  const warnings: IWarning[] = [];

  // Abstand <= Brennweite: kein reelles Bild
  if (workingDistanceMm <= lens.focalLengthMm) {
    warnings.push({
      type: 'error',
      code: 'NO_REAL_IMAGE',
      message: 'Working distance must be greater than focal length. No real image can be formed.',
    });
  }

  // Unter Naheinstellgrenze
  if (workingDistanceMm < lens.minWorkingDistanceMm) {
    warnings.push({
      type: 'error',
      code: 'BELOW_MIN_WORKING_DISTANCE',
      message: `Working distance (${workingDistanceMm}mm) is below the minimum (${lens.minWorkingDistanceMm}mm).`,
    });
  }

  // Bildkreis zu klein → Vignettierung
  if (sensor.sensorDiagonalMm > lens.maxImageCircleMm) {
    warnings.push({
      type: 'warning',
      code: 'IMAGE_CIRCLE_TOO_SMALL',
      message: `Sensor diagonal (${sensor.sensorDiagonalMm.toFixed(1)}mm) exceeds lens image circle (${lens.maxImageCircleMm}mm). Vignetting will occur.`,
    });
  }

  // DoF < Objekttiefe
  if (results.dofTotalMm !== Infinity && results.dofTotalMm < target.depthMm) {
    warnings.push({
      type: 'warning',
      code: 'DOF_INSUFFICIENT',
      message: `Depth of field (${results.dofTotalMm.toFixed(1)}mm) is less than object depth (${target.depthMm}mm).`,
    });
  }

  // FOV < Objektgröße (horizontal oder vertikal)
  if (results.fovHorizontalMm < target.widthMm || results.fovVerticalMm < target.heightMm) {
    warnings.push({
      type: 'warning',
      code: 'FOV_TOO_SMALL',
      message: 'Field of view is smaller than the target object. Object will not be fully captured.',
    });
  }

  // FOV >> Objektgröße (mehr als 3x)
  if (
    results.fovHorizontalMm > target.widthMm * 3 &&
    results.fovVerticalMm > target.heightMm * 3
  ) {
    warnings.push({
      type: 'info',
      code: 'FOV_MUCH_LARGER',
      message: 'Field of view is much larger than the target. Object uses only a small portion of the sensor.',
    });
  }

  return warnings;
}
