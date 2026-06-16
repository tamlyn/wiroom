import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../utils";
import { colors } from "../theme";
import type { PercentileDataPoint } from "../monte-carlo.ts";

interface PensionChartProps {
  percentileData: PercentileDataPoint[];
  retirementAge: number;
}

const formatAxis = (value: number) =>
  value >= 1_000_000
    ? `£${(value / 1_000_000).toFixed(1)}m`
    : `£${Math.round(value / 1000)}k`;

export const PensionChart = ({
  percentileData,
  retirementAge,
}: PensionChartProps) => {
  const max75th = Math.max(...percentileData.map((d) => d.p75 || 0));
  const yAxisMax = max75th * 1.1;

  // Stack invisible p5 baseline + band heights so the fan reads as three bands.
  // Clamp the top band to the axis so optimistic tails don't flatten the rest.
  const clampedData = percentileData.map((point) => {
    const clampedP95 = point.p95 ? Math.min(point.p95, yAxisMax) : 0;
    return {
      age: point.age,
      p5: point.p5,
      band5to25: point.p25 - point.p5,
      band25to75: point.p75 - point.p25,
      band75to95: Math.max(clampedP95 - point.p75, 0),
      p50: point.p50 > 0 ? point.p50 : null,
      originalP5: point.p5,
      originalP25: point.p25,
      originalP50: point.p50,
      originalP75: point.p75,
      originalP95: point.p95,
    };
  });

  const retirementPoint = percentileData.find((p) => p.age === retirementAge);
  const retirementMedian = retirementPoint?.p50 ?? 0;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={clampedData}
        margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} stroke={colors.grid} />
        <XAxis
          dataKey="age"
          tick={{ fontSize: 12, fill: colors.muted }}
          tickLine={false}
          axisLine={{ stroke: colors.line }}
          interval={9}
        />
        <YAxis
          tickFormatter={formatAxis}
          tick={{ fontSize: 12, fill: colors.muted }}
          tickLine={false}
          axisLine={false}
          domain={[0, yAxisMax]}
          width={52}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            const d = clampedData.find((p) => p.age === label);
            if (!d) return null;
            return (
              <div
                className="bg-card border border-line-strong px-[14px] py-[11px] text-[12px]"
                style={{ boxShadow: "0 4px 14px rgba(21,24,30,0.10)" }}
              >
                <div className="font-bold text-ink mb-[6px]">Age {label}</div>
                <div className="font-bold text-accent mb-[4px]">
                  Median {formatCurrency(d.originalP50 || 0)}
                </div>
                <div className="text-inksoft">
                  50% range {formatCurrency(d.originalP25 || 0)} –{" "}
                  {formatCurrency(d.originalP75 || 0)}
                </div>
                <div className="text-muted">
                  90% range {formatCurrency(d.originalP5 || 0)} –{" "}
                  {formatCurrency(d.originalP95 || 0)}
                </div>
              </div>
            );
          }}
        />

        <Area
          type="monotone"
          dataKey="p5"
          stackId="1"
          stroke="none"
          fill="transparent"
        />
        <Area
          type="monotone"
          dataKey="band5to25"
          stackId="1"
          stroke="none"
          fill={colors.bandSoft}
        />
        <Area
          type="monotone"
          dataKey="band25to75"
          stackId="1"
          stroke="none"
          fill={colors.bandStrong}
        />
        <Area
          type="monotone"
          dataKey="band75to95"
          stackId="1"
          stroke="none"
          fill={colors.bandSoft}
        />

        <Line
          type="monotone"
          dataKey="p50"
          stroke={colors.accent}
          strokeWidth={3}
          strokeLinecap="round"
          dot={false}
        />

        <ReferenceLine
          x={retirementAge}
          stroke={colors.muted}
          strokeDasharray="4 4"
          label={{
            value: "RETIRE",
            position: "insideTopLeft",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.09em",
            fill: colors.muted,
          }}
        />
        {retirementMedian > 0 && (
          <ReferenceDot
            x={retirementAge}
            y={Math.min(retirementMedian, yAxisMax)}
            r={0}
            shape={({ cx, cy }: { cx?: number; cy?: number }) => (
              <rect
                x={(cx ?? 0) - 4.5}
                y={(cy ?? 0) - 4.5}
                width={9}
                height={9}
                fill="#fff"
                stroke={colors.accent}
                strokeWidth={2.5}
              />
            )}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};
