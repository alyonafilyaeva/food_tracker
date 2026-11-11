'use client';

import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        size === 'md' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs',
        variant === 'primary' && 'bg-[var(--series-1)] text-white hover:opacity-90',
        variant === 'secondary' &&
          'border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] hover:bg-[var(--page)]',
        variant === 'ghost' && 'text-[var(--text-secondary)] hover:bg-[var(--page)]',
        variant === 'danger' && 'bg-[var(--status-critical)] text-white hover:opacity-90',
        className,
      )}
      {...props}
    />
  );
}
