import Slider from "rc-slider";

interface RangeSliderProps {
  label: string;
  labelSuffix?: React.ReactNode;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  formatter?: (value: number) => string;
  valueLabel?: React.ReactNode;
  minLabel?: React.ReactNode;
  maxLabel?: React.ReactNode;
  className?: string;
}

export const RangeSlider = ({
  label,
  labelSuffix,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatter = (v) => v.toString(),
  valueLabel,
  minLabel,
  maxLabel,
  className = "",
}: RangeSliderProps) => {
  const handleChange = (next: number | number[]) => {
    if (Array.isArray(next) && next.length === 2) {
      onChange([next[0], next[1]]);
    }
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-baseline mb-[14px]">
        <span className="text-[15px] font-semibold text-ink">
          {label}
          {labelSuffix && (
            <span className="text-[12.5px] font-medium text-muted">
              {" "}
              {labelSuffix}
            </span>
          )}
        </span>
        <span className="text-[17px] font-bold text-ink whitespace-nowrap">
          {valueLabel ?? `${formatter(value[0])} – ${formatter(value[1])}`}
        </span>
      </div>

      <Slider
        range
        className="wiroom-slider"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
      />

      <div className="flex justify-between mt-[9px] text-[12.5px] text-muted">
        <span>{minLabel ?? formatter(min)}</span>
        <span>{maxLabel ?? formatter(max)}</span>
      </div>
    </div>
  );
};
