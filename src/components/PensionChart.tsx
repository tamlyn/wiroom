import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PercentileDataPoint } from '../types';
import { formatCurrency } from '../utils';

interface PensionChartProps {
  percentileData: PercentileDataPoint[];
}

export const PensionChart = ({ percentileData }: PensionChartProps) => {
  return (
    <div className="bg-white p-4 rounded-md shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Projected Pension Pot Value Over Time (with Uncertainty)</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={percentileData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="age"
            label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            label={{ value: 'Pot Value', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value) => formatCurrency(value as number)}
            labelFormatter={(label) => `Age: ${label}`}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                    <p className="font-semibold">Age: {label}</p>
                    <p className="text-xs text-green-600">95th percentile: {formatCurrency(payload[0]?.payload?.p95 || 0)}</p>
                    <p className="text-xs text-blue-600">75th percentile: {formatCurrency(payload[0]?.payload?.p75 || 0)}</p>
                    <p className="text-xs font-bold text-blue-800">Median: {formatCurrency(payload[0]?.payload?.p50 || 0)}</p>
                    <p className="text-xs text-orange-600">25th percentile: {formatCurrency(payload[0]?.payload?.p25 || 0)}</p>
                    <p className="text-xs text-red-600">5th percentile: {formatCurrency(payload[0]?.payload?.p5 || 0)}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />

          {/* 95th percentile - best case */}
          <Line
            type="monotone"
            dataKey="p95"
            stroke="#10b981"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            name="95th percentile (best case)"
            dot={false}
          />

          {/* 75th percentile */}
          <Line
            type="monotone"
            dataKey="p75"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="3 3"
            name="75th percentile"
            dot={false}
          />

          {/* Median - 50th percentile */}
          <Line
            type="monotone"
            dataKey="p50"
            stroke="#1e40af"
            strokeWidth={3}
            name="Median (expected)"
            dot={false}
          />

          {/* 25th percentile */}
          <Line
            type="monotone"
            dataKey="p25"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="3 3"
            name="25th percentile"
            dot={false}
          />

          {/* 5th percentile - worst case */}
          <Line
            type="monotone"
            dataKey="p5"
            stroke="#dc2626"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            name="5th percentile (worst case)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-semibold">How to read this chart:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>The <span className="font-bold text-blue-800">thick blue line</span> shows the median (expected) outcome</li>
          <li>The <span className="font-semibold text-green-600">green dashed line</span> (95th percentile) shows optimistic scenarios - only 5% of outcomes are better</li>
          <li>The <span className="font-semibold text-red-600">red dashed line</span> (5th percentile) shows pessimistic scenarios - only 5% of outcomes are worse</li>
          <li>The <span className="font-semibold text-blue-600">blue</span> and <span className="font-semibold text-orange-600">orange</span> dashed lines show the 25th and 75th percentiles</li>
          <li>Wider spread between lines = more uncertainty about future values</li>
        </ul>
      </div>
    </div>
  );
};