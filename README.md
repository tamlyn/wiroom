# Will I run out of money?

This is a tool to help you figure out whether you're on track for a comfortable
retirement and if not, what you can change now to get there.

## Features

- **Monte Carlo simulation** - Models market uncertainty with 1000+ scenarios
- **Percentile projections** - Shows 5th, 25th, 50th, 75th, and 95th percentile
  outcomes
- **UK State Pension integration** - Automatically calculates state pension
  eligibility age based on birth year
- **Interactive controls** - Adjust contributions, retirement age, drawdown
  amounts, and market assumptions
- **Visual projections** - Chart showing pot value over time with different
  confidence intervals
- **Mortality modeling** - Incorporates life expectancy data for realistic
  projections

## Usage

1. Set your current situation (age, pension pot, contributions)
2. Configure market assumptions (expected returns, volatility)
3. Make decisions about retirement age, drawdown amounts, and state pension
   expectations
4. Review the chart and projected outcomes to understand your retirement
   readiness

The calculator uses UK-specific rules for state pension eligibility and current
rates.

## Development

### Getting Started

```bash
npm install
npm run dev
```

### PR Previews

This repository automatically creates live preview deployments for pull
requests. When you open a PR:

- A preview build is automatically created and deployed to Surge.sh
- A comment will be added to the PR with a link to the live preview
- The preview is updated automatically when you push new changes
- Preview deployments are cleaned up when the PR is closed

Preview URLs follow the pattern: `https://pr-{PR_NUMBER}-wiroom.surge.sh`

**Setup Requirements:** To enable PR previews, the repository needs a
`SURGE_TOKEN` secret configured in GitHub Settings > Secrets. This token allows
the workflow to deploy to Surge.sh.

### Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
