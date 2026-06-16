# Plan 005: Stop counting accumulation-phase £0 pot as "running out"

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the next
> step. If anything in the "STOP conditions" section occurs, stop and report —
> do not improvise. When done, update the status row for this plan in
> `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat d47d8cc..HEAD -- src/monte-carlo.ts src/components/ProjectedOutcomes.tsx src/pension-calculations.ts`
> If any changed since this plan was written, compare the "Current state"
> excerpts below against the live code before proceeding; on a mismatch, treat
> it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/001-characterization-tests.md` (exports and tests the
  function this plan edits)
- **Category**: bug
- **Planned at**: commit `d47d8cc`, 2026-06-16

## Why this matters

The headline metric "Chance of running out of money before death" is computed by
`calculateRunOutChance`, which counts a simulation if the pot is ever ≤ £0 at an
age at or before death:

```ts
simulation.some((x) => x.age <= x.deathAge && x.potValue <= 0);
```

This also fires **during the accumulation phase**, before retirement. The
"Current Pension Pot" slider allows £0 (`min={0}` in
`src/components/CurrentSituationTab.tsx:46-53`), so a young user with a £0
current pot is recorded with `potValue: 0` at their starting age — and is
immediately counted as "running out of money before death", forcing the metric
toward 100% even when they contribute heavily and would build a large pot. More
generally, "running out of money" is a _retirement_ concept; a £0 balance while
still accumulating is not running out.

The fix: only count depletion that happens **in the drawdown (retirement)
phase**. The data needed is already present at runtime — each simulation point
carries a `phase` field — it just isn't in the `SimulationDataPoint` type yet.

## Current state

**The data already has `phase`.** `calculatePensionProjection`
(`src/pension-calculations.ts:41-46`) pushes points shaped like:

```ts
data.push({
  age: age,
  potValue: Math.round(pot),
  phase: age < retirementAge ? "Accumulation" : "Drawdown",
  deathAge,
});
```

`runMonteCarloSimulation` (`src/monte-carlo.ts:54-66`) returns those exact
arrays, so every `SimulationDataPoint` has a `phase` at runtime. But the type
omits it — `src/monte-carlo.ts:5-9`:

```ts
export interface SimulationDataPoint {
  age: number;
  potValue: number;
  deathAge: number;
}
```

The function to fix — `src/components/ProjectedOutcomes.tsx:7-21` (note: plan
001 adds `export` to its first line):

```ts
export const calculateRunOutChance = (
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

The test file from plan 001, `src/monte-carlo.test.ts`, has a `makeSim` helper
and run-out fixtures you will extend.

## Commands you will need

| Purpose   | Command                                  | Expected on success    |
| --------- | ---------------------------------------- | ---------------------- |
| Typecheck | `npm run typecheck`                      | exit 0                 |
| Tests     | `npx vitest run`                         | all pass               |
| Tests (1) | `npx vitest run src/monte-carlo.test.ts` | passes                 |
| Build     | `npm run build`                          | exit 0                 |
| Format    | `npm run format`                         | rewrites changed files |

## Scope

**In scope** (the only files you should modify):

- `src/monte-carlo.ts` — add `phase` to the `SimulationDataPoint` interface.
- `src/components/ProjectedOutcomes.tsx` — add the phase guard to the predicate.
- `src/monte-carlo.test.ts` — update the `makeSim` helper to populate `phase`,
  and add a new test for the accumulation-phase case.

**Out of scope** (do NOT touch):

- `calculatePensionProjection` — it already sets `phase` correctly.
- `calculateMortalityAdjustedPercentiles` — unrelated; it ignores `phase`.
- The slider's `min={0}` — £0 is a legitimate starting pot; the metric is what's
  wrong, not the input.

## Git workflow

- Branch: `advisor/005-runout-phase-guard`
- Commit message: short imperative, e.g. "Only count retirement-phase pot
  depletion as running out".
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add `phase` to `SimulationDataPoint`

In `src/monte-carlo.ts`, change the interface (lines 5-9) to:

```ts
export interface SimulationDataPoint {
  age: number;
  potValue: number;
  phase: "Accumulation" | "Drawdown";
  deathAge: number;
}
```

This is type-only; the runtime objects already carry `phase`, so
`runMonteCarloSimulation` still type-checks (it returns the projection points,
which include `phase`).

**Verify**: `npm run typecheck` → exit 0. (If it reports an error in
`src/monte-carlo.test.ts` about `phase` missing, that's expected — Step 3 fixes
the test helper. You may run typecheck again after Step 3.)

### Step 2: Add the drawdown-phase guard

In `src/components/ProjectedOutcomes.tsx`, change the predicate inside
`calculateRunOutChance` from:

```ts
    if (simulation.some((x) => x.age <= x.deathAge && x.potValue <= 0)) {
```

to:

```ts
    if (
      simulation.some(
        (x) =>
          x.phase === "Drawdown" && x.age <= x.deathAge && x.potValue <= 0,
      )
    ) {
```

Behavior: a simulation now counts as "running out" only if the pot is ≤ £0 in a
**drawdown-phase** year at or before death. Accumulation-phase £0 balances no
longer count.

**Verify**: `npm run typecheck` → exit 0 (after Step 3).

### Step 3: Update the test helper and add the accumulation-phase test

In `src/monte-carlo.test.ts`:

1. Update `makeSim` to populate `phase`. Add an optional `retirementAge`
   parameter defaulting to `startAge` (so existing 3-argument calls keep
   behaving as all-drawdown, which is what the percentile tests assume):

```ts
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
```

2. The existing run-out fixtures use the default `retirementAge` (all drawdown),
   so the existing "counts ... 25%" test still holds unchanged. Add a new test
   proving the bug is fixed:

```ts
it("does not count an accumulation-phase £0 balance as running out", () => {
  // £0 starting pot at age 30, retiring at 65, dying at 80.
  // Every point shown here is in the Accumulation phase.
  const sims = [makeSim(30, [0, 8000, 16000], 80, 65)];
  expect(calculateRunOutChance(sims)).toBe(0);
});
```

(Under the old predicate this returned `100`; under the new one it returns `0`.)

**Verify**: `npx vitest run src/monte-carlo.test.ts` → all pass, including the
new test and the unchanged 25% test.

### Step 4: Format and full verify

Run `npm run format`.

**Verify**: `npx vitest run` → all pass; `npm run typecheck` → exit 0;
`npm run build` → exit 0.

## Test plan

- Update `makeSim` in `src/monte-carlo.test.ts` to set `phase`.
- Keep the existing run-out test (1 of 4 → 25%) — it must stay green, proving
  the drawdown-depletion case is unaffected.
- Add one new test: a single accumulation-phase simulation with a £0 start → run
  out chance `0` (the regression this plan fixes).
- Verification: `npx vitest run` → all pass.

## Done criteria

ALL must hold:

- [ ] `grep -n 'phase: "Accumulation" | "Drawdown"' src/monte-carlo.ts` →
      matches
- [ ] `grep -n 'x.phase === "Drawdown"' src/components/ProjectedOutcomes.tsx` →
      matches
- [ ] `npm run typecheck` exits 0
- [ ] `npx vitest run` exits 0; the new accumulation-phase test passes and the
      existing 25% run-out test still passes
- [ ] `npm run build` exits 0
- [ ] Only the three in-scope files are modified (`git status`)
- [ ] `plans/README.md` status row for 005 updated to DONE

## STOP conditions

Stop and report (do not improvise) if:

- `src/monte-carlo.test.ts` (from plan 001) does not exist — land plan 001
  first.
- After Step 1, typecheck reports `phase`-related errors in files **other than**
  `src/monte-carlo.test.ts` (e.g. some other code constructs
  `SimulationDataPoint` literals without `phase`). That means a call site this
  plan didn't anticipate exists — report it rather than editing extra files.
- The "Current state" excerpts don't match the live code (drift since
  `d47d8cc`).

## Maintenance notes

- A reviewer should sanity-check the metric in `npm run dev`: set Current Pot to
  £0 with healthy contributions and a sensible drawdown — the "Chance of running
  out" should now reflect retirement risk, not jump to ~100%.
- The metric still treats "pot ≤ 0 in any drawdown year at or before death" as
  running out, including a momentary £0 that later recovers when the state
  pension is added. That is defensible (they did run out that year) and
  unchanged by this plan; flag it only if product wants stricter semantics.
- This plan and plan 006 both touch the run-out story (006 changes the death-age
  distribution that `deathAge` comes from). They're independent — 006 doesn't
  change `calculateRunOutChance` — but review them together if landing close in
  time.
