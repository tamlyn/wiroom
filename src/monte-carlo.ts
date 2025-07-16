export interface SimulationDataPoint {
  age: number;
  potValue: number;
  deathAge?: number;
}

export interface PercentileDataPoint {
  age: number;
  [key: string]: number;
}

import { generateRandomDeathAge, type Sex } from "./mortality";
import { isEligibleForStatePension } from "./state-pension";

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
  sex: Sex,
  statePensionAmount: number,
  maxAge = 100,
  numSimulations = 1000,
): SimulationDataPoint[][] => {
  const simulations: SimulationDataPoint[][] = [];

  for (let sim = 0; sim < numSimulations; sim++) {
    const path: SimulationDataPoint[] = [];
    let pot = currentPot;
    const deathAge = generateRandomDeathAge(currentAge, sex);

    for (let age = currentAge; age <= maxAge; age++) {
      if (age > currentAge && age < deathAge) {
        // Generate random return based on normal distribution
        const randomReturn = generateNormalReturn(expectedReturn, volatility);

        if (age < retirementAge) {
          pot = pot * (1 + randomReturn) + annualContribution;
        } else {
          pot = pot * (1 + randomReturn) - annualDrawdown;
        }

        if (isEligibleForStatePension(age, currentAge)) {
          pot = pot + statePensionAmount;
        }
      }

      if (pot < 0) pot = 0;

      // After death, pot stays at 0 to avoid survival bias
      if (age >= deathAge) {
        pot = 0;
      }

      path.push({
        age: age,
        potValue: Math.round(pot),
        deathAge: deathAge,
      });

      // Continue simulation even if pot is 0 or person has died to avoid survival bias
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
      .map((sim) => sim.find((point) => point.age === age)?.potValue || 0)
      .sort((a, b) => a - b);

    const percentileValues: Record<string, number> = { age };
    percentiles.forEach((p) => {
      const index = Math.floor((p / 100) * (valuesAtAge.length - 1));
      percentileValues[`p${p}`] = valuesAtAge[index];
    });

    result.push(percentileValues as PercentileDataPoint);
  }

  return result;
};

export const calculateMortalityAdjustedPercentiles = (
  simulations: SimulationDataPoint[][],
  percentiles = [5, 25, 50, 75, 95],
): PercentileDataPoint[] => {
  if (!simulations.length) return [];

  const maxAge = Math.max(
    ...simulations.map((sim) => sim[sim.length - 1]?.age || 0),
  );
  const minAge = simulations[0][0]?.age || 0;

  const result: PercentileDataPoint[] = [];
  const minSampleSize = Math.max(20, Math.floor(simulations.length * 0.02)); // At least 20 or 2% of simulations

  for (let age = minAge; age <= maxAge; age++) {
    // Get all simulations that are alive at this age
    const aliveSimulations = simulations.filter((sim) => {
      const point = sim.find((p) => p.age === age);
      return point && point.deathAge && age < point.deathAge;
    });

    // Stop calculating percentiles if too few people are alive to get stable results
    if (aliveSimulations.length < minSampleSize) {
      break;
    }

    const valuesAtAge = aliveSimulations
      .map((sim) => sim.find((point) => point.age === age)?.potValue || 0)
      .sort((a, b) => a - b);

    const percentileValues: PercentileDataPoint = { age };
    percentiles.forEach((p) => {
      const index = Math.floor((p / 100) * (valuesAtAge.length - 1));
      percentileValues[`p${p}`] = valuesAtAge[index];
    });

    result.push(percentileValues);
  }

  return result;
};
