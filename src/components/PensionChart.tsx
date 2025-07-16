import {
  LineChart,
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

  // Cap the data to keep chart focused on realistic scenarios
  const clampedData = percentileData.map((point) => ({
    ...point,
    p95: point.p95 && point.p95 < yAxisMax ? point.p95 : undefined,
  }));

  return (
    <div className="bg-white p-3 rounded-md shadow">
      <h2 className="text-base font-semibold text-gray-800 mb-2">
        Projected Pot Value Over Time
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={clampedData}>
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
            formatter={(value) => formatCurrency(value as number)}
            labelFormatter={(label) => `Age: ${label}`}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                // Find the original data point to show unclamped values in tooltip
                const originalPoint = percentileData.find(
                  (p) => p.age === label,
                );

                return (
                  <div className="bg-white p-2 border border-gray-200 rounded shadow-lg text-xs">
                    <p className="font-semibold mb-1">Age: {label}</p>
                    <p className="text-green-600">
                      95th: {formatCurrency(originalPoint?.p95 || 0)}
                      {originalPoint &&
                        originalPoint.p95 &&
                        originalPoint.p95 > yAxisMax && (
                          <span className="text-xs opacity-60"> (cropped)</span>
                        )}
                    </p>
                    <p className="text-blue-600">
                      75th: {formatCurrency(originalPoint?.p75 || 0)}
                    </p>
                    <p className="font-bold text-blue-800">
                      Median: {formatCurrency(originalPoint?.p50 || 0)}
                    </p>
                    <p className="text-orange-600">
                      25th: {formatCurrency(originalPoint?.p25 || 0)}
                    </p>
                    <p className="text-red-600">
                      5th: {formatCurrency(originalPoint?.p5 || 0)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />

          {/* Median - 50th percentile */}
          <Line
            type="monotone"
            dataKey="p50"
            stroke="#1e40af"
            strokeWidth={3}
            name="Median"
            dot={false}
          />

          {/* 75th percentile */}
          <Line
            type="monotone"
            dataKey="p75"
            stroke="#3b82f6"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            name="75th"
            dot={false}
          />

          {/* 25th percentile */}
          <Line
            type="monotone"
            dataKey="p25"
            stroke="#f97316"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            name="25th"
            dot={false}
          />

          {/* 95th percentile - best case (may be cropped) */}
          <Line
            type="monotone"
            dataKey="p95"
            stroke="#10b981"
            strokeWidth={0.8}
            strokeDasharray="8 8"
            name="95th*"
            dot={false}
            strokeOpacity={0.6}
          />

          {/* 5th percentile - worst case */}
          <Line
            type="monotone"
            dataKey="p5"
            stroke="#dc2626"
            strokeWidth={1}
            strokeDasharray="5 5"
            name="5th"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <CollapsibleSection title="How to read this chart" className="mt-3">
        <div className="text-xs text-gray-600 space-y-1">
          <p>
            • The{" "}
            <span className="font-bold text-blue-800">thick blue line</span>{" "}
            shows the median (expected) outcome
          </p>
          <p>
            • The <span className="font-semibold text-blue-600">blue</span> and{" "}
            <span className="font-semibold text-orange-600">orange</span> dashed
            lines show 75th and 25th percentiles
          </p>
          <p>
            • The{" "}
            <span className="font-semibold text-red-600">red dashed line</span>{" "}
            (5th percentile) shows pessimistic scenarios
          </p>
          <p>
            • Chart is cropped to focus on realistic outcomes (95th percentile*
            may be cut off)
          </p>
          <p>
            • Wider spread between lines = more uncertainty about future values
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
};
