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

export const ProjectionPanel = ({
  simulations,
  percentileData,
  currentAge,
  retirementAge,
}: ProjectionPanelProps) => {
  const runOut = calculateRunOutChance(simulations);
  const lastALifetime = 100 - runOut;
  const lastAge = percentileData[percentileData.length - 1]?.age ?? currentAge;

  return (
    <div className="px-[42px] py-[36px]">
      <div className="text-[11px] font-bold tracking-[0.13em] uppercase text-amber mb-[14px]">
        Will I run out of money?
      </div>

      <div className="flex items-start gap-[24px]">
        <div className="text-[82px] font-extrabold leading-[0.82] tracking-[-0.03em] text-amber">
          {runOut}%
        </div>
        <div className="pt-[7px]">
          <div className="text-[18px] font-bold leading-[1.32] text-ink">
            chance you outlive your money
          </div>
        </div>
      </div>

      <div className="mt-[26px]">
        <div
          className="relative h-[7px]"
          style={{ background: "rgba(154,107,30,0.18)" }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 bg-forest"
            style={{ width: `${lastALifetime}%` }}
          />
          <div
            className="absolute top-[-4px] bottom-[-4px] w-[1.5px] bg-ink"
            style={{ left: `${lastALifetime}%` }}
          />
        </div>
        <div className="flex justify-between mt-[9px] text-[12.5px] text-muted">
          <span>
            <strong className="text-forest">{lastALifetime}%</strong> last a
            lifetime
          </span>
          <span>
            <strong className="text-amber">{runOut}%</strong> run out
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
