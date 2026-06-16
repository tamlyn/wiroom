import { RangeSlider } from "./RangeSlider";
import { InputSlider } from "./InputSlider";
import { SegmentedControl } from "./SegmentedControl";
import { FineTuneGroup } from "./FineTuneGroup";
import { CollapsibleSection } from "./CollapsibleSection";
import { ASSET_PRESETS, matchAssetPreset } from "../presets";
import { CURRENT_FULL_STATE_PENSION_ANNUAL } from "../state-pension";
import { formatCurrency } from "../utils";

interface MarketAssumptionsTabProps {
  returnRange: [number, number];
  volatility: number;
  onReturnRangeChange: (value: [number, number]) => void;
  onVolatilityChange: (value: number) => void;
}

export const MarketAssumptionsTab = ({
  returnRange,
  volatility,
  onReturnRangeChange,
  onVolatilityChange,
}: MarketAssumptionsTabProps) => {
  const activePreset = matchAssetPreset(returnRange, volatility);

  const applyPreset = (name: string) => {
    const preset = ASSET_PRESETS.find((p) => p.name === name);
    if (!preset) return;
    onReturnRangeChange(preset.returnRange);
    onVolatilityChange(preset.volatility);
  };

  return (
    <div>
      <h2 className="text-[19px] font-bold text-ink mb-[4px]">
        How your money's invested
      </h2>
      <p className="text-[13.5px] leading-[1.5] text-muted mb-[26px]">
        Pick an approach — it sets the growth and volatility below. Nudge either
        slider to fine-tune.
      </p>

      <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-muted mb-[11px]">
        Approach presets
      </div>
      <SegmentedControl
        fullWidth
        value={activePreset?.name ?? null}
        onChange={applyPreset}
        options={ASSET_PRESETS.map((preset) => ({
          value: preset.name,
          label: preset.name,
        }))}
      />

      <FineTuneGroup
        caption={
          activePreset ? (
            <>
              Set by <span className="text-ink">{activePreset.name}</span>
            </>
          ) : (
            "Custom"
          )
        }
      >
        <RangeSlider
          className="mb-[28px]"
          label="Expected growth each year"
          value={returnRange}
          onChange={onReturnRangeChange}
          min={-2}
          max={15}
          step={0.5}
          valueLabel={`${returnRange[0]} – ${returnRange[1]}%`}
          minLabel="After inflation & fees"
          maxLabel="Higher = more growth & risk"
        />

        <InputSlider
          label="Volatility"
          labelSuffix="· std. dev. of returns"
          value={volatility}
          onChange={onVolatilityChange}
          min={0}
          max={30}
          formatter={(value) => `${value}%`}
        />
      </FineTuneGroup>

      <CollapsibleSection title="How we model these futures" topRule>
        <p>
          We run 10,000 Monte Carlo simulations. Each draws a different average
          return from your growth range and varies it year to year by the
          volatility.
        </p>
        <p>
          Growth and volatility are real figures — after inflation and fees.
          Mortality is modelled from UK life tables, so "running out" means
          outliving your money rather than reaching a fixed age.
        </p>
        <p>
          The full UK state pension is currently{" "}
          {formatCurrency(CURRENT_FULL_STATE_PENSION_ANNUAL)}/year. Past
          performance doesn't guarantee future results — this isn't financial
          advice.
        </p>
      </CollapsibleSection>
    </div>
  );
};
