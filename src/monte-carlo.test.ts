import { describe, it, expect } from "vitest";
import {
  runMonteCarloSimulation,
  calculateMortalityAdjustedPercentiles,
  calculateRunOutChance,
  type SimulationDataPoint,
} from "./monte-carlo";

// Build one simulation: ages startAge..startAge+potValues.length-1, one point
// per year, all sharing the same deathAge. retirementAge defaults to startAge,
// so by default every point is in the Drawdown phase.
const makeSim = (
  startAge: number,
  potValues: number[],
  deathAge: number,
  retirementAge: number = startAge,
): SimulationDataPoint[] =>
  potValues.map((potValue, i) => {
    const age = startAge + i;
    return {
      age,
      potValue,
      phase: age < retirementAge ? "Accumulation" : "Drawdown",
      deathAge,
    };
  });

describe("calculateMortalityAdjustedPercentiles", () => {
  it("returns [] for no simulations", () => {
    expect(calculateMortalityAdjustedPercentiles([])).toEqual([]);
  });

  it("computes percentiles per age using the floor((p/100)*(n-1)) index", () => {
    // 5 simulations across ages 60, 61, 62.
    // age 60 values: all 100
    // age 61 values: 10,20,30,40,50  -> indices [0,1,2,3,3] -> 10,20,30,40,40
    // age 62 values: 0,0,0,500,1000  -> sorted same -> p50=0, p75=500, p95=500
    const sims = [
      makeSim(60, [100, 10, 0], 100),
      makeSim(60, [100, 20, 0], 100),
      makeSim(60, [100, 30, 0], 100),
      makeSim(60, [100, 40, 500], 100),
      makeSim(60, [100, 50, 1000], 100),
    ];

    const result = calculateMortalityAdjustedPercentiles(
      sims,
      [5, 25, 50, 75, 95],
    );

    expect(result.map((r) => r.age)).toEqual([60, 61, 62]);

    const age61 = result.find((r) => r.age === 61)!;
    expect(age61).toEqual({
      age: 61,
      p5: 10,
      p25: 20,
      p50: 30,
      p75: 40,
      p95: 40,
    });

    const age62 = result.find((r) => r.age === 62)!;
    expect(age62.p50).toBe(0);
    expect(age62.p75).toBe(500);
    expect(age62.p95).toBe(500);
  });

  it("respects a custom percentile list", () => {
    const sims = [
      makeSim(70, [10], 100),
      makeSim(70, [20], 100),
      makeSim(70, [30], 100),
    ];
    const result = calculateMortalityAdjustedPercentiles(sims, [50]);
    // n=3, p50 -> floor(0.5*2)=1 -> middle value 20
    expect(result).toEqual([{ age: 70, p50: 20 }]);
  });
});

describe("calculateRunOutChance", () => {
  it("returns 0 for no simulations", () => {
    expect(calculateRunOutChance([])).toBe(0);
  });

  it("counts a simulation that hits £0 at or before death", () => {
    const sims = [
      // depletes at 66, death at 80 -> counts
      makeSim(65, [100, 0, 0], 80),
      // never depletes -> does not count
      makeSim(65, [100, 100, 100], 80),
      // hits 0 at 67 but death at 66 -> after death -> does not count
      makeSim(65, [100, 100, 0], 66),
      // never depletes -> does not count
      makeSim(65, [50, 50, 50], 80),
    ];
    // 1 of 4 -> 25%
    expect(calculateRunOutChance(sims)).toBe(25);
  });

  it("does not count an accumulation-phase £0 balance as running out", () => {
    // £0 starting pot at age 30, retiring at 65, dying at 80.
    // Every point shown here is in the Accumulation phase.
    const sims = [makeSim(30, [0, 8000, 16000], 80, 65)];
    expect(calculateRunOutChance(sims)).toBe(0);
  });
});

describe("runMonteCarloSimulation (structural invariants)", () => {
  it("produces simulations spanning startingAge..maxAge with one point per year", () => {
    const sims = runMonteCarloSimulation({
      startingAge: 50,
      startingPot: 100000,
      annualContribution: 5000,
      returnRange: [4, 5],
      volatility: 10,
      retirementAge: 65,
      annualDrawdown: 30000,
      sex: "male",
      statePensionAmount: 11973,
      maxAge: 90,
      numSimulations: 20,
    });

    expect(sims).toHaveLength(20);
    for (const sim of sims) {
      expect(sim[0].age).toBe(50);
      expect(sim[sim.length - 1].age).toBe(90);
      expect(sim).toHaveLength(41); // ages 50..90 inclusive
      for (let i = 0; i < sim.length; i++) {
        expect(sim[i].age).toBe(50 + i);
        expect(Number.isInteger(sim[i].potValue)).toBe(true);
        expect(sim[i].potValue).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
