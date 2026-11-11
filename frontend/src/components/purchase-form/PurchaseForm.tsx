'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';
import { Input } from '@/components/ui/Input';
import { Segmented } from '@/components/ui/Segmented';
import { useCreateStore, useStores } from '@/hooks/useStores';
import { useCreateProduct, fetchLastPurchaseInfo, useProducts } from '@/hooks/useProducts';
import { useCreatePurchase } from '@/hooks/usePurchases';
import { useToast } from '@/lib/toast-context';
import { ApiError } from '@/lib/api';
import { todayInputValue } from '@/lib/format';
import type { FulfillmentType, Product, PurchaseInput, Store } from '@/lib/types';
import { DeliveryFeesBlock } from './DeliveryFeesBlock';
import { ItemRow } from './ItemRow';
import { createEmptyRow, type ItemFormRow } from './types';

const FULFILLMENT_OPTIONS: { value: FulfillmentType; label: string; icon: string }[] = [
  { value: 'IN_STORE', label: 'В магазине', icon: '🏪' },
  { value: 'DELIVERY', label: 'Доставка', icon: '🚚' },
  { value: 'PICKUP', label: 'Самовывоз', icon: '📦' },
];

export function PurchaseForm() {
  const router = useRouter();
  const { showToast } = useToast();

  const stores = useStores();
  const products = useProducts();
  const createStore = useCreateStore();
  const createProduct = useCreateProduct();
  const createPurchase = useCreatePurchase();

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('IN_STORE');
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(todayInputValue());
  const [items, setItems] = useState<ItemFormRow[]>([createEmptyRow()]);
  const [fees, setFees] = useState({ deliveryFee: '', serviceFee: '', tips: '', promoDiscount: '' });

  const productInputRefs = useRef(new Map<string, HTMLInputElement>());
  const pendingFocusId = useRef<string | null>(null);

  // Фокус новой строки откладываем до эффекта после коммита — к этому моменту
  // ref только что добавленного ItemRow уже привязан. pendingFocusId — ref, а не state,
  // поэтому сброс после фокуса не вызывает лишний рендер
  useEffect(() => {
    if (!pendingFocusId.current) return;
    productInputRefs.current.get(pendingFocusId.current)?.focus();
    pendingFocusId.current = null;
  }, [items]);

  function updateItem(localId: string, patch: Partial<ItemFormRow>) {
    setItems((prev) => prev.map((row) => (row.localId === localId ? { ...row, ...patch } : row)));
  }

  function addItem() {
    const row = createEmptyRow();
    setItems((prev) => [...prev, row]);
    pendingFocusId.current = row.localId;
  }

  function removeItem(localId: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((row) => row.localId !== localId) : prev));
  }

  async function handleSelectProduct(localId: string, product: Product) {
    updateItem(localId, { productId: product.id, productName: product.name, volumeUnit: product.defaultUnit });
    const lastInfo = await fetchLastPurchaseInfo(product.id).catch(() => null);
    if (!lastInfo) return;
    setItems((prev) =>
      prev.map((row) =>
        row.localId === localId && !row.volumePerPack && !row.pricePerPack
          ? {
              ...row,
              volumePerPack: lastInfo.volumePerPack,
              volumeUnit: lastInfo.volumeUnit,
              pricePerPack: lastInfo.pricePerPack,
            }
          : row,
      ),
    );
  }

  async function handleCreateProduct(localId: string, name: string): Promise<Product> {
    const row = items.find((item) => item.localId === localId);
    const product = await createProduct.mutateAsync({ name, defaultUnit: row?.volumeUnit ?? 'PCS' });
    updateItem(localId, { productId: product.id, productName: product.name });
    return product;
  }

  async function handleCreateStore(name: string): Promise<Store> {
    return createStore.mutateAsync({ name, storeType: fulfillmentType === 'IN_STORE' ? 'OFFLINE' : 'ONLINE' });
  }

  function validate(): string | null {
    if (!storeId) return 'Выберите или создайте магазин';
    for (const [index, row] of items.entries()) {
      if (!row.productId) return `Укажите продукт в строке ${index + 1}`;
      if (!row.packsCount || Number(row.packsCount) <= 0) return `Укажите количество упаковок в строке ${index + 1}`;
      if (!row.volumePerPack || Number(row.volumePerPack) <= 0) return `Укажите объём упаковки в строке ${index + 1}`;
      if (row.pricePerPack === '' || Number(row.pricePerPack) < 0) return `Укажите цену за упаковку в строке ${index + 1}`;
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    const payload: PurchaseInput = {
      storeId: storeId!,
      purchaseDate,
      fulfillmentType,
      items: items.map((row) => ({
        productId: row.productId!,
        packsCount: Number(row.packsCount),
        volumePerPack: Number(row.volumePerPack),
        volumeUnit: row.volumeUnit,
        pricePerPack: Number(row.pricePerPack),
      })),
    };
    if (fulfillmentType === 'DELIVERY') {
      if (fees.deliveryFee) payload.deliveryFee = Number(fees.deliveryFee);
      if (fees.serviceFee) payload.serviceFee = Number(fees.serviceFee);
      if (fees.tips) payload.tips = Number(fees.tips);
      if (fees.promoDiscount) payload.promoDiscount = Number(fees.promoDiscount);
    }

    try {
      await createPurchase.mutateAsync(payload);
      showToast('Чек сохранён');
      setItems([createEmptyRow()]);
      setFees({ deliveryFee: '', serviceFee: '', tips: '', promoDiscount: '' });
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Не удалось сохранить чек', 'error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Segmented value={fulfillmentType} onChange={setFulfillmentType} options={FULFILLMENT_OPTIONS} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Combobox
          label="Магазин"
          items={stores.data ?? []}
          selectedId={storeId}
          selectedLabel={storeName}
          getId={(s) => s.id}
          getLabel={(s) => s.name}
          onSelect={(store) => {
            setStoreId(store.id);
            setStoreName(store.name);
          }}
          onCreate={handleCreateStore}
          placeholder="Выберите или создайте магазин"
        />
        <Input
          label="Дата покупки"
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
        />
      </div>

      {fulfillmentType === 'DELIVERY' && (
        <DeliveryFeesBlock value={fees} onChange={(patch) => setFees((prev) => ({ ...prev, ...patch }))} />
      )}

      <div className="flex flex-col gap-3">
        <div className="hidden text-xs font-medium text-[var(--text-muted)] sm:grid sm:grid-cols-[2fr_0.8fr_0.8fr_0.7fr_1fr_1fr_auto] sm:gap-2">
          <span>Продукт</span>
          <span>Упаковок</span>
          <span>Объём</span>
          <span>Ед.</span>
          <span>Цена/упак.</span>
          <span>Итого</span>
          <span />
        </div>
        {items.map((row, index) => (
          <ItemRow
            key={row.localId}
            ref={(el) => {
              if (el) productInputRefs.current.set(row.localId, el);
              else productInputRefs.current.delete(row.localId);
            }}
            row={row}
            products={products.data ?? []}
            isLast={index === items.length - 1}
            canRemove={items.length > 1}
            onChange={(patch) => updateItem(row.localId, patch)}
            onSelectProduct={(product) => handleSelectProduct(row.localId, product)}
            onCreateProduct={(name) => handleCreateProduct(row.localId, name)}
            onRemove={() => removeItem(row.localId)}
            onEnterOnLastField={addItem}
          />
        ))}
        <Button type="button" variant="secondary" onClick={addItem} className="self-start">
          + Добавить позицию
        </Button>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.push('/purchases')}>
          К списку покупок
        </Button>
        <Button type="submit" disabled={createPurchase.isPending}>
          {createPurchase.isPending ? 'Сохраняем…' : 'Сохранить чек'}
        </Button>
      </div>
    </form>
  );
}
