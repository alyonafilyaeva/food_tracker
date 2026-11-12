'use client';

import { useParams } from 'next/navigation';
import { PurchaseForm } from '@/components/purchase-form/PurchaseForm';
import { usePurchase } from '@/hooks/usePurchases';

export default function EditPurchasePage() {
  const { id } = useParams<{ id: string }>();
  const { data: purchase, isLoading, isError } = usePurchase(id);

  if (isLoading) {
    return <p className="text-sm text-[var(--text-muted)]">Загрузка…</p>;
  }

  if (isError || !purchase) {
    return <p className="text-sm text-[var(--status-critical)]">Чек не найден</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-[var(--text-primary)]">Редактировать чек</h1>
      <PurchaseForm purchase={purchase} />
    </div>
  );
}
