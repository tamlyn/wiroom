# Plan 003: Correct the stale and wrong facts in CLAUDE.md

> **Executor instructions**: Follow this plan step by step. Make each edit
> exactly as specified, then run the verification greps. If anything in the
> "STOP conditions" section occurs, stop and report — do not improvise. When
> done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat d47d8cc..HEAD -- CLAUDE.md src/pension-calculations.ts src/monte-carlo.ts src/types.ts`
> If any of these changed since this plan was written, re-verify each "current
> text" below exists in the live files before editing; on a mismatch for a given
> item, skip that item and note it in your report.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `d47d8cc`, 2026-06-16

## Why this matters

`CLAUDE.md` is the file every future agent (including the executors of the other
plans in this directory) reads first to understand the codebase. It is currently
**stale and in several places actively wrong** — it describes functions by names
that no longer exist, claims behavior the code explicitly does the opposite of,
and lists three TypeScript types in `src/types.ts` that aren't there. Wrong docs
are worse than missing docs because they're trusted. This plan corrects the
specific false statements.

## Current state — the false statements and their fixes

Each row is a verbatim string currently in `CLAUDE.md` (the "Find" column) and
what it should say (the "Replace with" column). The facts were verified against
the live code at commit `d47d8cc`:

- `calculatePensionProjection` (`src/pension-calculations.ts:24-70`) samples a
  random annual return via `pickFromNormalDistribution` **every year** unless
  `volatility === 0`; it is not deterministic in general.
- It explicitly **continues to `maxAge` even after the pot hits £0** —
  `src/pension-calculations.ts:64-67`:
  ```ts
      if (pot < 0) pot = 0;
      // Continue simulation even if pot is 0 or person has died to avoid survival bias
    }
  ```
- The percentile function is named **`calculateMortalityAdjustedPercentiles`**
  (`src/monte-carlo.ts:72`), not `calculatePercentiles`.
- `pickFromNormalDistribution` lives in **`src/utils.ts:10-18`**, not
  `monte-carlo.ts`.
- `src/types.ts` contains **only** `export type TabType` — verify:
  ```
  $ cat src/types.ts
  export type TabType = "current" | "uncertainty" | "decisions";
  ```
  There is no `PensionParams` and no `SurvivalRate` anywhere in the repo;
  `PercentileDataPoint` is defined in `src/monte-carlo.ts:11-14`.
- `CurrentSituationTab` holds age, current pot, **sex, and state-pension
  contributing years** (`src/components/CurrentSituationTab.tsx`) — not
  contributions.
- `YourDecisionsTab` holds **annual contribution, retirement age, and annual
  drawdown** (`src/components/YourDecisionsTab.tsx`) — the state-pension input
  is not here.
- `PensionChart` uses an **`AreaChart`** with stacked percentile bands plus one
  median `Line` (`src/components/PensionChart.tsx:53`), and its tooltip has **no
  "(cropped)" indicator**.
- `ProjectedOutcomes` renders a single **"Retirement Risk" card — the chance of
  running out of money before death** (`src/components/ProjectedOutcomes.tsx`).

## Edits to make

Apply these as surgical find/replace edits in `CLAUDE.md`. Match the "Find" text
exactly (it appears once).

| #   | Find (verbatim)                                                                                                     | Replace with                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `**\`src/pension-calculations.ts\`\*\* - Contains the deterministic pension` `projection logic:`                    | `**\`src/pension-calculations.ts\`\*\* - Projects a single pension trajectory over time:`                                                                                                     |
| 2   | `- Stops simulation when pot depletes during drawdown phase`                                                        | `- Continues to \`maxAge\` even after the pot hits £0 (it does not stop early), to avoid survival bias`                                                                                       |
| 3   | `- \`calculatePercentiles()\` - Converts simulation results into 5th, 25th,` `75th, 95th percentiles`               | `- \`calculateMortalityAdjustedPercentiles()\` - Converts simulation results into 5th, 25th, 50th, 75th, 95th percentiles (note: it does not currently weight by mortality despite the name)` |
| 4   | `- \`pickFromNormalDistribution()\` - Creates normally distributed returns based on` `expected return ± volatility` | `- \`pickFromNormalDistribution()\` (defined in \`src/utils.ts\`) - Creates normally distributed returns based on expected return ± volatility`                                               |
| 5   | `- \`runMonteCarloSimulation()\` - Runs 1000+ simulations with random returns`                                      | `- \`runMonteCarloSimulation()\` - Runs many simulations (default 1000; the UI uses 10,000) with random returns`                                                                              |
| 6   | `- \`CurrentSituationTab.tsx\` - Age, current pot, contributions`                                                   | `- \`CurrentSituationTab.tsx\` - Age, current pot, sex, state-pension contributing years`                                                                                                     |
| 7   | `- \`YourDecisionsTab.tsx\` - Retirement age, drawdown amount, and state pension`                                   | `- \`YourDecisionsTab.tsx\` - Annual contribution, retirement age, annual drawdown`                                                                                                           |
| 8   | `- Uses Recharts LineChart to display percentile projections`                                                       | `- Uses a Recharts AreaChart with stacked percentile bands plus a median line`                                                                                                                |
| 9   | `- Custom tooltip shows unclamped values with "(cropped)" indicator`                                                | `- Custom tooltip shows the unclamped percentile values`                                                                                                                                      |
| 10  | `- \`ProjectedOutcomes.tsx\` - Compact summary of key metrics`                                                      | `- \`ProjectedOutcomes.tsx\` - "Retirement Risk" card: the chance of running out of money before death`                                                                                       |
| 11  | `- \`PensionParams\` - All user input parameters (includes \`statePensionAmount\`)`                                 | `- \`TabType\` - The active input tab ("current" \| "uncertainty" \| "decisions")`                                                                                                            |
| 12  | `- \`PercentileDataPoint\` - Chart data with p5, p25, p50, p75, p95 values`                                         | `- \`PercentileDataPoint\` - defined in \`src/monte-carlo.ts\`; chart data with dynamic \`p{n}\` keys`                                                                                        |
| 13  | `- \`SurvivalRate\` - Actuarial data for life expectancy calculations`                                              | `(removed — \`SurvivalRate\` and \`PensionParams\` no longer exist; \`src/types.ts\` contains only \`TabType\`)`                                                                              |

For edit #13, delete the `SurvivalRate` bullet line entirely (replace it with
the note shown, or simply remove the line) — the type does not exist.

Also update the line above edits 11-13:

| #   | Find (verbatim)                  | Replace with                                                                                  |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------- |
| 14  | `Key types in \`src/types.ts\`:` | `Key types (\`src/types.ts\` contains only \`TabType\`; the others live with their modules):` |

Leave the **State Pension Integration** section and the **Retirement Logic**
section (drawdown begins at retirement age, not the year after) as-is — those
are still accurate.

## Commands you will need

| Purpose                       | Command                | Expected               |
| ----------------------------- | ---------------------- | ---------------------- |
| Check no stale strings remain | greps in Done criteria | no matches             |
| Format                        | `npm run format`       | rewrites changed `.md` |

No typecheck/test needed — this is a docs-only change.

## Scope

**In scope**: `CLAUDE.md` only.

**Out of scope** (do NOT touch):

- Any source file. Do not "fix the code to match the docs" — the code is the
  source of truth; the docs are wrong.
- `COMPONENT_STRUCTURE.md` — also stale, but out of scope for this plan (it is
  human-facing and arguably should be deleted; raise as a follow-up, don't edit
  it here).

## Git workflow

- Branch: `advisor/003-fix-claude-md`
- Commit message: short imperative, e.g. "Correct stale facts in CLAUDE.md".
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Apply edits 1–14 above

Work top to bottom. After each edit, confirm the "Find" text is gone.

### Step 2: Format

Run `npm run format` (it formats `.md` too).

**Verify**: the greps in Done criteria all return no matches for the old
strings.

## Done criteria

ALL must hold (greps run from repo root):

- [ ] `grep -n "deterministic pension" CLAUDE.md` → no matches
- [ ] `grep -n "Stops simulation when pot depletes" CLAUDE.md` → no matches
- [ ] `grep -n "calculatePercentiles()" CLAUDE.md` → no matches
- [ ] `grep -n "SurvivalRate" CLAUDE.md` → no matches
- [ ] `grep -n "PensionParams" CLAUDE.md` → no matches
- [ ] `grep -n "Recharts LineChart" CLAUDE.md` → no matches
- [ ] `grep -n "calculateMortalityAdjustedPercentiles" CLAUDE.md` → at least one
      match
- [ ] `grep -n "AreaChart" CLAUDE.md` → at least one match
- [ ] No files outside `CLAUDE.md` are modified (`git status`)
- [ ] `plans/README.md` status row for 003 updated to DONE

## STOP conditions

Stop and report (do not improvise) if:

- A "Find" string in the table does not appear in `CLAUDE.md` (the file drifted
  since `d47d8cc`) — skip that single edit, finish the rest, and list the
  skipped items in your report.
- You find yourself wanting to edit a source file to make a doc claim true —
  stop; that's a different task and out of scope.

## Maintenance notes

- After plan 001 lands, the test-coverage description in `CLAUDE.md` could also
  mention `src/monte-carlo.test.ts`; left out here to avoid coupling the two
  plans.
- `COMPONENT_STRUCTURE.md` is also out of date (it lists a `survivalRates` prop
  on `ProjectedOutcomes` that no longer exists, and an old line count). Consider
  deleting it or regenerating it in a separate change.
- Whoever edits the input tabs in future should keep edits 6/7 accurate — the
  contributions vs. current-situation split is the easiest thing to get wrong.
