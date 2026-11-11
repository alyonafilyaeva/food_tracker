'use client';

import { forwardRef } from 'react';
import { Combobox } from '@/components/ui/Combobox';
import { Select } from '@/components/ui/Select';
import { UNIT_LABELS, type Product, type Unit } from '@/lib/types';
import { formatMoney } from '@/lib/format';
import type { ItemFormRow } from './types';

interface ItemRowProps {
  row: ItemFormRow;
  products: Product[];
  isLast: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<ItemFormRow>) => void;
  onSelectProduct: (product: Product) => void;
  onCreateProduct: (name: string) => Promise<Product>;
  onRemove: () => void;
  onEnterOnLastField: () => void;
}

const UNITS: Unit[] = ['PCS', 'KG', 'G', 'L', 'ML'];

export const ItemRow = forwardRef<HTMLInputElement, ItemRowProps>(function ItemRow(
  { row, products, isLast, canRemove, onChange, onSelectProduct, onCreateProduct, onRemove, onEnterOnLastField },
  productInputRef,
) {
  const total = (Number(row.packsCount) || 0) * (Number(row.pricePerPack) || 0);

  return (
    <div className="grid grid-cols-2 gap-2 border-b border-[var(--border)] pb-3 sm:grid-cols-[2fr_0.8fr_0.8fr_0.7fr_1fr_1fr_auto] sm:items-end sm:gap-2 sm:border-none sm:pb-0">
      <div className="col-span-2 sm:col-span-1">
        <Combobox
          ref={productInputRef}
          items={products}
          selectedId={row.productId}
          selectedLabel={row.productName}
          getId={(p) => p.id}
          getLabel={(p) => p.name}
          onSelect={(product) => onSelectProduct(product)}
          onCreate={onCreateProduct}
          placeholder="Продукт"
        />
      </div>

      <input
        type="number"
        min={0}
        step="0.01"
        placeholder="Упак."
        value={row.packsCount}
        onChange={(e) => onChange({ packsCount: e.target.value })}
        className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-2 py-2 text-sm outline-none focus:border-[var(--series-1)]"
      />

      <input
        type="number"
        min={0}
        step="0.001"
        placeholder="Объём"
        value={row.volumePerPack}
        onChange={(e) => onChange({ volumePerPack: e.target.value })}
        className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-2 py-2 text-sm outline-none focus:border-[var(--series-1)]"
      />

      <Select
        value={row.volumeUnit}
        onChange={(e) => onChange({ volumeUnit: e.target.value as Unit })}
      >
        {UNITS.map((unit) => (
          <option key={unit} value={unit}>
            {UNIT_LABELS[unit]}
          </option>
        ))}
      </Select>

      <input
        type="number"
        min={0}
        step="0.01"
        placeholder="Цена/упак."
        value={row.pricePerPack}
        onChange={(e) => onChange({ pricePerPack: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && isLast) {
            e.preventDefault();
            onEnterOnLastField();
          }
        }}
        className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-2 py-2 text-sm outline-none focus:border-[var(--series-1)]"
      />

      <div className="flex items-center justify-between gap-2 text-sm font-medium text-[var(--text-primary)] sm:justify-end">
        <span className="text-[var(--text-muted)] sm:hidden">Итого:</span>
        {formatMoney(total)}
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="col-span-2 justify-self-end rounded-md px-2 py-1 text-sm text-[var(--status-critical)] hover:bg-[var(--page)] disabled:opacity-30 sm:col-span-1"
        aria-label="Удалить позицию"
      >
        ✕
      </button>
    </div>
  );
});
