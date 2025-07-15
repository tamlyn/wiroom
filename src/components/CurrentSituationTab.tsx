import { InputSlider } from './InputSlider';
import { formatCurrency } from '../utils';

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
  onCurrentPotChange
}: CurrentSituationTabProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Current Situation</h3>
      <p className="text-sm text-gray-600 mb-4">These are the facts about where you are today.</p>

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