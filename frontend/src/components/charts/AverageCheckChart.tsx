'use client';

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { FULFILLMENT_LABELS, type AverageCheckRow, type FulfillmentType } from '@/lib/types';
import { formatMoney } from '@/lib/format';

interface AverageCheckChartProps {
  data: AverageCheckRow[];
}

const COLOR_BY_TYPE: Record<FulfillmentType, string> = {
  IN_STORE: 'var(--series-1)',
  DELIVERY: 'var(--series-2)',
  PICKUP: 'var(--series-3)',
};

// Три категории сравниваются между собой — цвет кодирует идентичность (тип получения),
// не ранг; все столбцы подписаны напрямую, т.к. их всего три (<=4 из marks-and-anatomy.md)
export function AverageCheckChart({ data }: AverageCheckChartProps) {
  const chartData = data.map((row) => ({
    ...row,
    label: FULFILLMENT_LABELS[row.fulfillmentType],
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: 'var(--baseline)' }}
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
                        key: 'avgTotal',
                        label: `${payload[0].payload.label} · ${payload[0].payload.count} чек(ов)`,
                        value: payload[0].payload.avgTotal,
                        color: COLOR_BY_TYPE[payload[0].payload.fulfillmentType as FulfillmentType],
                      },
                    ]
                  : []
              }
            />
          )}
        />
        <Bar dataKey="avgTotal" radius={[4, 4, 0, 0]} barSize={48}>
          {chartData.map((row) => (
            <Cell key={row.fulfillmentType} fill={COLOR_BY_TYPE[row.fulfillmentType]} />
          ))}
          <LabelList
            dataKey="avgTotal"
            position="top"
            formatter={(value) => formatMoney(Number(value))}
            fill="var(--text-secondary)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
