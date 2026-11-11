'use client';

import { formatMoney } from '@/lib/format';

interface TooltipRow {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  title?: string;
  rows: TooltipRow[];
}

// Общий тултип для графиков: значение — акцент, подпись серии — вторична,
// идентичность серии даётся короткой чёрточкой её цвета, а не цветным текстом
export function ChartTooltip({ active, title, rows }: ChartTooltipProps) {
  if (!active || rows.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm shadow-lg">
      {title && <div className="mb-1.5 text-xs text-[var(--text-muted)]">{title}</div>}
      <div className="flex flex-col gap-1">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="inline-block h-0.5 w-3 rounded" style={{ backgroundColor: row.color }} />
              {row.label}
            </span>
            <span className="font-semibold text-[var(--text-primary)]">{formatMoney(row.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
