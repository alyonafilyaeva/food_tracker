'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { formatDate, formatMoney } from '@/lib/format';
import type { SpendingOverTimeRow } from '@/lib/types';

interface SpendingOverTimeChartProps {
  data: SpendingOverTimeRow[];
}

// Два измерения одной единицы (деньги) — одна ось, две серии категориального порядка
export function SpendingOverTimeChart({ data }: SpendingOverTimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--gridline)" />
        <XAxis
          dataKey="bucket"
          tickFormatter={(value: string) => formatDate(value)}
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: 'var(--baseline)' }}
        />
        <YAxis
          tickFormatter={(value: number) => formatMoney(value)}
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip
          content={({ active, label, payload }) => (
            <ChartTooltip
              active={active}
              title={label ? formatDate(label as string) : undefined}
              rows={(payload ?? []).map((item) => ({
                key: String(item.dataKey),
                label: item.dataKey === 'itemsTotal' ? 'Только продукты' : 'С доставкой/сборами',
                value: item.value as number,
                color: item.color as string,
              }))}
            />
          )}
        />
        <Legend
          iconType="plainline"
          formatter={(value: string) =>
            value === 'itemsTotal' ? 'Только продукты' : 'С доставкой/сборами'
          }
          wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
        />
        <Line
          type="monotone"
          dataKey="itemsTotal"
          stroke="var(--series-1)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface-1)' }}
        />
        <Line
          type="monotone"
          dataKey="totalAmount"
          stroke="var(--series-2)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface-1)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
