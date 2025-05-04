import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface EarningData {
  date: string;
  amount: number;
}

interface EarningsChartProps {
  data: EarningData[];
  periodType: 'daily' | 'weekly' | 'monthly';
  loading?: boolean;
}

const EarningsChart: React.FC<EarningsChartProps> = ({ 
  data, 
  periodType,
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded shadow-md border">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-sm font-semibold text-amber-600">
            ₹{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#4B5563' }}
            tickLine={{ stroke: '#4B5563' }}
          />
          <YAxis
            tick={{ fill: '#4B5563' }}
            tickLine={{ stroke: '#4B5563' }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#D97706"
            strokeWidth={2}
            dot={{ fill: '#D97706', r: 4 }}
            activeDot={{ r: 6, fill: '#92400E' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EarningsChart;