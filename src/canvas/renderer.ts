import type { ISensor } from '../models/sensor';
import { getSensorWidthMm, getSensorHeightMm } from '../models/sensor';
import type { ILens } from '../models/lens';
import type { ITarget } from '../models/target';
import type { ICalculationResult, ViewAxis } from '../models/config';
import { createViewport, type Viewport } from './viewport';
import { drawOpticsScene } from './drawOptics';
import { drawScale, drawGridDots } from './drawAnnotations';

export interface RenderParams {
  sensor: ISensor;
  lens: ILens;
  target: ITarget;
  result: ICalculationResult;
  workingDistanceMm: number;
  viewAxis: ViewAxis;
  vertical?: boolean;
}

export function getAxisSizes(
  sensor: ISensor,
  target: ITarget,
  result: ICalculationResult,
  viewAxis: ViewAxis
): { sensorHalf: number; targetHalf: number; fovHalf: number } {
  const sensorW = getSensorWidthMm(sensor);
  const sensorH = getSensorHeightMm(sensor);

  switch (viewAxis) {
    case 'horizontal':
      return {
        sensorHalf: sensorW / 2,
        targetHalf: target.widthMm / 2,
        fovHalf: result.fovHorizontalMm / 2,
      };
    case 'vertical':
      return {
        sensorHalf: sensorH / 2,
        targetHalf: target.heightMm / 2,
        fovHalf: result.fovVerticalMm / 2,
      };
    case 'diagonal':
      return {
        sensorHalf: sensor.sensorDiagonalMm / 2,
        targetHalf: Math.sqrt(target.widthMm ** 2 + target.heightMm ** 2) / 2,
        fovHalf: result.fovDiagonalMm / 2,
      };
  }
}

export function render(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: RenderParams,
  customViewport?: Viewport
) {
  const { sensor, target, result, workingDistanceMm, viewAxis } = params;

  const { sensorHalf, targetHalf, fovHalf } = getAxisSizes(sensor, target, result, viewAxis);

  // Szene aufbauen: Objekt links bei x=0, Linse bei x=WD, Sensor bei x=WD+di
  const objectX = 0;
  const lensX = workingDistanceMm;
  const sensorX = workingDistanceMm + result.imageDistanceMm;

  // Linsen-Darstellungsradius: etwas größer als Sensor oder FOV
  const lensRadius = Math.max(sensorHalf, targetHalf, fovHalf) * 1.1;

  // Viewport berechnen oder verwenden
  const maxY = Math.max(sensorHalf, targetHalf, fovHalf, lensRadius) + 20;
  const vp = customViewport ?? createViewport(
    width, height,
    objectX - 30, sensorX + 30,
    -maxY, maxY,
    80,
    params.vertical
  );

  // Clear
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#1a1d23';
  ctx.fillRect(0, 0, width, height);

  // Grid
  drawGridDots(ctx, vp, width, height);

  // Optische Szene
  drawOpticsScene(ctx, vp, {
    objectX,
    objectSize: targetHalf,
    lensX,
    lensRadius,
    sensorX,
    sensorSize: sensorHalf,
    fovSize: fovHalf,
    dofNear: result.dofNearMm,
    dofFar: isFinite(result.dofFarMm) ? result.dofFarMm : workingDistanceMm + 500,
    targetSize: targetHalf,
  });

  // Skala
  drawScale(ctx, vp, width, height);

  return vp;
}
