interface FineTuneGroupProps {
  /** e.g. "Set by 60 / 40", or "Custom" once the user drags away from a preset. */
  caption: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * The bracket that ties a preset to the slider(s) it governs: a hairline rule
 * down the left with small ticks, captioned "Set by <preset>". Used by the
 * Markets approach presets and the Decisions drawdown presets.
 */
export const FineTuneGroup = ({
  caption,
  children,
  className = "",
}: FineTuneGroupProps) => {
  return (
    <div className={`relative mt-[18px] pl-[22px] ${className}`}>
      <div className="absolute left-0 top-[2px] bottom-[8px] w-px bg-line-strong" />
      <div className="absolute left-[-1px] top-[2px] w-[9px] h-px bg-line-strong" />
      <div className="absolute left-[-1px] bottom-[8px] w-[9px] h-px bg-line-strong" />

      <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-muted mb-[18px]">
        {caption}
      </div>

      {children}
    </div>
  );
};
