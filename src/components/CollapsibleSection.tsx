import { useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  /** Add the hairline rule + spacing above the trigger (editorial separator). */
  topRule?: boolean;
  className?: string;
}

export const CollapsibleSection = ({
  title,
  children,
  defaultExpanded = false,
  topRule = false,
  className = "",
}: CollapsibleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`${
        topRule ? "mt-[30px] pt-[22px] border-t border-line" : ""
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-[7px] text-[13.5px] font-semibold text-accent"
      >
        {title}
        <svg
          className={`w-[14px] h-[14px] transition-transform ${
            isExpanded ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 6l6 6-6 6"
          />
        </svg>
      </button>
      {isExpanded && (
        <div className="mt-[14px] text-[12.5px] leading-[1.55] text-inksoft space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};
