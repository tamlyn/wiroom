import { InputSlider } from "./InputSlider";
import { SegmentedControl } from "./SegmentedControl";
import { formatCurrency } from "../utils";
import { calculateStatePensionAmount } from "../state-pension";

interface CurrentSituationTabProps {
  currentAge: number;
  currentPot: number;
  sex: "male" | "female";
  statePensionContributingYears: number;
  onCurrentAgeChange: (value: number) => void;
  onCurrentPotChange: (value: number) => void;
  onSexChange: (value: "male" | "female") => void;
  onStatePensionContributingYearsChange: (value: number) => void;
}

export const CurrentSituationTab = ({
  currentAge,
  currentPot,
  sex,
  statePensionContributingYears,
  onCurrentAgeChange,
  onCurrentPotChange,
  onSexChange,
  onStatePensionContributingYearsChange,
}: CurrentSituationTabProps) => {
  const statePensionAmount = calculateStatePensionAmount(
    statePensionContributingYears,
  );

  return (
    <div>
      <h2 className="text-[19px] font-bold text-ink mb-[4px]">
        Your current situation
      </h2>
      <p className="text-[13.5px] leading-[1.5] text-muted mb-[30px]">
        A few facts about where you stand today.
      </p>

      <div className="space-y-[30px]">
        <InputSlider
          label="Current age"
          value={currentAge}
          onChange={onCurrentAgeChange}
          min={18}
          max={100}
        />

        <InputSlider
          label="Current pension pot"
          value={currentPot}
          onChange={onCurrentPotChange}
          min={0}
          max={500000}
          step={5000}
          formatter={formatCurrency}
        />

        <div>
          <div className="text-[15px] font-semibold text-ink mb-[13px]">
            Sex{" "}
            <span className="text-[12.5px] font-medium text-muted">
              · affects life expectancy
            </span>
          </div>
          <SegmentedControl
            value={sex}
            onChange={onSexChange}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />
        </div>

        <InputSlider
          label="State pension years"
          value={statePensionContributingYears}
          onChange={onStatePensionContributingYearsChange}
          min={0}
          max={35}
          valueSuffix={`· ${formatCurrency(statePensionAmount)}/yr`}
          description="10+ years for any state pension; 35 for the full amount."
          minLabel="0 yrs"
          maxLabel="35 yrs"
        />
      </div>
    </div>
  );
};
