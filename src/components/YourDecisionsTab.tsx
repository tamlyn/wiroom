import { InputSlider } from "./InputSlider";
import { InfoButton } from "./InfoButton";
import { CollapsibleSection } from "./CollapsibleSection";
import { formatCurrency } from "../utils";
import { CURRENT_FULL_STATE_PENSION_ANNUAL } from "../state-pension";

interface YourDecisionsTabProps {
  currentAge: number;
  annualContribution: number;
  retirementAge: number;
  annualDrawdown: number;
  onAnnualContributionChange: (value: number) => void;
  onRetirementAgeChange: (value: number) => void;
  onAnnualDrawdownChange: (value: number) => void;
}

const LIVING_STANDARD_PRESETS = [
  { name: "Minimum", single: 13400, couple: 21600 },
  { name: "Moderate", single: 31700, couple: 43900 },
  { name: "Comfortable", single: 43900, couple: 60600 },
];

export const YourDecisionsTab = ({
  currentAge,
  annualContribution,
  retirementAge,
  annualDrawdown,
  onAnnualContributionChange,
  onRetirementAgeChange,
  onAnnualDrawdownChange,
}: YourDecisionsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-gray-800">
          Your Decisions
        </h3>
        <InfoButton content="These are the factors you can control to improve your retirement outcomes. Small changes can have big impacts over time." />
      </div>

      <InputSlider
        label="Annual Contribution"
        value={annualContribution}
        onChange={onAnnualContributionChange}
        min={0}
        max={50000}
        step={500}
        formatter={(value) => formatCurrency(value)}
        description={`($${Math.round(annualContribution / 12).toLocaleString()} per month)`}
      />

      <InputSlider
        label="Retirement Age"
        value={retirementAge}
        onChange={onRetirementAgeChange}
        min={currentAge + 1}
        max={100}
        formatter={(value) => value.toString()}
        description={`(${retirementAge - currentAge} years from now)`}
      />

      <div>
        <InputSlider
          label="Annual Drawdown in Retirement"
          value={annualDrawdown}
          onChange={onAnnualDrawdownChange}
          min={0}
          max={100000}
          step={1000}
          formatter={(value) => formatCurrency(value)}
          description={`($${Math.round(annualDrawdown / 12).toLocaleString()} per month)`}
        />
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-1.5">
            UK Retirement Living Standards (single):
          </p>
          <div className="flex gap-2 flex-wrap">
            {LIVING_STANDARD_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onAnnualDrawdownChange(preset.single)}
                className="px-2.5 py-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200 transition-colors"
              >
                {preset.name} ({formatCurrency(preset.single)})
              </button>
            ))}
          </div>
        </div>
      </div>

      <CollapsibleSection title="Optimization Tips">
        <div className="text-xs text-gray-700 space-y-1">
          <p>
            • Increasing contributions by even £100/month can significantly
            impact your retirement
          </p>
          <p>
            • Delaying retirement by 1-2 years can dramatically improve outcomes
          </p>
          <p>
            • Consider the 4% rule: annual drawdown of 4% of initial pot often
            lasts 30+ years
          </p>
          <p>
            • State pension: Full UK state pension is currently{" "}
            {formatCurrency(CURRENT_FULL_STATE_PENSION_ANNUAL)}/year
          </p>
          <p>
            • Withdrawal rate colors:{" "}
            <span className="text-green-600">green ≤4%</span>,{" "}
            <span className="text-amber-600">amber 4-6%</span>,{" "}
            <span className="text-red-600">red &gt;6%</span>
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
};
