'use client';

import { clsx } from 'clsx';
import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, className, id, children, ...props },
  ref,
) {
  const selectId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={selectId}>
      {label && <span className="text-[var(--text-secondary)]">{label}</span>}
      <select
        ref={ref}
        id={selectId}
        className={clsx(
          'rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--series-1)]',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
});
