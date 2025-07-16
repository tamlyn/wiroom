import { calculatePensionProjection } from "./pension-calculations";

describe("calculatePensionProjection", () => {
  describe("Basic Functionality", () => {
    test("should return initial state at current age", () => {
      const result = calculatePensionProjection({
        startingAge: 30,
        startingPot: 50000,
        annualContribution: 10000,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      expect(result[0]).toEqual({
        age: 30,
        potValue: 50000,
        phase: "Accumulation",
      });
    });

    test("should grow pot with contributions before retirement", () => {
      const result = calculatePensionProjection({
        startingAge: 30,
        startingPot: 50000,
        annualContribution: 10000,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // Year 1: 50000 * 1.05 + 10000 = 62500
      expect(result[1]).toEqual({
        age: 31,
        potValue: 62500,
        phase: "Accumulation",
      });

      // Year 2: 62500 * 1.05 + 10000 = 75625
      expect(result[2]).toEqual({
        age: 32,
        potValue: 75625,
        phase: "Accumulation",
      });
    });

    test("should switch to drawdown phase at retirement age", () => {
      const result = calculatePensionProjection({
        startingAge: 63,
        startingPot: 100000,
        annualContribution: 10000,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // Age 63: Accumulation
      expect(result[0].phase).toBe("Accumulation");

      // Age 64: Still accumulation (100000 * 1.05 + 10000 = 115000)
      expect(result[1]).toEqual({
        age: 64,
        potValue: 115000,
        phase: "Accumulation",
      });

      // Age 65: Retirement - switches to drawdown (115000 * 1.05 - 30000 = 90750)
      expect(result[2]).toEqual({
        age: 65,
        potValue: 90750,
        phase: "Drawdown",
      });

      // Age 66: Second year of drawdown (90750 * 1.05 - 30000 = 65288)
      expect(result[3]).toEqual({
        age: 66,
        potValue: 65288,
        phase: "Drawdown",
      });
    });

    test("should handle immediate retirement", () => {
      const result = calculatePensionProjection({
        startingAge: 65,
        startingPot: 500000,
        annualContribution: 10000,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 40000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // Already at retirement age - immediately in drawdown phase
      expect(result[0]).toEqual({
        age: 65,
        potValue: 485000, // 500000 * 1.05 - 40000
        phase: "Drawdown",
      });

      // Next year continues drawdown
      expect(result[1]).toEqual({
        age: 66,
        potValue: 469250, // 485000 * 1.05 - 40000
        phase: "Drawdown",
      });
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    test("should handle zero growth rate", () => {
      const result = calculatePensionProjection({
        startingAge: 30,
        startingPot: 50000,
        annualContribution: 10000,
        growthRate: 0,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // No growth, just contributions
      expect(result[1].potValue).toBe(60000); // 50000 + 10000
      expect(result[2].potValue).toBe(70000); // 60000 + 10000
    });

    test("should handle negative growth rate", () => {
      const result = calculatePensionProjection({
        startingAge: 30,
        startingPot: 100000,
        annualContribution: 5000,
        growthRate: -2,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // Year 1: 100000 * 0.98 + 5000 = 103000
      expect(result[1].potValue).toBe(103000);
      // Year 2: 103000 * 0.98 + 5000 = 105940
      expect(result[2].potValue).toBe(105940);
    });

    test("should handle zero contributions", () => {
      const result = calculatePensionProjection({
        startingAge: 30,
        startingPot: 100000,
        annualContribution: 0,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // Just growth, no contributions
      expect(result[1].potValue).toBe(105000); // 100000 * 1.05
      expect(result[2].potValue).toBe(110250); // 105000 * 1.05
    });

    test("should handle zero drawdown", () => {
      const result = calculatePensionProjection({
        startingAge: 63,
        startingPot: 100000,
        annualContribution: 5000,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 0,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // At retirement, pot should continue growing
      const retirementEntry = result.find((entry) => entry.age === 65);
      const nextEntry = result.find((entry) => entry.age === 66);

      expect(retirementEntry?.phase).toBe("Drawdown");
      expect(nextEntry?.potValue).toBeGreaterThan(retirementEntry!.potValue);
    });

    test("should handle very high drawdown that depletes pot immediately", () => {
      const result = calculatePensionProjection({
        startingAge: 65,
        startingPot: 50000,
        annualContribution: 0,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 60000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // Starting at retirement with 50k, drawing 60k/year
      // Year 1: 50000 * 1.05 - 60000 = -7500 -> 0
      expect(result[0]).toEqual({
        age: 65,
        potValue: 0,
        phase: "Drawdown",
      });

      // Should stop after pot hits zero
      expect(result.length).toBe(1);
    });

    test("should handle retirement age past maxAge", () => {
      const result = calculatePensionProjection({
        startingAge: 30,
        startingPot: 50000,
        annualContribution: 10000,
        growthRate: 5,
        volatility: 0,
        retirementAge: 150,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
        maxAge: 100,
      });

      // Should never reach drawdown phase
      const allAccumulation = result.every(
        (entry) => entry.phase === "Accumulation",
      );
      expect(allAccumulation).toBe(true);
      expect(result[result.length - 1].age).toBe(100);
    });

    test("should handle current age equal to maxAge", () => {
      const result = calculatePensionProjection({
        startingAge: 80,
        startingPot: 100000,
        annualContribution: 5000,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
        maxAge: 80,
      });

      // Should only have one entry
      expect(result.length).toBe(1);
      expect(result[0].age).toBe(80);
    });

    test("should handle current age greater than maxAge", () => {
      const result = calculatePensionProjection({
        startingAge: 85,
        startingPot: 100000,
        annualContribution: 5000,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
        maxAge: 80,
      });

      // Should have no entries since current age > maxAge
      expect(result.length).toBe(0);
    });
  });

  describe("Mathematical Precision and Rounding", () => {
    test("should round pot values to nearest integer", () => {
      const result = calculatePensionProjection({
        startingAge: 30,
        startingPot: 50000,
        annualContribution: 10000,
        growthRate: 5.5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // All pot values should be integers
      result.forEach((entry) => {
        expect(Number.isInteger(entry.potValue)).toBe(true);
      });
    });

    test("should handle fractional interest rates correctly", () => {
      const result = calculatePensionProjection({
        startingAge: 30,
        startingPot: 10000,
        annualContribution: 1000,
        growthRate: 3.75,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 20000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // Year 1: 10000 * 1.0375 + 1000 = 11375
      expect(result[1].potValue).toBe(11375);
    });

    test("should handle very small pot values", () => {
      const result = calculatePensionProjection({
        startingAge: 64,
        startingPot: 1,
        annualContribution: 0,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 1,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // 1 * 1.05 - 1 = 0.05 -> rounds to 0
      expect(result[1].potValue).toBe(0);
      expect(result.length).toBe(3); // Age 64, 65, and 66 before stopping
    });

    test("should handle very large pot values", () => {
      const result = calculatePensionProjection({
        startingAge: 64,
        startingPot: 10000000,
        annualContribution: 0,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 500000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // 10M * 1.05 - 500k = 10M
      expect(result[1].potValue).toBe(10000000);
    });
  });

  describe("Realistic Retirement Scenarios", () => {
    test("should handle typical early career scenario", () => {
      // 25 year old, modest pot, good contributions, 40 years to retirement
      const result = calculatePensionProjection({
        startingAge: 25,
        startingPot: 10000,
        annualContribution: 15000,
        growthRate: 6,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 40000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      const retirementEntry = result.find((entry) => entry.age === 65);
      expect(retirementEntry?.potValue).toBeGreaterThan(1500000); // Should accumulate substantial wealth
    });

    test("should handle mid-career catch-up scenario", () => {
      // 45 year old, decent pot, high contributions, 20 years to retirement
      const result = calculatePensionProjection({
        startingAge: 45,
        startingPot: 200000,
        annualContribution: 25000,
        growthRate: 6,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 50000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      const retirementEntry = result.find((entry) => entry.age === 65);
      expect(retirementEntry?.potValue).toBeGreaterThan(800000);
    });

    test("should handle late starter scenario", () => {
      // 55 year old, small pot, aggressive contributions, 10 years to retirement
      const result = calculatePensionProjection({
        startingAge: 55,
        startingPot: 50000,
        annualContribution: 30000,
        growthRate: 6,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 35000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      const retirementEntry = result.find((entry) => entry.age === 65);
      expect(retirementEntry?.potValue).toBeGreaterThan(350000);
    });

    test("should handle conservative investor scenario", () => {
      // Low growth, steady contributions
      const result = calculatePensionProjection({
        startingAge: 30,
        startingPot: 50000,
        annualContribution: 12000,
        growthRate: 3,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      const retirementEntry = result.find((entry) => entry.age === 65);
      expect(retirementEntry?.potValue).toBeGreaterThan(700000);
    });

    test("should handle aggressive investor scenario", () => {
      // High growth, volatile market
      const result = calculatePensionProjection({
        startingAge: 30,
        startingPot: 50000,
        annualContribution: 12000,
        growthRate: 8,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      const retirementEntry = result.find((entry) => entry.age === 65);
      expect(retirementEntry?.potValue).toBeGreaterThan(2000000);
    });

    test("should handle 4% rule scenario", () => {
      // Test if pot lasts with 4% withdrawal rate
      const initialPot = 1000000;
      const withdrawalRate = 0.04;
      const annualDrawdown = initialPot * withdrawalRate;

      const result = calculatePensionProjection({
        startingAge: 65,
        startingPot: initialPot,
        annualContribution: 0,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: annualDrawdown,
        statePensionAmount: 0,
        deathAge: 80,
        maxAge: 95,
      });

      // With 5% growth and 4% withdrawal, pot should last 30 years
      const lastEntry = result[result.length - 1];
      expect(lastEntry.age).toBe(95);
      expect(lastEntry.potValue).toBeGreaterThan(0);
    });

    test("should handle pot depletion scenario", () => {
      // High withdrawal rate that depletes pot
      const result = calculatePensionProjection({
        startingAge: 65,
        startingPot: 500000,
        annualContribution: 0,
        growthRate: 4,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 80000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // Should deplete within reasonable time
      const lastEntry = result[result.length - 1];
      expect(lastEntry.potValue).toBe(0);
      expect(lastEntry.age).toBeLessThan(75); // Should deplete before age 75
    });
  });

  describe("Stress Tests and Performance", () => {
    test("should handle very long projection period", () => {
      const result = calculatePensionProjection({
        startingAge: 18,
        startingPot: 1000,
        annualContribution: 500,
        growthRate: 5,
        volatility: 0,
        retirementAge: 67,
        annualDrawdown: 10000,
        statePensionAmount: 0,
        deathAge: 80,
        maxAge: 100,
      });

      expect(result.length).toBeGreaterThan(50); // Should have many years of data
      expect(result[0].age).toBe(18);
      expect(result[result.length - 1].age).toBeLessThanOrEqual(100);
    });

    test("should handle zero starting pot", () => {
      const result = calculatePensionProjection({
        startingAge: 22,
        startingPot: 0,
        annualContribution: 8000,
        growthRate: 6,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 25000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      expect(result[0].potValue).toBe(0);
      // Age 23: 0 * 1.06 + 8000 = 8000
      expect(result[1].potValue).toBe(8000);

      const retirementEntry = result.find((entry) => entry.age === 65);
      expect(retirementEntry?.potValue).toBeGreaterThan(700000); // Should still build wealth
    });

    test("should respect custom maxAge parameter", () => {
      const result = calculatePensionProjection({
        startingAge: 30,
        startingPot: 50000,
        annualContribution: 10000,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
        maxAge: 75,
      });

      // Should stop at age 75
      const lastEntry = result[result.length - 1];
      expect(lastEntry.age).toBeLessThanOrEqual(75);
    });

    test("should handle extreme growth rates", () => {
      // Very high growth rate
      const highGrowthResult = calculatePensionProjection({
        startingAge: 60,
        startingPot: 100000,
        annualContribution: 5000,
        growthRate: 20,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 50000,
        statePensionAmount: 0,
        deathAge: 80,
      });
      const retirementEntry = highGrowthResult.find(
        (entry) => entry.age === 65,
      );
      expect(retirementEntry?.potValue).toBeGreaterThan(200000);

      // Very low growth rate
      const lowGrowthResult = calculatePensionProjection({
        startingAge: 60,
        startingPot: 100000,
        annualContribution: 5000,
        growthRate: 0.5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 50000,
        statePensionAmount: 0,
        deathAge: 80,
      });
      const retirementEntryLow = lowGrowthResult.find(
        (entry) => entry.age === 65,
      );
      expect(retirementEntryLow?.potValue).toBeGreaterThan(70000);
    });
  });

  describe("Data Integrity and Consistency", () => {
    test("should have continuous age progression", () => {
      const result = calculatePensionProjection({
        startingAge: 30,
        startingPot: 50000,
        annualContribution: 10000,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      for (let i = 1; i < result.length; i++) {
        expect(result[i].age).toBe(result[i - 1].age + 1);
      }
    });

    test("should have consistent phase transitions", () => {
      const result = calculatePensionProjection({
        startingAge: 63,
        startingPot: 100000,
        annualContribution: 10000,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      let foundTransition = false;
      for (let i = 1; i < result.length; i++) {
        if (
          result[i - 1].phase === "Accumulation" &&
          result[i].phase === "Drawdown"
        ) {
          expect(foundTransition).toBe(false); // Should only transition once
          foundTransition = true;
          expect(result[i].age).toBe(65); // Should transition at retirement age
        }
        // Should never go back from Drawdown to Accumulation
        expect(
          result[i - 1].phase === "Drawdown" &&
            result[i].phase === "Accumulation",
        ).toBe(false);
      }
      expect(foundTransition).toBe(true);
    });

    test("should never have negative pot values in output", () => {
      // Scenario that would cause negative pot
      const result = calculatePensionProjection({
        startingAge: 65,
        startingPot: 10000,
        annualContribution: 0,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 50000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      result.forEach((entry) => {
        expect(entry.potValue).toBeGreaterThanOrEqual(0);
      });
    });

    test("should stop immediately when pot reaches zero", () => {
      const result = calculatePensionProjection({
        startingAge: 65,
        startingPot: 20000,
        annualContribution: 0,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      // Should have exactly one entry where pot goes to 0
      expect(result.length).toBe(1);
      expect(result[0].potValue).toBe(0);
    });

    test("should maintain mathematical consistency across years", () => {
      const result = calculatePensionProjection({
        startingAge: 30,
        startingPot: 50000,
        annualContribution: 10000,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      for (let i = 1; i < result.length; i++) {
        const prev = result[i - 1];
        const curr = result[i];

        let expectedValue: number;
        if (prev.phase === "Accumulation" && curr.age < 65) {
          // Accumulation: growth + contribution
          expectedValue = prev.potValue * 1.05 + 10000;
        } else if (curr.phase === "Drawdown") {
          // Drawdown: growth - withdrawal
          expectedValue = prev.potValue * 1.05 - 30000;
          if (expectedValue < 0) expectedValue = 0;
        } else {
          // Transition to retirement
          expectedValue = prev.potValue * 1.05 - 30000;
          if (expectedValue < 0) expectedValue = 0;
        }

        // Allow for small rounding differences
        expect(
          Math.abs(curr.potValue - Math.round(expectedValue)),
        ).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("State Pension Integration", () => {
    test("should add state pension income during retirement", () => {
      // Test with 25 year old (born 2000), state pension starts at 68, retirement at 65
      const result = calculatePensionProjection({
        startingAge: 25,
        startingPot: 50000,
        annualContribution: 10000,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 12000,
        deathAge: 80,
      });

      // Find entries for ages 67, 68, 69
      const age67 = result.find((entry) => entry.age === 67);
      const age68 = result.find((entry) => entry.age === 68);
      const age69 = result.find((entry) => entry.age === 69);

      expect(age67?.phase).toBe("Drawdown");
      expect(age68?.phase).toBe("Drawdown");
      expect(age69?.phase).toBe("Drawdown");

      // State pension should start at 68, so pot should increase by 12000 at 68
      if (age67 && age68) {
        const expectedAge68 = age67.potValue * 1.05 - 30000 + 12000;
        expect(Math.abs(age68.potValue - expectedAge68)).toBeLessThan(1);
      }
    });

    test("should not add state pension before eligibility age", () => {
      // Test with someone who retires at 60, state pension at 67
      const result = calculatePensionProjection({
        startingAge: 60,
        startingPot: 500000,
        annualContribution: 0,
        growthRate: 5,
        volatility: 0,
        retirementAge: 60,
        annualDrawdown: 40000,
        statePensionAmount: 12000,
        deathAge: 80,
      });

      const age60 = result.find((entry) => entry.age === 60);
      const age61 = result.find((entry) => entry.age === 61);

      if (age60 && age61) {
        // No state pension at 60-61, so calculation should be: pot * 1.05 - 40000
        const expected = age60.potValue * 1.05 - 40000;
        expect(Math.abs(age61.potValue - expected)).toBeLessThan(1);
      }
    });

    test("should handle zero state pension amount", () => {
      const result = calculatePensionProjection({
        startingAge: 65,
        startingPot: 100000,
        annualContribution: 0,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 30000,
        statePensionAmount: 0,
        deathAge: 80,
      });

      const age65 = result.find((entry) => entry.age === 65);
      const age66 = result.find((entry) => entry.age === 66);

      if (age65 && age66) {
        // With 0 state pension, calculation should be: pot * 1.05 - 30000
        const expected = age65.potValue * 1.05 - 30000;
        expect(Math.abs(age66.potValue - expected)).toBeLessThan(1);
      }
    });

    test("should handle state pension for someone born in 1961", () => {
      // Someone currently 64 (born in 1961) should get state pension at 67
      const result = calculatePensionProjection({
        startingAge: 64,
        startingPot: 200000,
        annualContribution: 0,
        growthRate: 5,
        volatility: 0,
        retirementAge: 65,
        annualDrawdown: 35000,
        statePensionAmount: 11973,
        deathAge: 80,
      });

      const age66 = result.find((entry) => entry.age === 66);
      const age67 = result.find((entry) => entry.age === 67);

      if (age66 && age67) {
        // State pension should start at 67 for someone born in 1961
        const expected = age66.potValue * 1.05 - 35000 + 11973;
        expect(Math.abs(age67.potValue - expected)).toBeLessThan(1);
      }
    });
  });
});
