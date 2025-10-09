import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PercentileDataPoint } from "../types";
import { formatCurrency } from "../utils";
import { CollapsibleSection } from "./CollapsibleSection";

interface PensionChartProps {
  percentileData: PercentileDataPoint[];
}

export const PensionChart = ({ percentileData }: PensionChartProps) => {
  const max75th = Math.max(...percentileData.map((d) => d.p75 || 0));
  const yAxisMax = max75th * 1.1;

  // Transform data to create stackable bands
  const clampedData = percentileData.map((point) => {
    const clampedP95 = point.p95 && point.p95 < yAxisMax ? point.p95 : yAxisMax;
    return {
      age: point.age,
      p5: point.p5,
      band5to25: point.p25 - point.p5, // height of 5-25 band
      band25to75: point.p75 - point.p25, // height of 25-75 band
      band75to95: clampedP95 - point.p75, // height of 75-95 band
      p50: point.p50 > 0 ? point.p50 : null, // for the median line - null stops the line
      // Keep originals for tooltip
      originalP5: point.p5,
      originalP25: point.p25,
      originalP50: point.p50,
      originalP75: point.p75,
      originalP95: point.p95,
    };
  });

  return (
    <div className="bg-white p-3 rounded-md shadow">
      <h2 className="text-base font-semibold text-gray-800 mb-2">
        Projected Pot Value Over Time
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={clampedData} stackOffset="none">
          <defs>
            <linearGradient id="colorMiddle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="colorOuter" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="age"
            label={{ value: "Age", position: "insideBottom", offset: -5 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
            label={{ value: "Pot Value", angle: -90, position: "insideLeft" }}
            tick={{ fontSize: 12 }}
            domain={[0, yAxisMax]}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const dataPoint = clampedData.find((p) => p.age === label);

                return (
                  <div className="bg-white p-2 border border-gray-200 rounded shadow-lg text-xs">
                    <p className="font-semibold mb-1">Age: {label}</p>
                    <p className="text-green-600">
                      95th: {formatCurrency(dataPoint?.originalP95 || 0)}
                    </p>
                    <p className="text-blue-600">
                      75th: {formatCurrency(dataPoint?.originalP75 || 0)}
                    </p>
                    <p className="font-bold text-blue-800">
                      Median: {formatCurrency(dataPoint?.originalP50 || 0)}
                    </p>
                    <p className="text-orange-600">
                      25th: {formatCurrency(dataPoint?.originalP25 || 0)}
                    </p>
                    <p className="text-red-600">
                      5th: {formatCurrency(dataPoint?.originalP5 || 0)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />

          {/* Base area - 5th percentile (invisible, just sets the baseline) */}
          <Area
            type="monotone"
            dataKey="p5"
            stackId="1"
            stroke="none"
            fill="transparent"
            legendType="none"
          />

          {/* 5th-25th percentile band - light shade */}
          <Area
            type="monotone"
            dataKey="band5to25"
            stackId="1"
            stroke="none"
            fill="url(#colorOuter)"
            name="5th-25th percentile"
            legendType="rect"
          />

          {/* 25th-75th percentile band - darker shade */}
          <Area
            type="monotone"
            dataKey="band25to75"
            stackId="1"
            stroke="none"
            fill="url(#colorMiddle)"
            name="25th-75th percentile"
            legendType="rect"
          />

          {/* 75th-95th percentile band - light shade */}
          <Area
            type="monotone"
            dataKey="band75to95"
            stackId="1"
            stroke="none"
            fill="url(#colorOuter)"
            name="75th-95th percentile"
            legendType="rect"
          />

          {/* Median line */}
          <Line
            type="monotone"
            dataKey="p50"
            stroke="#1e40af"
            strokeWidth={2.5}
            name="Median"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <CollapsibleSection title="How to read this chart" className="mt-3">
        <div className="text-xs text-gray-600 space-y-1">
          <p>
            • The{" "}
            <span className="font-bold text-blue-800">thick blue line</span>{" "}
            shows the median (expected) outcome
          </p>
          <p>
            • The{" "}
            <span className="font-semibold text-blue-600">
              darker shaded area
            </span>{" "}
            shows the middle 50% of outcomes (25th-75th percentiles)
          </p>
          <p>
            • The{" "}
            <span className="font-semibold text-blue-300">
              lighter shaded areas
            </span>{" "}
            above and below show the outer ranges (5th-25th and 75th-95th
            percentiles)
          </p>
          <p>• Together, the shaded areas cover 90% of all possible outcomes</p>
          <p>
            • Wider shaded areas indicate more uncertainty about future values
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
};
