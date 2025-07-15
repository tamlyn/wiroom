export interface SimulationDataPoint {
  age: number;
  potValue: number;
}

export interface PercentileDataPoint {
  age: number;
  [key: string]: number;
}

const generateNormalReturn = (mean: number, stdDev: number): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean / 100 + (stdDev / 100) * z0;
};

export const runMonteCarloSimulation = (
  currentAge: number,
  currentPot: number,
  annualContribution: number,
  expectedReturn: number,
  volatility: number,
  retirementAge: number,
  annualDrawdown: number,
  maxAge = 100,
  numSimulations = 1000,
): SimulationDataPoint[][] => {
  const simulations: SimulationDataPoint[][] = [];

  for (let sim = 0; sim < numSimulations; sim++) {
    const path: SimulationDataPoint[] = [];
    let pot = currentPot;

    for (let age = currentAge; age <= maxAge; age++) {
      if (age > currentAge) {
        // Generate random return based on normal distribution
        const randomReturn = generateNormalReturn(expectedReturn, volatility);

        if (age <= retirementAge) {
          pot = pot * (1 + randomReturn) + annualContribution;
        } else {
          pot = pot * (1 + randomReturn) - annualDrawdown;
        }
      }

      if (pot < 0) pot = 0;

      path.push({
        age: age,
        potValue: Math.round(pot),
      });

      if (pot === 0) break;
    }

    simulations.push(path);
  }

  return simulations;
};

export const calculatePercentiles = (
  simulations: SimulationDataPoint[][],
  percentiles = [10, 25, 50, 75, 90],
): PercentileDataPoint[] => {
  if (!simulations.length) return [];

  const maxAge = Math.max(
    ...simulations.map((sim) => sim[sim.length - 1]?.age || 0),
  );
  const minAge = simulations[0][0]?.age || 0;

  const result: PercentileDataPoint[] = [];

  for (let age = minAge; age <= maxAge; age++) {
    const valuesAtAge = simulations
      .map((sim) => sim.find((point) => point.age === age))
      .filter((point) => point !== undefined)
      .map((point) => point!.potValue)
      .sort((a, b) => a - b);

    if (valuesAtAge.length === 0) continue;

    const percentileValues: Record<string, number> = { age };
    percentiles.forEach((p) => {
      const index = Math.floor((p / 100) * (valuesAtAge.length - 1));
      percentileValues[`p${p}`] = valuesAtAge[index];
    });

    result.push(percentileValues as PercentileDataPoint);
  }

  return result;
};
