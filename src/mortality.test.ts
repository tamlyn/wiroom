import { describe, it, expect } from "vitest";
import {
  getLifeExpectancy,
  getAnnualDeathProbability,
  generateRandomDeathAge,
  getSurvivalProbability,
  type Sex,
} from "./mortality";

// A representative birth cohort for the cohort-aware probability helpers. Born
// 1990, so age 30 lands on calendar year 2020 (the start of the projection).
const BIRTH_YEAR = 1990;

describe("mortality functions", () => {
  describe("getLifeExpectancy", () => {
    it("should return correct life expectancy for valid ages", () => {
      expect(getLifeExpectancy(0, "male")).toBe(87.1);
      expect(getLifeExpectancy(0, "female")).toBe(90.3);
      expect(getLifeExpectancy(65, "male")).toBe(20.0);
      expect(getLifeExpectancy(65, "female")).toBe(22.7);
    });

    it("should return 0 for invalid ages", () => {
      expect(getLifeExpectancy(-1, "male")).toBe(0);
      expect(getLifeExpectancy(200, "male")).toBe(0);
      expect(getLifeExpectancy(150, "female")).toBe(0);
    });
  });

  describe("getAnnualDeathProbability", () => {
    it("should return higher probabilities for older ages", () => {
      const prob30Male = getAnnualDeathProbability(30, "male", BIRTH_YEAR);
      const prob70Male = getAnnualDeathProbability(70, "male", BIRTH_YEAR);
      const prob90Male = getAnnualDeathProbability(90, "male", BIRTH_YEAR);

      expect(prob70Male).toBeGreaterThan(prob30Male);
      expect(prob90Male).toBeGreaterThan(prob70Male);
    });

    it("should return different probabilities for males and females", () => {
      const prob65Male = getAnnualDeathProbability(65, "male", BIRTH_YEAR);
      const prob65Female = getAnnualDeathProbability(65, "female", BIRTH_YEAR);

      expect(prob65Male).toBeGreaterThan(prob65Female);
    });

    it("should return 1 for ages beyond the mortality table", () => {
      expect(getAnnualDeathProbability(150, "male", BIRTH_YEAR)).toBe(1);
      expect(getAnnualDeathProbability(150, "female", BIRTH_YEAR)).toBe(1);
    });
  });

  describe("generateRandomDeathAge", () => {
    it("should generate death ages at or after current age", () => {
      const currentAge = 30;
      const sex: Sex = "male";

      for (let i = 0; i < 100; i++) {
        const deathAge = generateRandomDeathAge(currentAge, sex);
        expect(deathAge).toBeGreaterThanOrEqual(currentAge);
      }
    });

    it("produces a mean death age matching life expectancy (the model's core correctness)", () => {
      const N = 50000;
      const cases: Array<{ age: number; sex: Sex }> = [
        { age: 30, sex: "male" },
        { age: 30, sex: "female" },
        { age: 65, sex: "male" },
        { age: 65, sex: "female" },
      ];

      for (const { age, sex } of cases) {
        let total = 0;
        for (let i = 0; i < N; i++) total += generateRandomDeathAge(age, sex);
        const meanDeathAge = total / N;
        const expected = age + getLifeExpectancy(age, sex);
        // Monte Carlo curtate expectation is ~0.5yr below the complete e(x);
        // ±2 years absorbs that plus q_x vintage differences.
        expect(Math.abs(meanDeathAge - expected)).toBeLessThan(2);
      }
    });

    it("should eventually terminate even for very old starting ages", () => {
      const deathAge = generateRandomDeathAge(90, "male");
      expect(deathAge).toBeLessThan(150);
    });
  });

  describe("getSurvivalProbability", () => {
    it("should return 1 for same or past ages", () => {
      expect(getSurvivalProbability(65, 65, "male", BIRTH_YEAR)).toBe(1);
      expect(getSurvivalProbability(65, 60, "male", BIRTH_YEAR)).toBe(1);
    });

    it("should return decreasing probabilities for longer time periods", () => {
      const prob1Year = getSurvivalProbability(65, 66, "male", BIRTH_YEAR);
      const prob5Years = getSurvivalProbability(65, 70, "male", BIRTH_YEAR);
      const prob20Years = getSurvivalProbability(65, 85, "male", BIRTH_YEAR);

      expect(prob1Year).toBeGreaterThan(prob5Years);
      expect(prob5Years).toBeGreaterThan(prob20Years);
      expect(prob20Years).toBeGreaterThan(0);
    });

    it("should return higher survival probabilities for females", () => {
      const probMale = getSurvivalProbability(65, 75, "male", BIRTH_YEAR);
      const probFemale = getSurvivalProbability(65, 75, "female", BIRTH_YEAR);

      expect(probFemale).toBeGreaterThan(probMale);
    });

    it("should return probabilities between 0 and 1", () => {
      const prob = getSurvivalProbability(30, 80, "male", BIRTH_YEAR);
      expect(prob).toBeGreaterThan(0);
      expect(prob).toBeLessThan(1);
    });
  });

  describe("edge cases and validation", () => {
    it("should handle boundary ages correctly", () => {
      expect(getLifeExpectancy(0, "male")).toBeGreaterThan(0);
      expect(getLifeExpectancy(99, "male")).toBeGreaterThan(0);
    });

    it("should generate consistent death probabilities", () => {
      const age = 50;
      const sex: Sex = "female";
      const prob1 = getAnnualDeathProbability(age, sex, BIRTH_YEAR);
      const prob2 = getAnnualDeathProbability(age, sex, BIRTH_YEAR);

      expect(prob1).toBe(prob2);
    });

    it("should handle very high ages in survival probability calculations", () => {
      const prob = getSurvivalProbability(95, 100, "male", BIRTH_YEAR);
      expect(prob).toBeGreaterThan(0);
      expect(prob).toBeLessThan(1);
    });
  });
});
