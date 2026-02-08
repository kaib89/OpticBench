import { useStore } from '../../store/useStore';
import SensorSelector from '../config/SensorSelector';
import LensSelector from '../config/LensSelector';
import TargetSelector from '../config/TargetSelector';
import ParameterSlider from '../config/ParameterSlider';

export default function ConfigPanel() {
  const config = useStore(s => s.config);
  const lenses = useStore(s => s.lenses);
  const setWorkingDistance = useStore(s => s.setWorkingDistance);
  const setAperture = useStore(s => s.setAperture);

  const selectedLens = lenses.find(l => l.id === config.lensId);
  const minWd = selectedLens ? Math.max(selectedLens.focalLengthMm + 1, selectedLens.minWorkingDistanceMm) : 50;
  const apertureMin = selectedLens?.apertureMin ?? 1.4;
  const apertureMax = selectedLens?.apertureMax ?? 16;

  return (
    <div className="w-[280px] min-w-[280px] bg-bg-panel border-r border-border flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Configuration</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <SensorSelector />
        <LensSelector />
        <TargetSelector />

        <div className="border-t border-border pt-3 mt-2">
          <ParameterSlider
            label="Working Distance"
            value={config.workingDistanceMm}
            min={minWd}
            max={5000}
            step={1}
            unit="mm"
            onChange={setWorkingDistance}
          />
          <ParameterSlider
            label="Aperture"
            value={config.aperture}
            min={apertureMin}
            max={apertureMax}
            step={0.1}
            unit="f/"
            onChange={setAperture}
            formatValue={(v) => v.toFixed(1)}
          />
        </div>
      </div>
    </div>
  );
}
