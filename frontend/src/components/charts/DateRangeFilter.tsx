'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { formatDateInput } from '@/lib/format';
import type { DateRange } from '@/hooks/useAnalytics';

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateInput(date);
}

function startOfMonth(): string {
  const date = new Date();
  date.setDate(1);
  return formatDateInput(date);
}

const PRESETS: { key: string; label: string; range: DateRange }[] = [
  { key: '7d', label: '7 дней', range: { from: daysAgo(6) } },
  { key: '30d', label: '30 дней', range: { from: daysAgo(29) } },
  { key: '90d', label: '90 дней', range: { from: daysAgo(89) } },
  { key: 'month', label: 'Этот месяц', range: { from: startOfMonth() } },
  { key: 'all', label: 'Весь период', range: {} },
];

interface DateRangeFilterProps {
  value: DateRange;
  activePreset: string;
  onChange: (range: DateRange, preset: string) => void;
}

// Один ряд над дашбордом: сперва пресеты, кастомный период — за ними (interaction.md)
export function DateRangeFilter({ value, activePreset, onChange }: DateRangeFilterProps) {
  const [customOpen, setCustomOpen] = useState(activePreset === 'custom');

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset.key}
          type="button"
          onClick={() => {
            setCustomOpen(false);
            onChange(preset.range, preset.key);
          }}
          className={clsx(
            'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            activePreset === preset.key
              ? 'bg-[var(--series-1)] text-white'
              : 'bg-[var(--surface-1)] text-[var(--text-secondary)] hover:bg-[var(--page)]',
          )}
        >
          {preset.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => setCustomOpen((v) => !v)}
        className={clsx(
          'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
          activePreset === 'custom'
            ? 'bg-[var(--series-1)] text-white'
            : 'bg-[var(--surface-1)] text-[var(--text-secondary)] hover:bg-[var(--page)]',
        )}
      >
        Свой период
      </button>
      {customOpen && (
        <div className="flex items-center gap-2 border-l border-[var(--border)] pl-3">
          <Input
            type="date"
            value={value.from ?? ''}
            onChange={(e) => onChange({ ...value, from: e.target.value || undefined }, 'custom')}
          />
          <span className="text-[var(--text-muted)]">—</span>
          <Input
            type="date"
            value={value.to ?? ''}
            onChange={(e) => onChange({ ...value, to: e.target.value || undefined }, 'custom')}
          />
        </div>
      )}
    </div>
  );
}
