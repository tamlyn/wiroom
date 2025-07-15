import { InputSlider } from "./InputSlider";
import { InfoButton } from "./InfoButton";
import { formatCurrency } from "../utils";

interface CurrentSituationTabProps {
  currentAge: number;
  currentPot: number;
  onCurrentAgeChange: (value: number) => void;
  onCurrentPotChange: (value: number) => void;
}

export const CurrentSituationTab = ({
  currentAge,
  currentPot,
  onCurrentAgeChange,
  onCurrentPotChange,
}: CurrentSituationTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-gray-800">
          Your Current Situation
        </h3>
        <InfoButton content="These are the facts about where you are today. Your current age and existing pension pot value." />
      </div>

      <InputSlider
        label="Current Age"
        value={currentAge}
        onChange={onCurrentAgeChange}
        min={18}
        max={100}
        formatter={(value) => value.toString()}
      />

      <InputSlider
        label="Current Pension Pot"
        value={currentPot}
        onChange={onCurrentPotChange}
        min={0}
        max={500000}
        step={5000}
        formatter={(value) => formatCurrency(value)}
      />
    </div>
  );
};
