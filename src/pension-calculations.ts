import { isEligibleForStatePension } from "./state-pension";
import { pickFromNormalDistribution } from "./utils.ts";

type PensionDataPoint = {
  age: number;
  potValue: number;
  phase: "Accumulation" | "Drawdown";
  deathAge: number;
};

type PensionProjectionInput = {
  startingAge: number;
  startingPot: number;
  annualContribution: number;
  growthRate: number;
  volatility: number;
  retirementAge: number;
  annualDrawdown: number;
  statePensionAmount: number;
  maxAge?: number;
  deathAge: number;
};

export const calculatePensionProjection = ({
  startingAge,
  startingPot,
  annualContribution,
  growthRate,
  volatility,
  retirementAge,
  annualDrawdown,
  statePensionAmount,
  deathAge,
  maxAge = 100,
}: PensionProjectionInput): PensionDataPoint[] => {
  const data: PensionDataPoint[] = [];
  let pot = startingPot;

  for (let age = startingAge; age <= maxAge; age++) {
    const randomReturn = pickFromNormalDistribution(
      growthRate / 100,
      volatility,
    );

    if (age < retirementAge) {
      pot = pot * (1 + randomReturn) + annualContribution;
    } else {
      pot = pot * (1 + randomReturn) - annualDrawdown;
    }

    if (isEligibleForStatePension(age, startingAge)) {
      pot = pot + statePensionAmount;
    }

    if (pot < 0) pot = 0;

    // Stop if pot reaches zero
    if (pot < 0) {
      pot = 0;
    }

    data.push({
      age: age,
      potValue: Math.round(pot),
      phase: age < retirementAge ? "Accumulation" : "Drawdown",
      deathAge,
    });

    // Continue simulation even if pot is 0 or person has died to avoid survival bias
  }

  return data;
};
