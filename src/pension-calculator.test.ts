import { calculatePensionProjection } from "./pension-calculations";

describe("calculatePensionProjection", () => {
  describe("Basic Functionality", () => {
    test("should return initial state at current age", () => {
      const result = calculatePensionProjection(30, 50000, 10000, 5, 65, 30000);

      expect(result[0]).toEqual({
        age: 30,
        potValue: 50000,
        phase: "Accumulation",
      });
    });

    test("should grow pot with contributions before retirement", () => {
      const result = calculatePensionProjection(30, 50000, 10000, 5, 65, 30000);

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
      const result = calculatePensionProjection(
        63,
        100000,
        10000,
        5,
        65,
        30000,
      );

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
      const result = calculatePensionProjection(
        65,
        500000,
        10000,
        5,
        65,
        40000,
      );

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
      const result = calculatePensionProjection(30, 50000, 10000, 0, 65, 30000);

      // No growth, just contributions
      expect(result[1].potValue).toBe(60000); // 50000 + 10000
      expect(result[2].potValue).toBe(70000); // 60000 + 10000
    });

    test("should handle negative growth rate", () => {
      const result = calculatePensionProjection(
        30,
        100000,
        5000,
        -2,
        65,
        30000,
      );

      // Year 1: 100000 * 0.98 + 5000 = 103000
      expect(result[1].potValue).toBe(103000);
      // Year 2: 103000 * 0.98 + 5000 = 105940
      expect(result[2].potValue).toBe(105940);
    });

    test("should handle zero contributions", () => {
      const result = calculatePensionProjection(30, 100000, 0, 5, 65, 30000);

      // Just growth, no contributions
      expect(result[1].potValue).toBe(105000); // 100000 * 1.05
      expect(result[2].potValue).toBe(110250); // 105000 * 1.05
    });

    test("should handle zero drawdown", () => {
      const result = calculatePensionProjection(63, 100000, 5000, 5, 65, 0);

      // At retirement, pot should continue growing
      const retirementEntry = result.find((entry) => entry.age === 65);
      const nextEntry = result.find((entry) => entry.age === 66);

      expect(retirementEntry?.phase).toBe("Drawdown");
      expect(nextEntry?.potValue).toBeGreaterThan(retirementEntry!.potValue);
    });

    test("should handle very high drawdown that depletes pot immediately", () => {
      const result = calculatePensionProjection(65, 50000, 0, 5, 65, 60000);

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
      const result = calculatePensionProjection(
        30,
        50000,
        10000,
        5,
        150,
        30000,
        100,
      );

      // Should never reach drawdown phase
      const allAccumulation = result.every(
        (entry) => entry.phase === "Accumulation",
      );
      expect(allAccumulation).toBe(true);
      expect(result[result.length - 1].age).toBe(100);
    });

    test("should handle current age equal to maxAge", () => {
      const result = calculatePensionProjection(
        80,
        100000,
        5000,
        5,
        65,
        30000,
        80,
      );

      // Should only have one entry
      expect(result.length).toBe(1);
      expect(result[0].age).toBe(80);
    });

    test("should handle current age greater than maxAge", () => {
      const result = calculatePensionProjection(
        85,
        100000,
        5000,
        5,
        65,
        30000,
        80,
      );

      // Should have no entries since current age > maxAge
      expect(result.length).toBe(0);
    });
  });

  describe("Mathematical Precision and Rounding", () => {
    test("should round pot values to nearest integer", () => {
      const result = calculatePensionProjection(
        30,
        50000,
        10000,
        5.5,
        65,
        30000,
      );

      // All pot values should be integers
      result.forEach((entry) => {
        expect(Number.isInteger(entry.potValue)).toBe(true);
      });
    });

    test("should handle fractional interest rates correctly", () => {
      const result = calculatePensionProjection(
        30,
        10000,
        1000,
        3.75,
        65,
        20000,
      );

      // Year 1: 10000 * 1.0375 + 1000 = 11375
      expect(result[1].potValue).toBe(11375);
    });

    test("should handle very small pot values", () => {
      const result = calculatePensionProjection(64, 1, 0, 5, 65, 1);

      // 1 * 1.05 - 1 = 0.05 -> rounds to 0
      expect(result[1].potValue).toBe(0);
      expect(result.length).toBe(3); // Age 64, 65, and 66 before stopping
    });

    test("should handle very large pot values", () => {
      const result = calculatePensionProjection(64, 10000000, 0, 5, 65, 500000);

      // 10M * 1.05 - 500k = 10M
      expect(result[1].potValue).toBe(10000000);
    });
  });

  describe("Realistic Retirement Scenarios", () => {
    test("should handle typical early career scenario", () => {
      // 25 year old, modest pot, good contributions, 40 years to retirement
      const result = calculatePensionProjection(25, 10000, 15000, 6, 65, 40000);

      const retirementEntry = result.find((entry) => entry.age === 65);
      expect(retirementEntry?.potValue).toBeGreaterThan(1500000); // Should accumulate substantial wealth
    });

    test("should handle mid-career catch-up scenario", () => {
      // 45 year old, decent pot, high contributions, 20 years to retirement
      const result = calculatePensionProjection(
        45,
        200000,
        25000,
        6,
        65,
        50000,
      );

      const retirementEntry = result.find((entry) => entry.age === 65);
      expect(retirementEntry?.potValue).toBeGreaterThan(800000);
    });

    test("should handle late starter scenario", () => {
      // 55 year old, small pot, aggressive contributions, 10 years to retirement
      const result = calculatePensionProjection(55, 50000, 30000, 6, 65, 35000);

      const retirementEntry = result.find((entry) => entry.age === 65);
      expect(retirementEntry?.potValue).toBeGreaterThan(350000);
    });

    test("should handle conservative investor scenario", () => {
      // Low growth, steady contributions
      const result = calculatePensionProjection(30, 50000, 12000, 3, 65, 30000);

      const retirementEntry = result.find((entry) => entry.age === 65);
      expect(retirementEntry?.potValue).toBeGreaterThan(700000);
    });

    test("should handle aggressive investor scenario", () => {
      // High growth, volatile market
      const result = calculatePensionProjection(30, 50000, 12000, 8, 65, 30000);

      const retirementEntry = result.find((entry) => entry.age === 65);
      expect(retirementEntry?.potValue).toBeGreaterThan(2000000);
    });

    test("should handle 4% rule scenario", () => {
      // Test if pot lasts with 4% withdrawal rate
      const initialPot = 1000000;
      const withdrawalRate = 0.04;
      const annualDrawdown = initialPot * withdrawalRate;

      const result = calculatePensionProjection(
        65,
        initialPot,
        0,
        5,
        65,
        annualDrawdown,
        95,
      );

      // With 5% growth and 4% withdrawal, pot should last 30 years
      const lastEntry = result[result.length - 1];
      expect(lastEntry.age).toBe(95);
      expect(lastEntry.potValue).toBeGreaterThan(0);
    });

    test("should handle pot depletion scenario", () => {
      // High withdrawal rate that depletes pot
      const result = calculatePensionProjection(65, 500000, 0, 4, 65, 80000);

      // Should deplete within reasonable time
      const lastEntry = result[result.length - 1];
      expect(lastEntry.potValue).toBe(0);
      expect(lastEntry.age).toBeLessThan(75); // Should deplete before age 75
    });
  });

  describe("Stress Tests and Performance", () => {
    test("should handle very long projection period", () => {
      const result = calculatePensionProjection(
        18,
        1000,
        500,
        5,
        67,
        10000,
        100,
      );

      expect(result.length).toBeGreaterThan(50); // Should have many years of data
      expect(result[0].age).toBe(18);
      expect(result[result.length - 1].age).toBeLessThanOrEqual(100);
    });

    test("should handle zero starting pot", () => {
      const result = calculatePensionProjection(22, 0, 8000, 6, 65, 25000);

      expect(result[0].potValue).toBe(0);
      // Age 23: 0 * 1.06 + 8000 = 8000
      expect(result[1].potValue).toBe(8000);

      const retirementEntry = result.find((entry) => entry.age === 65);
      expect(retirementEntry?.potValue).toBeGreaterThan(700000); // Should still build wealth
    });

    test("should respect custom maxAge parameter", () => {
      const result = calculatePensionProjection(
        30,
        50000,
        10000,
        5,
        65,
        30000,
        75,
      );

      // Should stop at age 75
      const lastEntry = result[result.length - 1];
      expect(lastEntry.age).toBeLessThanOrEqual(75);
    });

    test("should handle extreme growth rates", () => {
      // Very high growth rate
      const highGrowthResult = calculatePensionProjection(
        60,
        100000,
        5000,
        20,
        65,
        50000,
      );
      const retirementEntry = highGrowthResult.find(
        (entry) => entry.age === 65,
      );
      expect(retirementEntry?.potValue).toBeGreaterThan(200000);

      // Very low growth rate
      const lowGrowthResult = calculatePensionProjection(
        60,
        100000,
        5000,
        0.5,
        65,
        50000,
      );
      const retirementEntryLow = lowGrowthResult.find(
        (entry) => entry.age === 65,
      );
      expect(retirementEntryLow?.potValue).toBeGreaterThan(70000);
    });
  });

  describe("Data Integrity and Consistency", () => {
    test("should have continuous age progression", () => {
      const result = calculatePensionProjection(30, 50000, 10000, 5, 65, 30000);

      for (let i = 1; i < result.length; i++) {
        expect(result[i].age).toBe(result[i - 1].age + 1);
      }
    });

    test("should have consistent phase transitions", () => {
      const result = calculatePensionProjection(
        63,
        100000,
        10000,
        5,
        65,
        30000,
      );

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
      const result = calculatePensionProjection(65, 10000, 0, 5, 65, 50000);

      result.forEach((entry) => {
        expect(entry.potValue).toBeGreaterThanOrEqual(0);
      });
    });

    test("should stop immediately when pot reaches zero", () => {
      const result = calculatePensionProjection(65, 20000, 0, 5, 65, 30000);

      // Should have exactly one entry where pot goes to 0
      expect(result.length).toBe(1);
      expect(result[0].potValue).toBe(0);
    });

    test("should maintain mathematical consistency across years", () => {
      const result = calculatePensionProjection(30, 50000, 10000, 5, 65, 30000);

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
});
