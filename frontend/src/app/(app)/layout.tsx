import { AuthGuard } from '@/components/AuthGuard';
import { NavBar } from '@/components/NavBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <NavBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-20 sm:pb-6">{children}</main>
    </AuthGuard>
  );
}
