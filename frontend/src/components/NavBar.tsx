'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
  { href: '/', label: 'Дашборд', icon: '📊' },
  { href: '/purchases/new', label: 'Новый чек', icon: '➕' },
  { href: '/purchases', label: 'Покупки', icon: '🧾' },
];

export function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      <header className="hidden items-center justify-between border-b border-[var(--border)] bg-[var(--surface-1)] px-6 py-3 sm:flex">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-[var(--text-primary)]">🥗 Food Tracker</span>
          <nav className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-[var(--page)] text-[var(--series-1)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--page)]',
                )}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <span>{user?.email}</span>
          <button onClick={logout} className="font-medium text-[var(--series-1)] hover:underline">
            Выйти
          </button>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-[var(--border)] bg-[var(--surface-1)] sm:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium',
              pathname === item.href ? 'text-[var(--series-1)]' : 'text-[var(--text-secondary)]',
            )}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
