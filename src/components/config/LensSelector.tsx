import { useStore } from '../../store/useStore';
import ParameterSlider from './ParameterSlider';

export default function LensSelector() {
  const lenses = useStore(s => s.lenses);
  const lensId = useStore(s => s.config.lensId);
  const selectLens = useStore(s => s.selectLens);
  const updateGenericLens = useStore(s => s.updateGenericLens);

  const selectedLens = lenses.find(l => l.id === lensId);
  const isGeneric = selectedLens?.isGeneric ?? false;

  return (
    <div className="mb-4">
      <label className="block text-xs text-text-secondary mb-1 font-medium uppercase tracking-wider">Lens</label>
      <select
        value={lensId ?? ''}
        onChange={(e) => selectLens(e.target.value)}
        className="w-full bg-bg-input border border-border rounded px-3 py-2 text-sm text-text-primary focus:border-border-focus focus:outline-none cursor-pointer"
      >
        <option value="" disabled>Select lens...</option>
        {lenses.map(l => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>

      {isGeneric && selectedLens && (
        <div className="mt-3 pl-2 border-l-2 border-cyan/30">
          <ParameterSlider
            label="Focal Length"
            value={selectedLens.focalLengthMm}
            min={4}
            max={200}
            step={1}
            unit="mm"
            onChange={(v) => updateGenericLens({ focalLengthMm: v })}
          />
          <ParameterSlider
            label="Image Circle"
            value={selectedLens.maxImageCircleMm}
            min={5}
            max={50}
            step={0.5}
            unit="mm"
            onChange={(v) => updateGenericLens({ maxImageCircleMm: v })}
          />
          <ParameterSlider
            label="Min Working Distance"
            value={selectedLens.minWorkingDistanceMm}
            min={10}
            max={500}
            step={5}
            unit="mm"
            onChange={(v) => updateGenericLens({ minWorkingDistanceMm: v })}
          />
        </div>
      )}

      {!isGeneric && selectedLens && (
        <div className="mt-2 text-xs text-text-muted space-y-0.5 pl-2">
          <div>Focal length: <span className="text-text-secondary font-mono">{selectedLens.focalLengthMm} mm</span></div>
          <div>Aperture: <span className="text-text-secondary font-mono">f/{selectedLens.apertureMin} – f/{selectedLens.apertureMax}</span></div>
          <div>Image circle: <span className="text-text-secondary font-mono">{selectedLens.maxImageCircleMm} mm</span></div>
        </div>
      )}
    </div>
  );
}
