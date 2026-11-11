'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { formatMoney } from '@/lib/format';
import type { TopProductRow } from '@/lib/types';

interface TopProductsChartProps {
  data: TopProductRow[];
}

// Один показатель (сумма трат) по многим сущностям — одна серия, один цвет (synced with
// "color follows the entity, never the rank": ранжирование не кодируется цветом)
export function TopProductsChart({ data }: TopProductsChartProps) {
  const chartData = data.map((row) => ({ ...row, name: row.name || 'Без категории' }));
  const height = Math.max(160, chartData.length * 36);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 48, left: 0, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="var(--gridline)" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: 'var(--page)' }}
          content={({ active, payload }) => (
            <ChartTooltip
              active={active}
              rows={
                payload?.[0]
                  ? [
                      {
                        key: 'totalSpent',
                        label: 'Потрачено',
                        value: payload[0].payload.totalSpent,
                        color: 'var(--series-1)',
                      },
                    ]
                  : []
              }
            />
          )}
        />
        <Bar dataKey="totalSpent" fill="var(--series-1)" radius={[0, 4, 4, 0]} barSize={20}>
          <LabelList
            dataKey="totalSpent"
            position="right"
            formatter={(value) => formatMoney(Number(value))}
            fill="var(--text-secondary)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
