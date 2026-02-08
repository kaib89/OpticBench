import { useStore } from '../../store/useStore';

export default function TargetSelector() {
  const targets = useStore(s => s.targets);
  const targetId = useStore(s => s.config.targetId);
  const selectTarget = useStore(s => s.selectTarget);
  const updateCustomTarget = useStore(s => s.updateCustomTarget);

  const selectedTarget = targets.find(t => t.id === targetId);
  const isCustom = selectedTarget?.name === '⚙ Custom';

  const handleFieldChange = (field: 'widthMm' | 'heightMm' | 'depthMm', value: string) => {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0) {
      if (isCustom) {
        updateCustomTarget({ [field]: parsed });
      }
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-xs text-text-secondary mb-1 font-medium uppercase tracking-wider">Target Object</label>
      <select
        value={targetId ?? ''}
        onChange={(e) => selectTarget(e.target.value)}
        className="w-full bg-bg-input border border-border rounded px-3 py-2 text-sm text-text-primary focus:border-border-focus focus:outline-none cursor-pointer"
      >
        <option value="" disabled>Select target...</option>
        {targets.map(t => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.widthMm}×{t.heightMm}mm)
          </option>
        ))}
      </select>

      {selectedTarget && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] text-text-muted mb-0.5">Width (mm)</label>
            <input
              type="number"
              value={selectedTarget.widthMm}
              onChange={(e) => handleFieldChange('widthMm', e.target.value)}
              disabled={!isCustom}
              className="w-full bg-bg-input border border-border rounded px-2 py-1 text-sm font-mono text-text-primary focus:border-border-focus focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted mb-0.5">Height (mm)</label>
            <input
              type="number"
              value={selectedTarget.heightMm}
              onChange={(e) => handleFieldChange('heightMm', e.target.value)}
              disabled={!isCustom}
              className="w-full bg-bg-input border border-border rounded px-2 py-1 text-sm font-mono text-text-primary focus:border-border-focus focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted mb-0.5">Depth (mm)</label>
            <input
              type="number"
              value={selectedTarget.depthMm}
              onChange={(e) => handleFieldChange('depthMm', e.target.value)}
              className="w-full bg-bg-input border border-border rounded px-2 py-1 text-sm font-mono text-text-primary focus:border-border-focus focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
