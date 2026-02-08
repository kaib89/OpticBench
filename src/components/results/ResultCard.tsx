interface ResultCardProps {
  label: string;
  value: string;
  unit?: string;
  status?: 'ok' | 'warning' | 'error' | 'info';
}

const statusColors = {
  ok: 'border-green/30 bg-green/5',
  warning: 'border-yellow/30 bg-yellow/5',
  error: 'border-red/30 bg-red/5',
  info: 'border-border bg-transparent',
};

const statusDot = {
  ok: 'bg-green',
  warning: 'bg-yellow',
  error: 'bg-red',
  info: 'bg-text-muted',
};

export default function ResultCard({ label, value, unit, status = 'info' }: ResultCardProps) {
  return (
    <div className={`border rounded px-3 py-2 ${statusColors[status]}`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <div className={`w-1.5 h-1.5 rounded-full ${statusDot[status]}`} />
        <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-mono font-semibold text-text-primary">{value}</span>
        {unit && <span className="text-xs text-text-muted">{unit}</span>}
      </div>
    </div>
  );
}
