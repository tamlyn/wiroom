# Plan 001: Add characterization tests for the simulation and aggregation path

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the next
> step. If anything in the "STOP conditions" section occurs, stop and report —
> do not improvise. When done, update the status row for this plan in
> `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat d47d8cc..HEAD -- src/monte-carlo.ts src/components/ProjectedOutcomes.tsx`
> If either file changed since this plan was written, compare the "Current
> state" excerpts below against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `d47d8cc`, 2026-06-16

## Why this matters

The app's headline output — "Chance of running out of money before death" — and
the chart's percentile bands are produced by `src/monte-carlo.ts` and by
`calculateRunOutChance` in `ProjectedOutcomes.tsx`. **Neither has a single
test.** The existing 54 tests only cover the deterministic projection
(`calculatePensionProjection` with `volatility: 0`) and the mortality helpers.
Three later plans (004 perf rewrite, 005 bug fix, 006 mortality rewrite) all
change code in this area. Without tests, those changes are unverifiable. This
plan adds a regression net for the pure aggregation functions so the later
changes can be proven safe.

## Current state

- `src/monte-carlo.ts` — Monte Carlo engine. Two pure, already-exported
  functions this plan tests:
  - `runMonteCarloSimulation(...)` — returns `SimulationDataPoint[][]` (one
    inner array per simulation; each spans `startingAge..maxAge`, one point per
    year).
  - `calculateMortalityAdjustedPercentiles(simulations, percentiles)` —
    collapses the simulations into one `PercentileDataPoint` per age.
- `src/components/ProjectedOutcomes.tsx` — contains a **module-local, not
  exported** function `calculateRunOutChance` that must be exported to be
  tested.

The relevant types in `src/monte-carlo.ts:5-14`:

```ts
export interface SimulationDataPoint {
  age: number;
  potValue: number;
  deathAge: number;
}

export interface PercentileDataPoint {
  age: number;
  [key: string]: number;
}
```

The percentile function under test, `src/monte-carlo.ts:72-100`:

```ts
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

  for (let age = minAge; age <= maxAge; age++) {
    const valuesAtAge = simulations
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
```

**Percentile index formula** (you must match it exactly in assertions):
`index = Math.floor((p / 100) * (valuesAtAge.length - 1))`. For 5 sorted values
and percentiles `[5, 25, 50, 75, 95]`, the chosen indices are `[0, 1, 2, 3, 3]`.

The run-out function, `src/components/ProjectedOutcomes.tsx:7-21`:

```ts
const calculateRunOutChance = (
  simulations: SimulationDataPoint[][],
): number => {
  if (!simulations.length) return 0;

  let runOutCount = 0;

  for (const simulation of simulations) {
    if (simulation.some((x) => x.age <= x.deathAge && x.potValue <= 0)) {
      runOutCount++;
    }
  }

  return Math.round((runOutCount / simulations.length) * 100);
};
```

**Test conventions in this repo**: tests live next to source as `*.test.ts`, use
Vitest globals (`describe`/`test`/`it`/`expect`). Globals are enabled — see
`src/pension-calculator.test.ts:1` which uses bare `describe` with no import,
and `src/mortality.test.ts:1` which imports `{ describe, it, expect }`
explicitly. Either style is fine; **match `src/mortality.test.ts` and import the
globals explicitly** for clarity.

## Commands you will need

| Purpose   | Command                                  | Expected on success    |
| --------- | ---------------------------------------- | ---------------------- |
| Install   | `npm ci`                                 | exit 0                 |
| Typecheck | `npm run typecheck`                      | exit 0, no errors      |
| Tests     | `npx vitest run`                         | all pass               |
| Tests (1) | `npx vitest run src/monte-carlo.test.ts` | new file passes        |
| Format    | `npm run format`                         | rewrites changed files |

## Scope

**In scope** (the only files you should modify):

- `src/monte-carlo.test.ts` (create)
- `src/components/ProjectedOutcomes.tsx` (one-word change: add `export`)

**Out of scope** (do NOT touch):

- The _logic_ of any function. This plan adds tests and one `export` keyword
  only. Do not "improve" `calculateMortalityAdjustedPercentiles`,
  `calculateRunOutChance`, or anything else — later plans do that, and they rely
  on these tests pinning current behavior.
- `src/mortality.ts` / `src/mortality.test.ts` — already tested.

## Git workflow

- Branch: `advisor/001-characterization-tests`
- Commit message style matches `git log` (short imperative, e.g. "Add tests for
  monte-carlo aggregation").
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Export `calculateRunOutChance`

In `src/components/ProjectedOutcomes.tsx`, change line 7 from:

```ts
const calculateRunOutChance = (
```

to:

```ts
export const calculateRunOutChance = (
```

Nothing else in that file changes.

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Create `src/monte-carlo.test.ts` with deterministic aggregation tests

Create the file. It tests the two pure aggregation paths with hand-built inputs
(no randomness), plus structural invariants of `runMonteCarloSimulation`.

Use this content as the structural target (you may adjust formatting to satisfy
Prettier):

```ts
import { describe, it, expect } from "vitest";
import {
  runMonteCarloSimulation,
  calculateMortalityAdjustedPercentiles,
  type SimulationDataPoint,
} from "./monte-carlo";
import { calculateRunOutChance } from "./components/ProjectedOutcomes";

// Build one simulation: ages startAge..startAge+potValues.length-1, one point
// per year, all sharing the same deathAge.
const makeSim = (
  startAge: number,
  potValues: number[],
  deathAge: number,
): SimulationDataPoint[] =>
  potValues.map((potValue, i) => ({
    age: startAge + i,
    potValue,
    deathAge,
  }));

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
```

**Verify**: `npx vitest run src/monte-carlo.test.ts` → the new file passes (7
tests). Then `npx vitest run` → all tests pass (existing 54 + new).

### Step 3: Format

Run `npm run format` so the new file and the one-line edit match repo style.

**Verify**: `npx vitest run` → all pass; `npm run typecheck` → exit 0.

## Test plan

- New file `src/monte-carlo.test.ts`, modeled structurally after
  `src/mortality.test.ts`.
- Cases:
  - `calculateMortalityAdjustedPercentiles`: empty input → `[]`; exact per-age
    percentiles using the documented index formula; custom percentile list.
  - `calculateRunOutChance`: empty → `0`; the three phase-independent cases
    (depletes before death → counts; never depletes → no; depletes after death →
    no) giving 25%.
  - `runMonteCarloSimulation`: structural invariants only (count, age span,
    contiguity, integer non-negative pot). **Do not** assert exact pot values —
    this function uses `Math.random()` and is not seeded.
- Verification: `npx vitest run` → all pass, 7 new tests added.

## Done criteria

ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npx vitest run` exits 0; `src/monte-carlo.test.ts` exists and adds 7
      passing tests
- [ ] `grep -n "export const calculateRunOutChance" src/components/ProjectedOutcomes.tsx`
      returns a match
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for 001 updated to DONE

## STOP conditions

Stop and report (do not improvise) if:

- The "Current state" excerpts don't match the live code (drift since
  `d47d8cc`).
- The exact percentile assertions in Step 2 fail. That would mean the index
  formula differs from what's documented here — do **not** "fix" the test to
  make it pass; report the discrepancy, because a later plan depends on this
  formula.
- `runMonteCarloSimulation`'s structural test is flaky across runs (it should
  never be — if it is, a real invariant is being violated; report it).

## Maintenance notes

- These tests pin **current** behavior on purpose. Plan 004 (perf rewrite of
  `calculateMortalityAdjustedPercentiles`) must keep the percentile tests green
  — that's the whole point.
- **Plan 005 will modify the `calculateRunOutChance` tests**: it adds a `phase`
  field to `SimulationDataPoint` and a drawdown-phase guard, so it will update
  the `makeSim` helper and the run-out fixtures here, and add a new
  accumulation-phase case. That churn is expected and fine.
- If `calculateRunOutChance` is later moved out of the `.tsx` into a pure module
  (a reasonable refactor), update the import path in this test file.
