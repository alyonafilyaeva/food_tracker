'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login, register, user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      router.replace('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось выполнить запрос');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-sm"
      >
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">🥗 Food Tracker</h1>
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          label="Пароль"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        {error && <p className="text-sm text-[var(--status-critical)]">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-sm text-[var(--text-secondary)] hover:underline"
        >
          {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </form>
    </div>
  );
}
