import { InputSlider } from "./InputSlider";
import { InfoButton } from "./InfoButton";
import { formatCurrency } from "../utils";

interface CurrentSituationTabProps {
  currentAge: number;
  currentPot: number;
  sex: "male" | "female";
  onCurrentAgeChange: (value: number) => void;
  onCurrentPotChange: (value: number) => void;
  onSexChange: (value: "male" | "female") => void;
}

export const CurrentSituationTab = ({
  currentAge,
  currentPot,
  sex,
  onCurrentAgeChange,
  onCurrentPotChange,
  onSexChange,
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

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sex</label>
          <InfoButton content="Biological sex affects life expectancy and is used for mortality modeling in the projections." />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sex"
              value="male"
              checked={sex === "male"}
              onChange={(e) => onSexChange(e.target.value as "male" | "female")}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700">Male</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sex"
              value="female"
              checked={sex === "female"}
              onChange={(e) => onSexChange(e.target.value as "male" | "female")}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700">Female</span>
          </label>
        </div>
      </div>
    </div>
  );
};
