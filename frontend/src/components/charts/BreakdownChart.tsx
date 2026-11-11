'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { formatMoney } from '@/lib/format';
import type { SpendingBreakdown } from '@/lib/types';

interface BreakdownChartProps {
  data: SpendingBreakdown;
}

const SLICES = [
  { key: 'itemsTotal', label: 'Продукты', color: 'var(--series-1)' },
  { key: 'deliveryFee', label: 'Доставка', color: 'var(--series-2)' },
  { key: 'serviceFee', label: 'Сервисный сбор', color: 'var(--series-3)' },
  { key: 'tips', label: 'Чаевые', color: 'var(--series-4)' },
] as const;

// 4 категории расходов — категориальные цвета, легенда всегда показана (>=2 серий)
// и каждая доля подписана напрямую рядом (<=4 слотов — допустимо по marks-and-anatomy.md)
export function BreakdownChart({ data }: BreakdownChartProps) {
  const slices = SLICES.map((slice) => ({ ...slice, value: data[slice.key] })).filter(
    (slice) => slice.value > 0,
  );
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  if (slices.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">Нет данных за выбранный период</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={180} className="max-w-[180px]">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="label"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            stroke="var(--surface-1)"
            strokeWidth={2}
          >
            {slices.map((slice) => (
              <Cell key={slice.key} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltip
                active={active}
                rows={
                  payload?.[0]
                    ? [
                        {
                          key: payload[0].payload.key,
                          label: payload[0].payload.label,
                          value: payload[0].payload.value,
                          color: payload[0].payload.color,
                        },
                      ]
                    : []
                }
              />
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex w-full flex-col gap-2">
        {slices.map((slice) => (
          <div key={slice.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              {slice.label}
            </span>
            <span className="font-medium text-[var(--text-primary)]">
              {formatMoney(slice.value)}
              <span className="ml-1 text-xs text-[var(--text-muted)]">
                ({Math.round((slice.value / total) * 100)}%)
              </span>
            </span>
          </div>
        ))}
        {data.promoDiscount > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-2 text-sm">
            <span className="text-[var(--text-secondary)]">Скидки по промокодам</span>
            <span className="font-medium text-[var(--success-text)]">
              −{formatMoney(data.promoDiscount)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
