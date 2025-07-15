# Component Structure

The pension calculator UI has been broken down into the following reusable components:

## 📁 Component Organization

```
src/
├── components/
│   ├── index.ts                 # Barrel export for easy imports
│   ├── InputSlider.tsx         # Reusable slider input component
│   ├── TabNavigation.tsx       # Tab navigation header
│   ├── CurrentSituationTab.tsx # Current age and pot inputs
│   ├── MarketAssumptionsTab.tsx # Growth rate and volatility inputs
│   ├── YourDecisionsTab.tsx    # Contributions, retirement age, drawdown inputs
│   ├── ProjectedOutcomes.tsx   # Summary statistics and outcomes
│   ├── PensionChart.tsx        # Recharts line chart component
│   └── ImportantNotes.tsx      # Disclaimer and important notes
├── pension-calculator.tsx      # Main container component
├── types.ts                    # Shared TypeScript interfaces
└── utils.ts                    # Utility functions
```

## 🧩 Component Details

### **InputSlider**
- **Purpose**: Reusable slider input with labels and formatting
- **Props**: `label`, `value`, `onChange`, `min`, `max`, `step`, `formatter`, `description`
- **Features**: Custom formatting, min/max labels, optional descriptions

### **TabNavigation**
- **Purpose**: Tab header navigation
- **Props**: `activeTab`, `onTabChange`
- **Features**: Smooth transitions, active state styling

### **Tab Content Components**
- **CurrentSituationTab**: Age and current pot inputs
- **MarketAssumptionsTab**: Growth rate and volatility with guidance
- **YourDecisionsTab**: Contributions, retirement age, drawdown with optimization tips

### **ProjectedOutcomes**
- **Purpose**: Display simulation results and key statistics
- **Props**: `params`, `percentileData`, `survivalRates`
- **Features**: Parameter summary, retirement statistics, survival probabilities

### **PensionChart**
- **Purpose**: Interactive line chart showing projection percentiles
- **Props**: `percentileData`
- **Features**: Custom tooltip, multiple percentile lines, chart explanation

### **ImportantNotes**
- **Purpose**: Static disclaimer and important information
- **Features**: List of assumptions and limitations

## 🔄 Data Flow

```
PensionCalculator (main component)
├── State management (useState hooks)
├── Monte Carlo calculations (useMemo)
├── Tab rendering logic
└── Component composition:
    ├── TabNavigation
    ├── Tab Content (conditional rendering)
    ├── ProjectedOutcomes
    ├── PensionChart
    └── ImportantNotes
```

## ✅ Benefits

- **Reusability**: Components can be used independently
- **Maintainability**: Single responsibility principle
- **Type Safety**: Full TypeScript support with shared interfaces
- **Performance**: Optimized re-rendering with proper prop design
- **Testability**: Components can be tested in isolation
- **Clean Code**: Reduced complexity in main component (580 lines → 122 lines)