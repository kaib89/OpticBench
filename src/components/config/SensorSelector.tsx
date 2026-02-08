import { useStore } from '../../store/useStore';
import { getPixelsH, getPixelsV } from '../../models/sensor';

export default function SensorSelector() {
  const sensors = useStore(s => s.sensors);
  const sensorId = useStore(s => s.config.sensorId);
  const selectSensor = useStore(s => s.selectSensor);

  return (
    <div className="mb-4">
      <label className="block text-xs text-text-secondary mb-1 font-medium uppercase tracking-wider">Sensor</label>
      <select
        value={sensorId ?? ''}
        onChange={(e) => selectSensor(e.target.value)}
        className="w-full bg-bg-input border border-border rounded px-3 py-2 text-sm text-text-primary focus:border-border-focus focus:outline-none cursor-pointer"
      >
        <option value="" disabled>Select sensor...</option>
        {sensors.map(s => (
          <option key={s.id} value={s.id}>
            {s.name} – {s.resolutionMp}MP – {s.pixelSizeMicron}µm – {getPixelsH(s)}×{getPixelsV(s)}
          </option>
        ))}
      </select>
    </div>
  );
}
