export const CURRENT_FULL_STATE_PENSION_ANNUAL = 11973; // 2025-26 rate

export const calculateStatePensionAmount = (
  contributingYears: number,
): number => {
  if (contributingYears < 10) {
    return 0;
  }

  if (contributingYears >= 35) {
    return CURRENT_FULL_STATE_PENSION_ANNUAL;
  }

  return Math.round(
    (CURRENT_FULL_STATE_PENSION_ANNUAL / 35) * contributingYears,
  );
};

export const calculateStatePensionAge = (birthYear: number): number => {
  // Current rules based on birth year
  if (birthYear <= 1953) {
    return 66; // Already at state pension age
  }

  if (birthYear <= 1960) {
    return 66; // Current state pension age
  }

  if (birthYear <= 1961) {
    return 67; // Gradual increase 2026-2028
  }

  if (birthYear <= 1977) {
    return 67; // Will increase to 68 in 2040s (subject to review)
  }

  // For those born after 1977, likely 68 but subject to government review
  return 68;
};

export const getStatePensionEligibilityAge = (currentAge: number): number => {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - currentAge;
  return calculateStatePensionAge(birthYear);
};

export const isEligibleForStatePension = (
  age: number,
  currentAge: number,
): boolean => {
  const statePensionAge = getStatePensionEligibilityAge(currentAge);
  return age >= statePensionAge;
};
