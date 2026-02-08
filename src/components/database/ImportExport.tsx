import { useRef } from 'react';
import { useStore } from '../../store/useStore';

export default function ImportExport() {
  const sensors = useStore(s => s.sensors);
  const lenses = useStore(s => s.lenses);
  const targets = useStore(s => s.targets);
  const importData = useStore(s => s.importData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      sensors: sensors.filter(s => !s.isDefault),
      lenses: lenses.filter(l => !l.isDefault),
      targets: targets.filter(t => !t.isDefault),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opticbench-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      sensors,
      lenses,
      targets,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opticbench-full-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        importData(data);
        alert(`Imported: ${data.sensors?.length ?? 0} sensors, ${data.lenses?.length ?? 0} lenses, ${data.targets?.length ?? 0} targets`);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const userSensors = sensors.filter(s => !s.isDefault).length;
  const userLenses = lenses.filter(l => !l.isDefault).length;
  const userTargets = targets.filter(t => !t.isDefault).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-2">Export</h3>
        <div className="space-y-2">
          <button onClick={handleExport}
            className="block w-full text-left text-sm bg-bg-input border border-border rounded px-4 py-3 hover:border-cyan/30 transition-colors">
            <div className="text-text-primary font-medium">Export Custom Data</div>
            <div className="text-text-muted text-xs mt-0.5">
              {userSensors} sensors, {userLenses} lenses, {userTargets} targets (user-created only)
            </div>
          </button>
          <button onClick={handleExportAll}
            className="block w-full text-left text-sm bg-bg-input border border-border rounded px-4 py-3 hover:border-cyan/30 transition-colors">
            <div className="text-text-primary font-medium">Export All Data</div>
            <div className="text-text-muted text-xs mt-0.5">
              {sensors.length} sensors, {lenses.length} lenses, {targets.length} targets (including defaults)
            </div>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-2">Import</h3>
        <div className="bg-bg-input border border-border border-dashed rounded px-4 py-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-cyan hover:text-cyan/80 px-4 py-2 border border-cyan/30 rounded hover:bg-cyan/5 transition-colors"
          >
            Choose JSON File
          </button>
          <div className="text-xs text-text-muted mt-2">
            Import sensors, lenses and targets from a previously exported JSON file.
            Default entries won't be duplicated.
          </div>
        </div>
      </div>
    </div>
  );
}
