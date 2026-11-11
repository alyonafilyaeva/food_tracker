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
import { UNIT_LABELS, type StoreComparisonRow } from '@/lib/types';

interface StoreComparisonChartProps {
  data: StoreComparisonRow[];
}

// Одна величина (цена за базовую единицу) по разным магазинам — монохромные столбцы,
// от самого выгодного магазина к самому дорогому
export function StoreComparisonChart({ data }: StoreComparisonChartProps) {
  const sorted = [...data].sort((a, b) => a.avgPricePerBaseUnit - b.avgPricePerBaseUnit);
  const unit = sorted[0] ? UNIT_LABELS[sorted[0].baseUnit] : '';

  return (
    <ResponsiveContainer width="100%" height={Math.max(140, sorted.length * 40)}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 64, left: 0, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="var(--gridline)" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="storeName"
          width={120}
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
                        key: 'avgPricePerBaseUnit',
                        label: `За ${unit} · ${payload[0].payload.purchaseCount} покупок`,
                        value: payload[0].payload.avgPricePerBaseUnit,
                        color: 'var(--series-1)',
                      },
                    ]
                  : []
              }
            />
          )}
        />
        <Bar dataKey="avgPricePerBaseUnit" fill="var(--series-1)" radius={[0, 4, 4, 0]} barSize={20}>
          <LabelList
            dataKey="avgPricePerBaseUnit"
            position="right"
            formatter={(value) => `${formatMoney(Number(value))}/${unit}`}
            fill="var(--text-secondary)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
