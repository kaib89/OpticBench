import { useRef, useEffect, useCallback, useState } from 'react';
import { useStore } from '../../store/useStore';
import { render, type RenderParams } from '../../canvas/renderer';
import { zoomViewport, panViewport, type Viewport } from '../../canvas/viewport';
import AxisToggle from '../config/AxisToggle';

export default function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const vpRef = useRef<Viewport | null>(null);
  const [autoFit, setAutoFit] = useState(true);

  const sensors = useStore(s => s.sensors);
  const lenses = useStore(s => s.lenses);
  const targets = useStore(s => s.targets);
  const config = useStore(s => s.config);
  const result = useStore(s => s.result);
  const canvasVertical = useStore(s => s.canvasVertical);
  const setCanvasVertical = useStore(s => s.setCanvasVertical);

  const sensor = sensors.find(s => s.id === config.sensorId);
  const lens = lenses.find(l => l.id === config.lensId);
  const target = targets.find(t => t.id === config.targetId);
  const hasData = sensor && lens && target && result;

  const doRender = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !sensor || !lens || !target || !result) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const params: RenderParams = {
      sensor,
      lens,
      target,
      result,
      workingDistanceMm: config.workingDistanceMm,
      viewAxis: config.viewAxis,
      vertical: canvasVertical,
    };

    if (autoFit) {
      vpRef.current = render(ctx, rect.width, rect.height, params);
    } else {
      vpRef.current = render(ctx, rect.width, rect.height, params, vpRef.current ?? undefined);
    }
  }, [sensor, lens, target, result, config.workingDistanceMm, config.viewAxis, autoFit, canvasVertical]);

  // Keep a stable ref so ResizeObserver & wheel handler always call the latest doRender
  const doRenderRef = useRef(doRender);
  useEffect(() => { doRenderRef.current = doRender; }, [doRender]);

  useEffect(() => {
    doRender();
  }, [doRender]);

  // ResizeObserver – stable, never re-creates (uses ref)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      setAutoFit(true);
      doRenderRef.current();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Zoom mit Mausrad – native listener with { passive: false } so preventDefault works
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!vpRef.current) return;

      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      vpRef.current = zoomViewport(vpRef.current, factor, mx, my);
      setAutoFit(false);
      doRenderRef.current();
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [hasData]);

  // Pan mit Shift+Drag oder mittlere Maustaste
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      isPanning.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current || !vpRef.current) return;
    e.preventDefault();
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    vpRef.current = panViewport(vpRef.current, dx, dy);
    setAutoFit(false);
    doRenderRef.current();
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleResetView = useCallback(() => {
    setAutoFit(true);
    vpRef.current = null;
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-bg-primary h-full min-w-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-bg-panel/50">
        <div className="flex items-center gap-3">
          <AxisToggle />
          <div className="flex items-center border border-border rounded overflow-hidden">
            <button
              onClick={() => { setCanvasVertical(false); setAutoFit(true); vpRef.current = null; }}
              className={`px-2 py-1 text-xs transition-colors ${!canvasVertical ? 'bg-cyan/15 text-cyan' : 'text-text-muted hover:text-text-secondary'}`}
              title="Horizontal layout"
            >
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <rect x="1" y="3" width="4" height="6" stroke="currentColor" strokeWidth="1" rx="0.5" />
                <circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1" />
                <rect x="12" y="2" width="3" height="8" stroke="currentColor" strokeWidth="1" rx="0.5" />
                <line x1="4" y1="6" x2="5.5" y2="6" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 1" />
                <line x1="10.5" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 1" />
              </svg>
            </button>
            <button
              onClick={() => { setCanvasVertical(true); setAutoFit(true); vpRef.current = null; }}
              className={`px-2 py-1 text-xs transition-colors ${canvasVertical ? 'bg-cyan/15 text-cyan' : 'text-text-muted hover:text-text-secondary'}`}
              title="Vertical layout (camera top, object bottom)"
            >
              <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                <rect x="3" y="1" width="6" height="3" stroke="currentColor" strokeWidth="1" rx="0.5" />
                <circle cx="6" cy="8" r="2.5" stroke="currentColor" strokeWidth="1" />
                <rect x="2" y="12" width="8" height="3" stroke="currentColor" strokeWidth="1" rx="0.5" />
                <line x1="6" y1="4" x2="6" y2="5.5" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 1" />
                <line x1="6" y1="10.5" x2="6" y2="12" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 1" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!autoFit && (
            <button
              onClick={handleResetView}
              className="text-xs text-text-muted hover:text-text-secondary px-2 py-1 border border-border rounded hover:border-border transition-colors"
            >
              Reset View
            </button>
          )}
          <span className="text-[10px] text-text-muted">
            Scroll to zoom · Shift+drag to pan
          </span>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 relative cursor-crosshair min-h-0">
        {hasData ? (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="absolute inset-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text-muted">
            <div className="text-center">
              <div className="text-4xl mb-3 opacity-20">⬡</div>
              <div className="text-sm">Select sensor, lens and target to see the optical path</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
