import { InputSlider } from "./InputSlider";
import { FineTuneGroup } from "./FineTuneGroup";
import { formatCurrency } from "../utils";
import { LIVING_STANDARDS, matchLivingStandard } from "../presets";

interface YourDecisionsTabProps {
  currentAge: number;
  annualContribution: number;
  retirementAge: number;
  annualDrawdown: number;
  onAnnualContributionChange: (value: number) => void;
  onRetirementAgeChange: (value: number) => void;
  onAnnualDrawdownChange: (value: number) => void;
}

const perMonth = (annual: number) =>
  `· £${Math.round(annual / 12).toLocaleString()}/mo`;

export const YourDecisionsTab = ({
  currentAge,
  annualContribution,
  retirementAge,
  annualDrawdown,
  onAnnualContributionChange,
  onRetirementAgeChange,
  onAnnualDrawdownChange,
}: YourDecisionsTabProps) => {
  const activeStandard = matchLivingStandard(annualDrawdown);
  const yearsToRetirement = retirementAge - currentAge;

  return (
    <div>
      <h2 className="text-[19px] font-bold text-ink mb-[4px]">
        The choices you can make
      </h2>
      <p className="text-[13.5px] leading-[1.5] text-muted mb-[30px]">
        These are the levers in your control. Try them and watch the run-out
        chance respond.
      </p>

      <div className="space-y-[30px]">
        <InputSlider
          label="Annual contribution"
          value={annualContribution}
          onChange={onAnnualContributionChange}
          min={0}
          max={50000}
          step={500}
          formatter={formatCurrency}
          valueSuffix={perMonth(annualContribution)}
          description="Including any tax relief."
        />

        <InputSlider
          label="Retirement age"
          value={retirementAge}
          onChange={onRetirementAgeChange}
          min={currentAge + 1}
          max={100}
          valueSuffix={`· in ${yearsToRetirement} ${
            yearsToRetirement === 1 ? "year" : "years"
          }`}
          minLabel={String(currentAge + 1)}
          maxLabel="100"
        />

        <div>
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-muted mb-[11px]">
            Drawdown presets
          </div>
          <div className="flex border border-line-strong">
            {LIVING_STANDARDS.map((standard, index) => {
              const active = annualDrawdown === standard.single;
              return (
                <button
                  key={standard.name}
                  type="button"
                  onClick={() => onAnnualDrawdownChange(standard.single)}
                  className={`flex-1 text-left px-[12px] py-[11px] transition-colors ${
                    index > 0 && !active ? "border-l border-line-strong" : ""
                  } ${active ? "bg-ink" : "hover:bg-[rgba(21,24,30,0.04)]"}`}
                >
                  <div
                    className={`text-[13px] font-semibold ${
                      active ? "text-[#B7C0CC]" : "text-inksoft"
                    }`}
                  >
                    {standard.name}
                  </div>
                  <div
                    className={`text-[14px] font-bold mt-[2px] ${
                      active ? "text-white" : "text-ink"
                    }`}
                  >
                    {formatCurrency(standard.single)}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="text-[11.5px] text-muted mt-[8px]">
            UK retirement living standards · single person.
          </div>

          <FineTuneGroup
            caption={
              activeStandard ? (
                <>
                  Set by <span className="text-ink">{activeStandard.name}</span>
                </>
              ) : (
                "Custom"
              )
            }
          >
            <InputSlider
              label="Annual drawdown in retirement"
              value={annualDrawdown}
              onChange={onAnnualDrawdownChange}
              min={0}
              max={100000}
              step={1000}
              formatter={formatCurrency}
              valueSuffix={perMonth(annualDrawdown)}
              description="In today's money."
            />
          </FineTuneGroup>
        </div>
      </div>
    </div>
  );
};
