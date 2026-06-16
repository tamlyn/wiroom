import Slider from "rc-slider";

interface InputSliderProps {
  label: string;
  labelSuffix?: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatter?: (value: number) => string;
  valueSuffix?: React.ReactNode;
  description?: React.ReactNode;
  minLabel?: React.ReactNode;
  maxLabel?: React.ReactNode;
  className?: string;
}

export const InputSlider = ({
  label,
  labelSuffix,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatter = (v) => v.toString(),
  valueSuffix,
  description,
  minLabel,
  maxLabel,
  className = "",
}: InputSliderProps) => {
  const handleChange = (next: number | number[]) => {
    if (typeof next === "number") onChange(next);
  };

  return (
    <div className={className}>
      <div
        className={`flex justify-between items-baseline ${
          description ? "mb-[6px]" : "mb-[14px]"
        }`}
      >
        <span className="text-[15px] font-semibold text-ink">
          {label}
          {labelSuffix && (
            <span className="text-[12.5px] font-medium text-muted">
              {" "}
              {labelSuffix}
            </span>
          )}
        </span>
        <span className="text-[17px] font-bold text-ink">
          {formatter(value)}
          {valueSuffix && (
            <span className="text-[13px] font-semibold text-muted">
              {" "}
              {valueSuffix}
            </span>
          )}
        </span>
      </div>

      {description && (
        <p className="text-[12.5px] leading-[1.45] text-muted mb-[14px]">
          {description}
        </p>
      )}

      <Slider
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
