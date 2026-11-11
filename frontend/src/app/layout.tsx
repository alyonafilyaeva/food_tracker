import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'Food Tracker',
  description: 'Трекер расходов на продукты питания',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2a78d6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--page)] text-[var(--text-primary)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
