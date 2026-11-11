'use client';

import { clsx } from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">{children}</h2>;
}
