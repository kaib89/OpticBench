import { useStore } from '../../store/useStore';
import ResultCard from '../results/ResultCard';
import WarningList from '../results/WarningList';
import type { IWarning } from '../../models/config';

function getWarningStatus(warnings: IWarning[]): 'ok' | 'warning' | 'error' {
  if (warnings.some(w => w.type === 'error')) return 'error';
  if (warnings.some(w => w.type === 'warning')) return 'warning';
  return 'ok';
}

function getDofStatus(dofTotalMm: number, targetDepthMm: number): 'ok' | 'warning' | 'error' {
  if (!isFinite(dofTotalMm)) return 'ok';
  if (dofTotalMm < targetDepthMm) return 'warning';
  return 'ok';
}

export default function ResultsPanel() {
  const result = useStore(s => s.result);
  const targets = useStore(s => s.targets);
  const config = useStore(s => s.config);
  const target = targets.find(t => t.id === config.targetId);

  if (!result) {
    return (
      <div className="w-[300px] min-w-[300px] bg-bg-panel border-l border-border flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Results</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
          Select sensor, lens and target to see results
        </div>
      </div>
    );
  }

  const overallStatus = getWarningStatus(result.warnings);
  const dofStatus = getDofStatus(result.dofTotalMm, target?.depthMm ?? 0);

  // FOV vs Target status
  let fovStatus: 'ok' | 'warning' | 'error' = 'ok';
  if (target) {
    if (result.fovHorizontalMm < target.widthMm || result.fovVerticalMm < target.heightMm) {
      fovStatus = 'warning';
    }
  }

  return (
    <div className="w-[300px] min-w-[300px] bg-bg-panel border-l border-border flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          overallStatus === 'ok' ? 'bg-green' :
          overallStatus === 'warning' ? 'bg-yellow' : 'bg-red'
        }`} />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Results</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* FOV Tabelle */}
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">Field of View</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-text-muted uppercase">
                <th className="text-left pb-1"></th>
                <th className="text-right pb-1 font-medium">H</th>
                <th className="text-right pb-1 font-medium">V</th>
                <th className="text-right pb-1 font-medium">D</th>
              </tr>
            </thead>
            <tbody className="font-mono text-text-primary">
              <tr>
                <td className="text-text-muted text-xs py-0.5">FOV (mm)</td>
                <td className="text-right">{result.fovHorizontalMm.toFixed(1)}</td>
                <td className="text-right">{result.fovVerticalMm.toFixed(1)}</td>
                <td className="text-right">{result.fovDiagonalMm.toFixed(1)}</td>
              </tr>
              <tr>
                <td className="text-text-muted text-xs py-0.5">Angle (°)</td>
                <td className="text-right">{(result.halfAngleHorizontalDeg * 2).toFixed(1)}</td>
                <td className="text-right">{(result.halfAngleVerticalDeg * 2).toFixed(1)}</td>
                <td className="text-right">{(result.halfAngleDiagonalDeg * 2).toFixed(1)}</td>
              </tr>
              <tr>
                <td className="text-text-muted text-xs py-0.5">px/mm</td>
                <td className="text-right">{result.pixelsPerMmH.toFixed(1)}</td>
                <td className="text-right">{result.pixelsPerMmV.toFixed(1)}</td>
                <td className="text-right text-text-muted">–</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-t border-border pt-3 grid grid-cols-2 gap-2">
          <ResultCard
            label="Magnification β"
            value={Math.abs(result.magnification) < 1
              ? `1:${(1 / Math.abs(result.magnification)).toFixed(1)}`
              : `${Math.abs(result.magnification).toFixed(3)}:1`}
            status={overallStatus}
          />
          <ResultCard
            label="Eff. Aperture"
            value={`f/${result.effectiveAperture.toFixed(1)}`}
            status={result.effectiveAperture > 22 ? 'warning' : 'ok'}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ResultCard
            label="Resolution"
            value={result.objectResolutionMmPerPx < 0.01
              ? `${(result.objectResolutionMmPerPx * 1000).toFixed(1)}`
              : result.objectResolutionMmPerPx.toFixed(3)}
            unit={result.objectResolutionMmPerPx < 0.01 ? 'µm/px' : 'mm/px'}
            status={fovStatus}
          />
          <ResultCard
            label="Image Distance"
            value={result.imageDistanceMm.toFixed(1)}
            unit="mm"
            status="info"
          />
        </div>

        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">Depth of Field</h3>
          <div className="grid grid-cols-1 gap-2">
            <ResultCard
              label="DoF Total"
              value={isFinite(result.dofTotalMm) ? result.dofTotalMm.toFixed(1) : '∞'}
              unit={isFinite(result.dofTotalMm) ? 'mm' : ''}
              status={dofStatus}
            />
            <div className="grid grid-cols-2 gap-2">
              <ResultCard
                label="Near Point"
                value={result.dofNearMm.toFixed(1)}
                unit="mm"
                status="info"
              />
              <ResultCard
                label="Far Point"
                value={isFinite(result.dofFarMm) ? result.dofFarMm.toFixed(1) : '∞'}
                unit={isFinite(result.dofFarMm) ? 'mm' : ''}
                status="info"
              />
            </div>
          </div>
        </div>

        <WarningList warnings={result.warnings} />
      </div>
    </div>
  );
}
