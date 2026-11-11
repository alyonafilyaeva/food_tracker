import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'good';
}

export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <div className="text-xs text-[var(--text-secondary)]">{label}</div>
      <div
        className={clsx(
          'mt-1 text-2xl font-semibold',
          tone === 'good' ? 'text-[var(--success-text)]' : 'text-[var(--text-primary)]',
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-[var(--text-muted)]">{hint}</div>}
    </div>
  );
}
