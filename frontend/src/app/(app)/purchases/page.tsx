'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { useDeletePurchase, usePurchases } from '@/hooks/usePurchases';
import { useStores } from '@/hooks/useStores';
import { formatDate, formatMoney } from '@/lib/format';
import { FULFILLMENT_LABELS, type FulfillmentType } from '@/lib/types';

const PAGE_SIZE = 20;

export default function PurchasesPage() {
  const [page, setPage] = useState(1);
  const [storeId, setStoreId] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType | ''>('');

  const stores = useStores();
  const purchases = usePurchases({
    page,
    pageSize: PAGE_SIZE,
    storeId: storeId || undefined,
    fulfillmentType: fulfillmentType || undefined,
  });
  const deletePurchase = useDeletePurchase();

  const totalPages = purchases.data ? Math.max(1, Math.ceil(purchases.data.total / PAGE_SIZE)) : 1;

  async function handleDelete(id: string) {
    if (!window.confirm('Удалить этот чек?')) return;
    await deletePurchase.mutateAsync(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Покупки</h1>
        <Link href="/purchases/new">
          <Button>+ Новый чек</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={storeId}
          onChange={(e) => {
            setStoreId(e.target.value);
            setPage(1);
          }}
          className="w-44"
        >
          <option value="">Все магазины</option>
          {(stores.data ?? []).map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </Select>
        <Select
          value={fulfillmentType}
          onChange={(e) => {
            setFulfillmentType(e.target.value as FulfillmentType | '');
            setPage(1);
          }}
          className="w-44"
        >
          <option value="">Любой тип</option>
          {Object.entries(FULFILLMENT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        {purchases.data?.data.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">Покупок пока нет</p>
        )}
        {purchases.data?.data.map((purchase) => (
          <Card key={purchase.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[var(--text-primary)]">{purchase.store.name}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {formatDate(purchase.purchaseDate)} · {FULFILLMENT_LABELS[purchase.fulfillmentType]} ·{' '}
                  {purchase.items.length} позиций
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-[var(--text-primary)]">
                  {formatMoney(purchase.totalAmount)}
                </div>
                {purchase.totalAmount !== purchase.itemsTotal && (
                  <div className="text-xs text-[var(--text-muted)]">
                    из них продукты: {formatMoney(purchase.itemsTotal)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
              {purchase.items.map((item) => (
                <span
                  key={item.id}
                  className="rounded-full bg-[var(--page)] px-2 py-1"
                >
                  {item.product.name} · {formatMoney(item.totalPrice)}
                </span>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => handleDelete(purchase.id)}>
                Удалить
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Назад
          </Button>
          <span className="text-[var(--text-muted)]">
            {page} из {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Вперёд →
          </Button>
        </div>
      )}
    </div>
  );
}
