import { useState } from "react";

interface InfoPopupProps {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * A label with a small squared "i" marker that reveals an explanatory popup.
 * Opens on hover (mouse) or click/tap (also touch), and stays pinned open once
 * clicked until clicked again. Anchored right so it stays within the card edge.
 */
export const InfoPopup = ({
  label,
  children,
  className = "",
}: InfoPopupProps) => {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || pinned;

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={() => setPinned((value) => !value)}
        aria-label="What does this mean?"
        aria-expanded={open}
        className="inline-flex items-center gap-[6px] text-[12.5px] text-muted cursor-help"
      >
        {label}
        <span className="inline-flex items-center justify-center w-[14px] h-[14px] border border-line-strong text-[9px] font-bold leading-none">
          i
        </span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-[8px] z-20 w-[260px] bg-ink text-white text-[12px] leading-[1.5] p-[13px] text-left normal-case font-normal tracking-normal"
          style={{ boxShadow: "0 8px 24px rgba(21,24,30,0.18)" }}
        >
          {children}
        </div>
      )}
    </span>
  );
};
