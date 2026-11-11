'use client';

import { clsx } from 'clsx';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
}

export function Segmented<T extends string>({ value, onChange, options }: SegmentedProps<T>) {
  return (
    <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={clsx(
            'flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === option.value
              ? 'bg-[var(--series-1)] text-white'
              : 'text-[var(--text-secondary)] hover:bg-[var(--page)]',
          )}
        >
          {option.icon && <span className="mr-1">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
}
