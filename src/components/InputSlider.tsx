interface InputSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatter?: (value: number) => string;
  description?: string;
  className?: string;
}

export const InputSlider = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatter = (v) => v.toString(),
  description,
  className = "",
}: InputSliderProps) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}:{" "}
        <span className="font-bold text-blue-600">{formatter(value)}</span>
        {description && (
          <span className="text-xs text-gray-500 ml-2">{description}</span>
        )}
      </label>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        min={min}
        max={max}
        step={step}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{formatter(min)}</span>
        <span>{formatter(max)}</span>
      </div>
    </div>
  );
};
