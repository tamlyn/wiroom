import { PensionChart } from "./PensionChart";
import { calculateRunOutChance } from "../monte-carlo";
import { colors } from "../theme";
import type { SimulationDataPoint, PercentileDataPoint } from "../monte-carlo";

interface ProjectionPanelProps {
  simulations: SimulationDataPoint[][];
  percentileData: PercentileDataPoint[];
  currentAge: number;
  retirementAge: number;
}

// Red / amber / green by run-out severity, with a soft tint for the bar track.
const ragColors = (runOut: number) => {
  if (runOut <= 10)
    return { main: colors.forest, soft: "rgba(44,122,87,0.16)" };
  if (runOut <= 25)
    return { main: colors.amber, soft: "rgba(154,107,30,0.16)" };
  return { main: colors.danger, soft: "rgba(163,50,43,0.16)" };
};

export const ProjectionPanel = ({
  simulations,
  percentileData,
  currentAge,
  retirementAge,
}: ProjectionPanelProps) => {
  const runOut = calculateRunOutChance(simulations);
  const lastALifetime = 100 - runOut;
  const lastAge = percentileData[percentileData.length - 1]?.age ?? currentAge;
  const rag = ragColors(runOut);

  return (
    <div className="px-[42px] py-[36px]">
      <div
        className="text-[11px] font-bold tracking-[0.13em] uppercase mb-[14px]"
        style={{ color: rag.main }}
      >
        Will I run out of money?
      </div>

      <div className="flex items-start gap-[24px]">
        <div
          className="text-[82px] font-extrabold leading-[0.82] tracking-[-0.03em]"
          style={{ color: rag.main }}
        >
          {runOut}%
        </div>
        <div className="pt-[7px]">
          <div className="text-[18px] font-bold leading-[1.32] text-ink">
            chance you outlive your money
          </div>
        </div>
      </div>

      <div className="mt-[26px]">
        <div className="relative h-[7px]" style={{ background: rag.soft }}>
          <div
            className="absolute left-0 top-0 bottom-0 bg-accent"
            style={{ width: `${lastALifetime}%` }}
          />
          <div
            className="absolute top-[-4px] bottom-[-4px] w-[1.5px] bg-ink"
            style={{ left: `${lastALifetime}%` }}
          />
        </div>
        <div className="flex justify-between mt-[9px] text-[12.5px] text-muted">
          <span>
            <strong className="text-accent">{lastALifetime}%</strong> last a
            lifetime
          </span>
          <span>
            <strong style={{ color: rag.main }}>{runOut}%</strong> run out
          </span>
        </div>
      </div>

      <div className="h-px bg-line my-[30px]" />

      <div className="flex justify-between items-baseline mb-[18px]">
        <div className="text-[11px] font-bold tracking-[0.13em] uppercase text-muted">
          Projected pot value · ages {currentAge}–{lastAge}
        </div>
        <div className="text-[12px] text-muted">in today's money</div>
      </div>

      <PensionChart
        percentileData={percentileData}
        retirementAge={retirementAge}
      />

      <div className="flex flex-col gap-[10px] mt-[18px]">
        <div className="flex items-center gap-[9px] text-[12.5px] text-inksoft">
          <span className="w-[18px] h-[3px] bg-accent" /> Median path
        </div>
        <div className="flex items-center gap-[9px] text-[12.5px] text-inksoft">
          <span
            className="w-[16px] h-[11px]"
            style={{ background: colors.bandStrong }}
          />{" "}
          50% chance of landing in this range
        </div>
        <div className="flex items-center gap-[9px] text-[12.5px] text-inksoft">
          <span
            className="w-[16px] h-[11px]"
            style={{ background: colors.bandSoft }}
          />{" "}
          90% chance of landing in this range
        </div>
      </div>
    </div>
  );
};
