export interface Viewport {
  offsetX: number;  // offset along optical axis (world X)
  offsetY: number;  // offset perpendicular (world Y)
  scale: number;    // pixels per mm
  vertical: boolean;
  canvasH: number;  // needed for Y inversion in vertical mode
}

export function createViewport(
  canvasWidth: number,
  canvasHeight: number,
  sceneMinX: number,
  sceneMaxX: number,
  sceneMinY: number,
  sceneMaxY: number,
  padding = 60,
  vertical = false
): Viewport {
  const sceneW = sceneMaxX - sceneMinX;
  const sceneH = sceneMaxY - sceneMinY;

  // In vertical mode, optical axis maps to screen height, perpendicular to screen width
  const availAlongAxis = (vertical ? canvasHeight : canvasWidth) - padding * 2;
  const availPerp = (vertical ? canvasWidth : canvasHeight) - padding * 2;

  const scale = Math.min(availAlongAxis / sceneW, availPerp / sceneH);

  const sceneCenterX = (sceneMinX + sceneMaxX) / 2;
  const sceneCenterY = (sceneMinY + sceneMaxY) / 2;

  if (vertical) {
    const offsetX = canvasHeight / 2 - sceneCenterX * scale;
    const offsetY = canvasWidth / 2 - sceneCenterY * scale;
    return { offsetX, offsetY, scale, vertical: true, canvasH: canvasHeight };
  }

  const offsetX = canvasWidth / 2 - sceneCenterX * scale;
  const offsetY = canvasHeight / 2 - sceneCenterY * scale;
  return { offsetX, offsetY, scale, vertical: false, canvasH: canvasHeight };
}

export function worldToScreen(vp: Viewport, wx: number, wy: number): [number, number] {
  if (vp.vertical) {
    return [
      wy * vp.scale + vp.offsetY,
      vp.canvasH - (wx * vp.scale + vp.offsetX)
    ];
  }
  return [wx * vp.scale + vp.offsetX, wy * vp.scale + vp.offsetY];
}

export function screenToWorld(vp: Viewport, sx: number, sy: number): [number, number] {
  if (vp.vertical) {
    return [
      (vp.canvasH - sy - vp.offsetX) / vp.scale,
      (sx - vp.offsetY) / vp.scale
    ];
  }
  return [(sx - vp.offsetX) / vp.scale, (sy - vp.offsetY) / vp.scale];
}

export function zoomViewport(vp: Viewport, factor: number, pivotX: number, pivotY: number): Viewport {
  const [wx, wy] = screenToWorld(vp, pivotX, pivotY);
  const newScale = vp.scale * factor;

  if (vp.vertical) {
    return {
      ...vp,
      scale: newScale,
      offsetX: vp.canvasH - pivotY - wx * newScale,
      offsetY: pivotX - wy * newScale,
    };
  }

  return {
    ...vp,
    scale: newScale,
    offsetX: pivotX - wx * newScale,
    offsetY: pivotY - wy * newScale,
  };
}

export function panViewport(vp: Viewport, dx: number, dy: number): Viewport {
  if (vp.vertical) {
    return { ...vp, offsetX: vp.offsetX - dy, offsetY: vp.offsetY + dx };
  }
  return { ...vp, offsetX: vp.offsetX + dx, offsetY: vp.offsetY + dy };
}
