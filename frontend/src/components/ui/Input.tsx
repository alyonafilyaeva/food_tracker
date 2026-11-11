'use client';

import { clsx } from 'clsx';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={inputId}>
      {label && <span className="text-[var(--text-secondary)]">{label}</span>}
      <input
        ref={ref}
        id={inputId}
        className={clsx(
          'rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--series-1)]',
          error && 'border-[var(--status-critical)]',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-[var(--status-critical)]">{error}</span>}
    </label>
  );
});
