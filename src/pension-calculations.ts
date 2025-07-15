export interface PensionDataPoint {
  age: number;
  potValue: number;
  phase: 'Accumulation' | 'Drawdown';
}

export const calculatePensionProjection = (
  currentAge: number,
  currentPot: number,
  annualContribution: number,
  growthRate: number,
  retirementAge: number,
  annualDrawdown: number,
  maxAge = 100
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
    // After retirement: subtract drawdowns and add growth
    else {
      pot = pot * (1 + growthRate / 100) - annualDrawdown;
    }

    // Stop if pot reaches zero
    if (pot < 0) {
      pot = 0;
    }

    data.push({
      age: age,
      potValue: Math.round(pot),
      phase: age < retirementAge ? 'Accumulation' : 'Drawdown'
    });

    // Stop projecting if pot is depleted in drawdown phase
    if (pot === 0 && age >= retirementAge) break;
  }

  return data;
};