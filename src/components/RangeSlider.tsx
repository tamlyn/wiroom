import Slider from "rc-slider";
import "rc-slider/assets/index.css";

interface RangeSliderProps {
  label: string;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  formatter?: (value: number) => string;
  description?: string;
  className?: string;
}

export const RangeSlider = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatter = (v) => v.toString(),
  description,
  className = "",
}: RangeSliderProps) => {
  const handleChange = (newValue: number | number[]) => {
    if (Array.isArray(newValue) && newValue.length === 2) {
      onChange([newValue[0], newValue[1]]);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}:{" "}
        <span className="font-bold text-blue-600">
          {formatter(value[0])} to {formatter(value[1])}
        </span>
        {description && (
          <span className="text-xs text-gray-500 ml-2">{description}</span>
        )}
      </label>
      <div className="px-2 py-4">
        <Slider
          range
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          styles={{
            track: { backgroundColor: "#3b82f6" },
            handle: {
              borderColor: "#3b82f6",
              backgroundColor: "#3b82f6",
            },
            rail: { backgroundColor: "#e5e7eb" },
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{formatter(min)}</span>
        <span>{formatter(max)}</span>
      </div>
    </div>
  );
};
