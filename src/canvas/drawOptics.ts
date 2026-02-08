import type { Viewport } from './viewport';
import { worldToScreen } from './viewport';

interface OpticsScene {
  objectX: number;
  objectSize: number;
  lensX: number;
  lensRadius: number;
  sensorX: number;
  sensorSize: number;
  fovSize: number;
  dofNear: number;
  dofFar: number;
  targetSize: number;
}

const COLORS = {
  axis: '#3a3f4b',
  axisDash: [8, 6] as number[],
  lens: '#00d4ff',
  lensBody: 'rgba(0, 212, 255, 0.08)',
  sensor: '#00d4ff',
  sensorFill: 'rgba(0, 212, 255, 0.15)',
  ray: '#f0a500',
  rayAlpha: 0.7,
  chiefRay: '#f0a500',
  chiefRayAlpha: 0.35,
  object: '#e8eaed',
  objectArrow: '#e8eaed',
  fovLine: '#4ade80',
  dof: 'rgba(0, 212, 255, 0.07)',
  dofBorder: 'rgba(0, 212, 255, 0.25)',
  target: 'rgba(240, 165, 0, 0.2)',
  targetBorder: 'rgba(240, 165, 0, 0.5)',
  dimension: '#6b7280',
  dimensionText: '#9aa0ab',
};

export function drawOpticsScene(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  scene: OpticsScene
) {
  const { objectX, objectSize, lensX, lensRadius, sensorX, sensorSize, fovSize, dofNear, dofFar, targetSize } = scene;

  drawOpticalAxis(ctx, vp, objectX - 30, sensorX + 30);
  drawDofZone(ctx, vp, dofNear, dofFar, lensX, fovSize * 1.3);
  drawTargetZone(ctx, vp, objectX, targetSize);
  drawFovMarker(ctx, vp, objectX, fovSize);
  drawObject(ctx, vp, objectX, objectSize);
  drawLens(ctx, vp, lensX, lensRadius);
  drawSensor(ctx, vp, sensorX, sensorSize);
  drawMarginalRays(ctx, vp, objectX, objectSize, lensX, sensorX, sensorSize);
  drawChiefRay(ctx, vp, objectX, objectSize, lensX, sensorX, sensorSize);
  drawDimensions(ctx, vp, scene);
}

function drawOpticalAxis(ctx: CanvasRenderingContext2D, vp: Viewport, xMin: number, xMax: number) {
  const [x1, y1] = worldToScreen(vp, xMin, 0);
  const [x2, y2] = worldToScreen(vp, xMax, 0);
  ctx.save();
  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 1;
  ctx.setLineDash(COLORS.axisDash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawDofZone(
  ctx: CanvasRenderingContext2D, vp: Viewport,
  dofNear: number, dofFar: number, lensX: number, halfHeight: number
) {
  const nearX = lensX - dofNear;
  const farX = isFinite(dofFar) ? lensX - dofFar : lensX - (lensX + 100);

  const [ax, ay] = worldToScreen(vp, farX, -halfHeight);
  const [bx, by] = worldToScreen(vp, nearX, -halfHeight);
  const [cx, cy] = worldToScreen(vp, nearX, halfHeight);
  const [dx2, dy] = worldToScreen(vp, farX, halfHeight);

  ctx.save();
  ctx.fillStyle = COLORS.dof;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineTo(cx, cy);
  ctx.lineTo(dx2, dy);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = COLORS.dofBorder;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawTargetZone(ctx: CanvasRenderingContext2D, vp: Viewport, objectX: number, halfSize: number) {
  const w = 3;
  const [ax, ay] = worldToScreen(vp, objectX - w / 2, -halfSize);
  const [bx, by] = worldToScreen(vp, objectX + w / 2, -halfSize);
  const [cx, cy] = worldToScreen(vp, objectX + w / 2, halfSize);
  const [dx2, dy] = worldToScreen(vp, objectX - w / 2, halfSize);

  ctx.save();
  ctx.fillStyle = COLORS.target;
  ctx.beginPath();
  ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
  ctx.lineTo(cx, cy); ctx.lineTo(dx2, dy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = COLORS.targetBorder;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawFovMarker(ctx: CanvasRenderingContext2D, vp: Viewport, objectX: number, halfFov: number) {
  const [mxT, myT] = worldToScreen(vp, objectX - 5, -halfFov);
  const [mxB, myB] = worldToScreen(vp, objectX - 5, halfFov);

  const perpDx = mxB - mxT;
  const perpDy = myB - myT;
  const perpLen = Math.sqrt(perpDx * perpDx + perpDy * perpDy);
  if (perpLen === 0) return;
  const pux = perpDx / perpLen;
  const puy = perpDy / perpLen;
  const tickLen = 10 * vp.scale * 0.3;

  ctx.save();
  ctx.strokeStyle = COLORS.fovLine;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);

  // Top tick
  ctx.beginPath();
  ctx.moveTo(mxT - pux * tickLen, myT - puy * tickLen);
  ctx.lineTo(mxT + pux * tickLen, myT + puy * tickLen);
  ctx.stroke();
  // Bottom tick
  ctx.beginPath();
  ctx.moveTo(mxB - pux * tickLen, myB - puy * tickLen);
  ctx.lineTo(mxB + pux * tickLen, myB + puy * tickLen);
  ctx.stroke();
  // Connection
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(mxT, myT);
  ctx.lineTo(mxB, myB);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.restore();
}

function drawObject(ctx: CanvasRenderingContext2D, vp: Viewport, x: number, halfSize: number) {
  const [sxC, syC] = worldToScreen(vp, x, 0);
  const [sxT, syT] = worldToScreen(vp, x, -halfSize);

  ctx.save();
  ctx.strokeStyle = COLORS.object;
  ctx.fillStyle = COLORS.objectArrow;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(sxC, syC);
  ctx.lineTo(sxT, syT);
  ctx.stroke();

  // Arrow head
  const dx = sxT - sxC;
  const dy = syT - syC;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 0) {
    const ux = dx / len, uy = dy / len;
    const px = -uy, py = ux;
    const s = 6;
    ctx.beginPath();
    ctx.moveTo(sxT, syT);
    ctx.lineTo(sxT - ux * s * 1.5 + px * s, syT - uy * s * 1.5 + py * s);
    ctx.lineTo(sxT - ux * s * 1.5 - px * s, syT - uy * s * 1.5 - py * s);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawLens(ctx: CanvasRenderingContext2D, vp: Viewport, x: number, halfRadius: number) {
  const [sxC, syC] = worldToScreen(vp, x, 0);
  const [sxT, syT] = worldToScreen(vp, x, -halfRadius);
  const [sxB, syB] = worldToScreen(vp, x, halfRadius);
  const height = Math.sqrt((sxB - sxT) ** 2 + (syB - syT) ** 2);

  const pdx = sxB - sxT, pdy = syB - syT;
  const pLen = Math.sqrt(pdx * pdx + pdy * pdy);
  if (pLen === 0) return;
  const nx = -pdy / pLen, ny = pdx / pLen;
  const bulge = Math.min(12, height * 0.08);

  ctx.save();
  ctx.fillStyle = COLORS.lensBody;
  ctx.beginPath();
  ctx.moveTo(sxT, syT);
  ctx.quadraticCurveTo(sxC + nx * bulge, syC + ny * bulge, sxB, syB);
  ctx.quadraticCurveTo(sxC - nx * bulge, syC - ny * bulge, sxT, syT);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = COLORS.lens;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sxT, syT);
  ctx.quadraticCurveTo(sxC + nx * bulge, syC + ny * bulge, sxB, syB);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sxT, syT);
  ctx.quadraticCurveTo(sxC - nx * bulge, syC - ny * bulge, sxB, syB);
  ctx.stroke();

  // End arrows
  const arrowL = 5;
  ctx.beginPath();
  ctx.moveTo(sxT + nx * arrowL, syT + ny * arrowL);
  ctx.lineTo(sxT, syT);
  ctx.lineTo(sxT - nx * arrowL, syT - ny * arrowL);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sxB + nx * arrowL, syB + ny * arrowL);
  ctx.lineTo(sxB, syB);
  ctx.lineTo(sxB - nx * arrowL, syB - ny * arrowL);
  ctx.stroke();

  ctx.restore();
}

function drawSensor(ctx: CanvasRenderingContext2D, vp: Viewport, x: number, halfSize: number) {
  const [sxT, syT] = worldToScreen(vp, x, -halfSize);
  const [sxB, syB] = worldToScreen(vp, x, halfSize);

  const dx = sxB - sxT, dy = syB - syT;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;
  const nx = -dy / len, ny = dx / len;
  const w = 2;

  ctx.save();
  ctx.fillStyle = COLORS.sensorFill;
  ctx.beginPath();
  ctx.moveTo(sxT + nx * w, syT + ny * w);
  ctx.lineTo(sxB + nx * w, syB + ny * w);
  ctx.lineTo(sxB - nx * w, syB - ny * w);
  ctx.lineTo(sxT - nx * w, syT - ny * w);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = COLORS.sensor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(sxT, syT);
  ctx.lineTo(sxB, syB);
  ctx.stroke();
  ctx.restore();
}

function drawMarginalRays(
  ctx: CanvasRenderingContext2D, vp: Viewport,
  objectX: number, objectHalf: number,
  lensX: number, sensorX: number, sensorHalf: number
) {
  ctx.save();
  ctx.strokeStyle = COLORS.ray;
  ctx.globalAlpha = COLORS.rayAlpha;
  ctx.lineWidth = 1.5;

  const [oxs, oys] = worldToScreen(vp, objectX, -objectHalf);
  const [lxs1, lys1] = worldToScreen(vp, lensX, -sensorHalf * 0.8);
  const [sxs1, sys1] = worldToScreen(vp, sensorX, sensorHalf);
  const [lxs2, lys2] = worldToScreen(vp, lensX, sensorHalf * 0.8);
  const [sxs2, sys2] = worldToScreen(vp, sensorX, -sensorHalf);
  const [oxBase, oyBase] = worldToScreen(vp, objectX, 0);
  const [sxMid, syMid] = worldToScreen(vp, sensorX, 0);

  ctx.beginPath();
  ctx.moveTo(oxs, oys);
  ctx.lineTo(lxs1, lys1);
  ctx.lineTo(sxs1, sys1);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(oxs, oys);
  ctx.lineTo(lxs2, lys2);
  ctx.lineTo(sxs2, sys2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(oxBase, oyBase);
  ctx.lineTo(lxs1, lys1);
  ctx.lineTo(sxMid, syMid);
  ctx.stroke();

  ctx.restore();
}

function drawChiefRay(
  ctx: CanvasRenderingContext2D, vp: Viewport,
  objectX: number, objectHalf: number,
  lensX: number, sensorX: number, sensorHalf: number
) {
  ctx.save();
  ctx.strokeStyle = COLORS.chiefRay;
  ctx.globalAlpha = COLORS.chiefRayAlpha;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);

  const [oxs, oys] = worldToScreen(vp, objectX, -objectHalf);
  const [lxs, lys] = worldToScreen(vp, lensX, 0);
  const [sxs, sys] = worldToScreen(vp, sensorX, sensorHalf);

  ctx.beginPath();
  ctx.moveTo(oxs, oys);
  ctx.lineTo(lxs, lys);
  ctx.lineTo(sxs, sys);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  tipX: number, tipY: number,
  fromX: number, fromY: number,
  size: number
) {
  const dx = tipX - fromX, dy = tipY - fromY;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - ux * size + px * size * 0.6, tipY - uy * size + py * size * 0.6);
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - ux * size - px * size * 0.6, tipY - uy * size - py * size * 0.6);
  ctx.stroke();
}

function drawDimensions(ctx: CanvasRenderingContext2D, vp: Viewport, scene: OpticsScene) {
  const { objectX, lensX, sensorX, objectSize, sensorSize, fovSize } = scene;
  ctx.save();
  ctx.font = '11px "IBM Plex Mono", monospace';

  drawDimensionLine(ctx, vp, objectX, lensX, -Math.max(objectSize, fovSize) - 15,
    `WD: ${(lensX - objectX).toFixed(0)} mm`);
  drawDimensionLine(ctx, vp, lensX, sensorX, -sensorSize - 15,
    `di: ${(sensorX - lensX).toFixed(1)} mm`);
  drawPerpDimension(ctx, vp, objectX - 8, objectSize,
    `${(objectSize * 2).toFixed(1)}`);
  drawPerpDimension(ctx, vp, sensorX + 8, sensorSize,
    `${(sensorSize * 2).toFixed(1)}`);
  drawPerpDimension(ctx, vp, objectX - 18, fovSize,
    `FOV: ${(fovSize * 2).toFixed(1)}`);

  ctx.restore();
}

function drawDimensionLine(
  ctx: CanvasRenderingContext2D, vp: Viewport,
  x1: number, x2: number, yOffset: number, label: string
) {
  const [sx1, sy1] = worldToScreen(vp, x1, yOffset);
  const [sx2, sy2] = worldToScreen(vp, x2, yOffset);
  const [ax1, ay1] = worldToScreen(vp, x1, 0);
  const [ax2, ay2] = worldToScreen(vp, x2, 0);

  ctx.strokeStyle = COLORS.dimension;
  ctx.fillStyle = COLORS.dimensionText;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  drawArrowHead(ctx, sx1, sy1, sx2, sy2, 4);
  drawArrowHead(ctx, sx2, sy2, sx1, sy1, 4);

  // Extension lines
  ctx.setLineDash([2, 2]);
  ctx.beginPath(); ctx.moveTo(sx1, sy1); ctx.lineTo(ax1, ay1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx2, sy2); ctx.lineTo(ax2, ay2); ctx.stroke();
  ctx.setLineDash([]);

  // Label at midpoint, offset perpendicular to line
  const midX = (sx1 + sx2) / 2, midY = (sy1 + sy2) / 2;
  const dx = sx2 - sx1, dy = sy2 - sy1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 0) {
    const nx = -dy / len, ny = dx / len;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, midX + nx * 10, midY + ny * 10);
  }
}

function drawPerpDimension(
  ctx: CanvasRenderingContext2D, vp: Viewport,
  x: number, halfSize: number, label: string
) {
  const [sxT, syT] = worldToScreen(vp, x, -halfSize);
  const [sxB, syB] = worldToScreen(vp, x, halfSize);

  ctx.strokeStyle = COLORS.dimension;
  ctx.fillStyle = COLORS.dimensionText;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(sxT, syT); ctx.lineTo(sxB, syB); ctx.stroke();
  drawArrowHead(ctx, sxT, syT, sxB, syB, 3);
  drawArrowHead(ctx, sxB, syB, sxT, syT, 3);

  // Rotated label along the dimension line
  const midX = (sxT + sxB) / 2, midY = (syT + syB) / 2;
  const dx = sxB - sxT, dy = syB - syT;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 0) {
    const nx = -dy / len, ny = dx / len;
    const angle = Math.atan2(dy, dx);
    ctx.save();
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.translate(midX + nx * 10, midY + ny * 10);
    // Keep text readable
    const textAngle = (angle > Math.PI / 2 || angle < -Math.PI / 2) ? angle + Math.PI : angle;
    ctx.rotate(textAngle);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }
}
