interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Stretch options to fill the width (presets) vs. hug their content (sex). */
  fullWidth?: boolean;
  className?: string;
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  fullWidth = false,
  className = "",
}: SegmentedControlProps<T>) => {
  return (
    <div
      className={`flex border border-line-strong ${
        fullWidth ? "w-full" : "w-fit"
      } ${className}`}
    >
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "text-[14px] transition-colors",
              fullWidth ? "flex-1 text-center py-[10px]" : "px-[26px] py-[9px]",
              index > 0 && !active ? "border-l border-line-strong" : "",
              active
                ? "bg-ink text-white font-bold"
                : "text-inksoft font-medium hover:bg-[rgba(21,24,30,0.04)]",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
