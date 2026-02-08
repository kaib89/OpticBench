import { useStore } from '../../store/useStore';
import type { ViewAxis } from '../../models/config';

const axes: { key: ViewAxis; label: string; shortcut: string }[] = [
  { key: 'horizontal', label: 'H', shortcut: '1' },
  { key: 'vertical', label: 'V', shortcut: '2' },
  { key: 'diagonal', label: 'D', shortcut: '3' },
];

export default function AxisToggle() {
  const viewAxis = useStore(s => s.config.viewAxis);
  const setViewAxis = useStore(s => s.setViewAxis);

  return (
    <div className="flex items-center gap-1">
      {axes.map(a => (
        <button
          key={a.key}
          onClick={() => setViewAxis(a.key)}
          title={`${a.key} axis (${a.shortcut})`}
          className={`px-3 py-1 text-xs font-mono font-semibold rounded transition-all ${
            viewAxis === a.key
              ? 'bg-cyan/20 text-cyan border border-cyan/40'
              : 'bg-bg-input text-text-muted border border-border hover:text-text-secondary hover:border-border'
          }`}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
