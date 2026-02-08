import type { Viewport } from './viewport';
import { worldToScreen, screenToWorld } from './viewport';

export function drawScale(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  canvasWidth: number,
  canvasHeight: number
) {
  const color = '#4a5060';
  const textColor = '#6b7280';

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = textColor;
  ctx.lineWidth = 1;
  ctx.font = '9px "IBM Plex Mono", monospace';

  const pxPerMm = vp.scale;
  let interval = 1;

  if (pxPerMm < 0.5) interval = 100;
  else if (pxPerMm < 1) interval = 50;
  else if (pxPerMm < 2) interval = 20;
  else if (pxPerMm < 5) interval = 10;
  else if (pxPerMm < 10) interval = 5;
  else if (pxPerMm < 30) interval = 2;

  if (vp.vertical) {
    // Vertical mode: scale ruler along the right edge, measuring world X (optical axis, which maps to screen Y)
    const scaleX = canvasWidth - 20;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // Use screenToWorld to get world X range from screen Y range
    const [worldTop] = screenToWorld(vp, canvasWidth / 2, 0);
    const [worldBottom] = screenToWorld(vp, canvasWidth / 2, canvasHeight);

    const wMin = Math.min(worldTop, worldBottom);
    const wMax = Math.max(worldTop, worldBottom);
    const startMm = Math.floor(wMin / interval) * interval;
    const endMm = Math.ceil(wMax / interval) * interval;

    ctx.beginPath();
    ctx.moveTo(scaleX, 0);
    ctx.lineTo(scaleX, canvasHeight);
    ctx.stroke();

    for (let mm = startMm; mm <= endMm; mm += interval) {
      const [, sy] = worldToScreen(vp, mm, 0);
      if (sy < -10 || sy > canvasHeight + 10) continue;

      const isMajor = mm % (interval * 5) === 0;
      const tickW = isMajor ? 8 : 4;

      ctx.beginPath();
      ctx.moveTo(scaleX, sy);
      ctx.lineTo(scaleX + tickW, sy);
      ctx.stroke();

      if (isMajor) {
        ctx.fillText(`${mm}`, scaleX - 3, sy);
      }
    }

    ctx.textAlign = 'center';
    ctx.fillText('mm', scaleX, canvasHeight - 5);
  } else {
    // Horizontal mode: scale ruler along the bottom edge
    const scaleY = canvasHeight - 20;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const worldLeft = (0 - vp.offsetX) / vp.scale;
    const worldRight = (canvasWidth - vp.offsetX) / vp.scale;

    const startMm = Math.floor(worldLeft / interval) * interval;
    const endMm = Math.ceil(worldRight / interval) * interval;

    ctx.beginPath();
    ctx.moveTo(0, scaleY);
    ctx.lineTo(canvasWidth, scaleY);
    ctx.stroke();

    for (let mm = startMm; mm <= endMm; mm += interval) {
      const [sx] = worldToScreen(vp, mm, 0);
      if (sx < -10 || sx > canvasWidth + 10) continue;

      const isMajor = mm % (interval * 5) === 0;
      const tickH = isMajor ? 8 : 4;

      ctx.beginPath();
      ctx.moveTo(sx, scaleY);
      ctx.lineTo(sx, scaleY + tickH);
      ctx.stroke();

      if (isMajor) {
        ctx.fillText(`${mm}`, sx, scaleY + tickH + 2);
      }
    }

    ctx.textAlign = 'right';
    ctx.fillText('mm', canvasWidth - 5, scaleY + 12);
  }

  ctx.restore();
}

export function drawGridDots(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  canvasWidth: number,
  canvasHeight: number
) {
  const pxPerMm = vp.scale;
  let interval = 10;

  if (pxPerMm < 0.5) interval = 200;
  else if (pxPerMm < 1) interval = 100;
  else if (pxPerMm < 3) interval = 50;
  else if (pxPerMm < 8) interval = 20;

  // Use screenToWorld for the four corners to get world bounds
  const [w1x, w1y] = screenToWorld(vp, 0, 0);
  const [w2x, w2y] = screenToWorld(vp, canvasWidth, canvasHeight);

  const worldMinX = Math.min(w1x, w2x);
  const worldMaxX = Math.max(w1x, w2x);
  const worldMinY = Math.min(w1y, w2y);
  const worldMaxY = Math.max(w1y, w2y);

  const startX = Math.floor(worldMinX / interval) * interval;
  const startY = Math.floor(worldMinY / interval) * interval;

  ctx.save();
  ctx.fillStyle = 'rgba(58, 63, 75, 0.3)';

  for (let x = startX; x <= worldMaxX; x += interval) {
    for (let y = startY; y <= worldMaxY; y += interval) {
      const [sx, sy] = worldToScreen(vp, x, y);
      ctx.fillRect(sx - 0.5, sy - 0.5, 1, 1);
    }
  }

  ctx.restore();
}
