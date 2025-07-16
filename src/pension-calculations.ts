export interface PensionDataPoint {
  age: number;
  potValue: number;
  phase: "Accumulation" | "Drawdown";
}

import { isEligibleForStatePension } from "./state-pension";

export const calculatePensionProjection = (
  currentAge: number,
  currentPot: number,
  annualContribution: number,
  growthRate: number,
  retirementAge: number,
  annualDrawdown: number,
  statePensionAmount: number,
  maxAge = 100,
): PensionDataPoint[] => {
  const data: PensionDataPoint[] = [];
  let pot = currentPot;

  for (let age = currentAge; age <= maxAge; age++) {
    // Before retirement: add contributions and growth
    if (age < retirementAge) {
      if (age > currentAge) {
        pot = pot * (1 + growthRate / 100) + annualContribution;
      }
    }
    // After retirement: subtract drawdowns, add growth, and add state pension if eligible
    else {
      pot = pot * (1 + growthRate / 100) - annualDrawdown;
      if (isEligibleForStatePension(age, currentAge)) {
        pot = pot + statePensionAmount;
      }
    }

    // Stop if pot reaches zero
    if (pot < 0) {
      pot = 0;
    }

    data.push({
      age: age,
      potValue: Math.round(pot),
      phase: age < retirementAge ? "Accumulation" : "Drawdown",
    });

    // Stop projecting if pot is depleted in drawdown phase
    if (pot === 0 && age >= retirementAge) break;
  }

  return data;
};
