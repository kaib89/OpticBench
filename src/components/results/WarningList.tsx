import type { IWarning } from '../../models/config';

interface WarningListProps {
  warnings: IWarning[];
}

const icons: Record<IWarning['type'], string> = {
  error: '⛔',
  warning: '⚠️',
  info: 'ℹ️',
};

const colors: Record<IWarning['type'], string> = {
  error: 'border-red/30 bg-red/5 text-red',
  warning: 'border-yellow/30 bg-yellow/5 text-yellow',
  info: 'border-border bg-bg-input text-text-secondary',
};

export default function WarningList({ warnings }: WarningListProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Warnings</h3>
      <div className="space-y-1.5">
        {warnings.map((w, i) => (
          <div key={i} className={`border rounded px-3 py-2 text-xs ${colors[w.type]}`}>
            <span className="mr-1.5">{icons[w.type]}</span>
            {w.message}
          </div>
        ))}
      </div>
    </div>
  );
}
