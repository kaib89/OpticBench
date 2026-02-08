import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../store/useStore';
import type { ITarget } from '../../models/target';

const emptyForm: Omit<ITarget, 'id' | 'isDefault'> = {
  name: '', widthMm: 100, heightMm: 100, depthMm: 10,
};

export default function TargetEditor() {
  const targets = useStore(s => s.targets);
  const addTarget = useStore(s => s.addTarget);
  const updateTarget = useStore(s => s.updateTarget);
  const deleteTarget = useStore(s => s.deleteTarget);
  const [editing, setEditing] = useState<ITarget | null>(null);
  const [form, setForm] = useState(emptyForm);

  const startEdit = (target: ITarget) => {
    setEditing(target);
    const { id: _id, isDefault: _d, ...rest } = target;
    setForm(rest);
  };

  const startNew = () => { setEditing(null); setForm(emptyForm); };

  const duplicate = (target: ITarget) => {
    addTarget({ ...target, id: uuidv4(), name: `${target.name} (copy)`, isDefault: false });
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      updateTarget({ ...editing, ...form });
    } else {
      addTarget({ ...form, id: uuidv4(), isDefault: false });
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
        <span className="text-sm text-text-secondary">{targets.length} targets</span>
        <button onClick={startNew} className="text-sm text-cyan hover:text-cyan/80 px-3 py-1 border border-cyan/30 rounded">
          + New Target
        </button>
      </div>

      <div className="bg-bg-input border border-border rounded p-4 mb-4 grid grid-cols-4 gap-3">
        <div className="col-span-2">
          <label className="block text-[10px] text-text-muted mb-0.5">Name</label>
          <input value={form.name} onChange={e => handleChange('name', e.target.value)}
            className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-[10px] text-text-muted mb-0.5">Width (mm)</label>
          <input type="number" step="0.1" value={form.widthMm} onChange={e => handleChange('widthMm', parseFloat(e.target.value))}
            className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary font-mono" />
        </div>
        <div>
          <label className="block text-[10px] text-text-muted mb-0.5">Height (mm)</label>
          <input type="number" step="0.1" value={form.heightMm} onChange={e => handleChange('heightMm', parseFloat(e.target.value))}
            className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary font-mono" />
        </div>
        <div>
          <label className="block text-[10px] text-text-muted mb-0.5">Depth (mm)</label>
          <input type="number" step="0.1" value={form.depthMm} onChange={e => handleChange('depthMm', parseFloat(e.target.value))}
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
              <th className="text-right py-2 px-2">Width mm</th>
              <th className="text-right py-2 px-2">Height mm</th>
              <th className="text-right py-2 px-2">Depth mm</th>
              <th className="text-right py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {targets.map(t => (
              <tr key={t.id} className="border-b border-border/50 hover:bg-bg-hover/30">
                <td className="py-1.5 px-2 font-medium text-text-primary">{t.name}</td>
                <td className="py-1.5 px-2 text-right font-mono">{t.widthMm}</td>
                <td className="py-1.5 px-2 text-right font-mono">{t.heightMm}</td>
                <td className="py-1.5 px-2 text-right font-mono">{t.depthMm}</td>
                <td className="py-1.5 px-2 text-right whitespace-nowrap">
                  <button onClick={() => startEdit(t)} className="text-cyan/60 hover:text-cyan mr-2">
                    Edit
                  </button>
                  <button onClick={() => duplicate(t)} className="text-text-muted hover:text-text-secondary mr-2">Dup</button>
                  {!t.isDefault && (
                    <button onClick={() => deleteTarget(t.id)} className="text-red/60 hover:text-red">Del</button>
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
