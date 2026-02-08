import { useState, useEffect } from 'react';

interface ParameterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  disabled?: boolean;
}

export default function ParameterSlider({
  label, value, min, max, step, unit, onChange, formatValue, disabled,
}: ParameterSliderProps) {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(formatValue ? formatValue(value) : String(value));
  }, [value, formatValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    } else {
      setInputValue(formatValue ? formatValue(value) : String(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="mb-3">
      <label className="block text-xs text-text-secondary mb-1 font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="flex-1"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="w-16 bg-bg-input border border-border rounded px-2 py-1 text-right text-sm font-mono text-text-primary focus:border-border-focus focus:outline-none"
          />
          <span className="text-xs text-text-muted w-6">{unit}</span>
        </div>
      </div>
    </div>
  );
}
