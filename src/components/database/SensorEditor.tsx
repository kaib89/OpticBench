import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../store/useStore';
import type { ISensor } from '../../models/sensor';
import { getPixelsH, getPixelsV, getSensorWidthMm, getSensorHeightMm } from '../../models/sensor';

const emptyForm: Omit<ISensor, 'id' | 'isDefault'> = {
  name: '', resolutionMp: 5, pixelSizeMicron: 3.45, sensorSizeInch: '2/3',
  sensorDiagonalMm: 11.1, shutterType: 'Global', aspectRatio: 1.333,
  aspectRatioLabel: '4:3',
};

export default function SensorEditor() {
  const sensors = useStore(s => s.sensors);
  const addSensor = useStore(s => s.addSensor);
  const updateSensor = useStore(s => s.updateSensor);
  const deleteSensor = useStore(s => s.deleteSensor);
  const [editing, setEditing] = useState<ISensor | null>(null);
  const [form, setForm] = useState(emptyForm);

  const startEdit = (sensor: ISensor) => {
    setEditing(sensor);
    const { id: _id, isDefault: _d, ...rest } = sensor;
    setForm(rest);
  };

  const startNew = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const duplicate = (sensor: ISensor) => {
    addSensor({ ...sensor, id: uuidv4(), name: `${sensor.name} (copy)`, isDefault: false });
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      updateSensor({ ...editing, ...form });
    } else {
      addSensor({ ...form, id: uuidv4(), isDefault: false });
    }
    setEditing(null);
    setForm(emptyForm);
  };

  const handleChange = (field: string, value: string | number) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-text-secondary">{sensors.length} sensors</span>
        <button onClick={startNew} className="text-sm text-cyan hover:text-cyan/80 px-3 py-1 border border-cyan/30 rounded">
          + New Sensor
        </button>
      </div>

      {/* Formular */}
      {(editing || form.name !== emptyForm.name || !editing) && (
        <div className="bg-bg-input border border-border rounded p-4 mb-4 grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-[10px] text-text-muted mb-0.5">Name</label>
            <input value={form.name} onChange={e => handleChange('name', e.target.value)}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary" />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted mb-0.5">Resolution (MP)</label>
            <input type="number" step="0.01" value={form.resolutionMp} onChange={e => handleChange('resolutionMp', parseFloat(e.target.value))}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary font-mono" />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted mb-0.5">Pixel Size (µm)</label>
            <input type="number" step="0.01" value={form.pixelSizeMicron} onChange={e => handleChange('pixelSizeMicron', parseFloat(e.target.value))}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary font-mono" />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted mb-0.5">Format (inch)</label>
            <input value={form.sensorSizeInch} onChange={e => handleChange('sensorSizeInch', e.target.value)}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary" />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted mb-0.5">Diagonal (mm)</label>
            <input type="number" step="0.01" value={form.sensorDiagonalMm} onChange={e => handleChange('sensorDiagonalMm', parseFloat(e.target.value))}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary font-mono" />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted mb-0.5">Aspect Ratio</label>
            <input type="number" step="0.001" value={form.aspectRatio} onChange={e => handleChange('aspectRatio', parseFloat(e.target.value))}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary font-mono" />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted mb-0.5">Aspect Label</label>
            <input value={form.aspectRatioLabel} onChange={e => handleChange('aspectRatioLabel', e.target.value)}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary" />
          </div>
          <div>
            <label className="block text-[10px] text-text-muted mb-0.5">Shutter</label>
            <select value={form.shutterType} onChange={e => handleChange('shutterType', e.target.value)}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary">
              <option>Global</option>
              <option>Rolling</option>
              <option>Rolling (Global Reset)</option>
            </select>
          </div>
          <div className="col-span-4 flex gap-2 mt-1">
            <button onClick={save} className="text-sm bg-cyan/15 text-cyan px-4 py-1.5 rounded border border-cyan/30 hover:bg-cyan/25">
              {editing ? 'Update' : 'Add'}
            </button>
            <button onClick={() => { setEditing(null); setForm(emptyForm); }}
              className="text-sm text-text-muted px-4 py-1.5 rounded border border-border hover:text-text-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tabelle */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-bg-panel">
            <tr className="text-text-muted uppercase border-b border-border">
              <th className="text-left py-2 px-2">Name</th>
              <th className="text-right py-2 px-2">MP</th>
              <th className="text-right py-2 px-2">px µm</th>
              <th className="text-right py-2 px-2">Format</th>
              <th className="text-right py-2 px-2">Diag mm</th>
              <th className="text-right py-2 px-2">W×H mm</th>
              <th className="text-right py-2 px-2">Pixels</th>
              <th className="text-center py-2 px-2">Shutter</th>
              <th className="text-right py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-bg-hover/30">
                <td className="py-1.5 px-2 font-medium text-text-primary">{s.name}</td>
                <td className="py-1.5 px-2 text-right font-mono">{s.resolutionMp}</td>
                <td className="py-1.5 px-2 text-right font-mono">{s.pixelSizeMicron}</td>
                <td className="py-1.5 px-2 text-right">{s.sensorSizeInch}"</td>
                <td className="py-1.5 px-2 text-right font-mono">{s.sensorDiagonalMm}</td>
                <td className="py-1.5 px-2 text-right font-mono text-text-muted">
                  {getSensorWidthMm(s).toFixed(1)}×{getSensorHeightMm(s).toFixed(1)}
                </td>
                <td className="py-1.5 px-2 text-right font-mono text-text-muted">
                  {getPixelsH(s)}×{getPixelsV(s)}
                </td>
                <td className="py-1.5 px-2 text-center text-text-muted">{s.shutterType}</td>
                <td className="py-1.5 px-2 text-right whitespace-nowrap">
                  <button onClick={() => startEdit(s)} className="text-cyan/60 hover:text-cyan mr-2">
                    Edit
                  </button>
                  <button onClick={() => duplicate(s)} className="text-text-muted hover:text-text-secondary mr-2">
                    Dup
                  </button>
                  {!s.isDefault && (
                    <button onClick={() => deleteSensor(s.id)} className="text-red/60 hover:text-red">Del</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
