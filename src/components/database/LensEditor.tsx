import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../store/useStore';
import type { ILens } from '../../models/lens';

const emptyForm: Omit<ILens, 'id' | 'isDefault'> = {
  name: '', focalLengthMm: 25, apertureMin: 1.4, apertureMax: 16,
  minWorkingDistanceMm: 150, maxImageCircleMm: 17.6, isGeneric: false,
};

export default function LensEditor() {
  const lenses = useStore(s => s.lenses);
  const addLens = useStore(s => s.addLens);
  const updateLens = useStore(s => s.updateLens);
  const deleteLens = useStore(s => s.deleteLens);
  const [editing, setEditing] = useState<ILens | null>(null);
  const [form, setForm] = useState(emptyForm);

  const startEdit = (lens: ILens) => {
    setEditing(lens);
    const { id: _id, isDefault: _d, ...rest } = lens;
    setForm(rest);
  };

  const startNew = () => { setEditing(null); setForm(emptyForm); };

  const duplicate = (lens: ILens) => {
    addLens({ ...lens, id: uuidv4(), name: `${lens.name} (copy)`, isDefault: false, isGeneric: false });
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      updateLens({ ...editing, ...form });
    } else {
      addLens({ ...form, id: uuidv4(), isDefault: false });
    }
    setEditing(null);
    setForm(emptyForm);
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-text-secondary">{lenses.length} lenses</span>
        <button onClick={startNew} className="text-sm text-cyan hover:text-cyan/80 px-3 py-1 border border-cyan/30 rounded">
          + New Lens
        </button>
      </div>

      <div className="bg-bg-input border border-border rounded p-4 mb-4 grid grid-cols-4 gap-3">
        <div className="col-span-2">
          <label className="block text-[10px] text-text-muted mb-0.5">Name</label>
          <input value={form.name} onChange={e => handleChange('name', e.target.value)}
            className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-[10px] text-text-muted mb-0.5">Focal Length (mm)</label>
          <input type="number" step="1" value={form.focalLengthMm} onChange={e => handleChange('focalLengthMm', parseFloat(e.target.value))}
            className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary font-mono" />
        </div>
        <div>
          <label className="block text-[10px] text-text-muted mb-0.5">Image Circle (mm)</label>
          <input type="number" step="0.1" value={form.maxImageCircleMm} onChange={e => handleChange('maxImageCircleMm', parseFloat(e.target.value))}
            className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary font-mono" />
        </div>
        <div>
          <label className="block text-[10px] text-text-muted mb-0.5">Min Aperture (f/)</label>
          <input type="number" step="0.1" value={form.apertureMin} onChange={e => handleChange('apertureMin', parseFloat(e.target.value))}
            className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary font-mono" />
        </div>
        <div>
          <label className="block text-[10px] text-text-muted mb-0.5">Max Aperture (f/)</label>
          <input type="number" step="0.1" value={form.apertureMax} onChange={e => handleChange('apertureMax', parseFloat(e.target.value))}
            className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary font-mono" />
        </div>
        <div>
          <label className="block text-[10px] text-text-muted mb-0.5">Min WD (mm)</label>
          <input type="number" step="5" value={form.minWorkingDistanceMm} onChange={e => handleChange('minWorkingDistanceMm', parseFloat(e.target.value))}
            className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary font-mono" />
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

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-bg-panel">
            <tr className="text-text-muted uppercase border-b border-border">
              <th className="text-left py-2 px-2">Name</th>
              <th className="text-right py-2 px-2">FL mm</th>
              <th className="text-right py-2 px-2">Aperture</th>
              <th className="text-right py-2 px-2">Min WD</th>
              <th className="text-right py-2 px-2">Image Circle</th>
              <th className="text-center py-2 px-2">Type</th>
              <th className="text-right py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lenses.map(l => (
              <tr key={l.id} className="border-b border-border/50 hover:bg-bg-hover/30">
                <td className="py-1.5 px-2 font-medium text-text-primary">{l.name}</td>
                <td className="py-1.5 px-2 text-right font-mono">{l.focalLengthMm}</td>
                <td className="py-1.5 px-2 text-right font-mono">f/{l.apertureMin}–{l.apertureMax}</td>
                <td className="py-1.5 px-2 text-right font-mono">{l.minWorkingDistanceMm}</td>
                <td className="py-1.5 px-2 text-right font-mono">{l.maxImageCircleMm}</td>
                <td className="py-1.5 px-2 text-center text-text-muted">{l.isGeneric ? 'Generic' : 'Fixed'}</td>
                <td className="py-1.5 px-2 text-right whitespace-nowrap">
                  {!l.isGeneric && (
                    <button onClick={() => startEdit(l)} className="text-cyan/60 hover:text-cyan mr-2">
                      Edit
                    </button>
                  )}
                  <button onClick={() => duplicate(l)} className="text-text-muted hover:text-text-secondary mr-2">Dup</button>
                  {!l.isDefault && (
                    <button onClick={() => deleteLens(l.id)} className="text-red/60 hover:text-red">Del</button>
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
