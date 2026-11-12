'use client';

import { useMemo, useState } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Segmented } from '@/components/ui/Segmented';
import { Select } from '@/components/ui/Select';
import { DateRangeFilter } from '@/components/charts/DateRangeFilter';
import { StatCard } from '@/components/charts/StatCard';
import { TopProductsChart } from '@/components/charts/TopProductsChart';
import { SpendingOverTimeChart } from '@/components/charts/SpendingOverTimeChart';
import { BreakdownChart } from '@/components/charts/BreakdownChart';
import { AverageCheckChart } from '@/components/charts/AverageCheckChart';
import { StoreComparisonChart } from '@/components/charts/StoreComparisonChart';
import {
  useAverageCheck,
  useSpendingBreakdown,
  useSpendingOverTime,
  useStoreComparison,
  useTopProducts,
  type DateRange,
} from '@/hooks/useAnalytics';
import { useProducts } from '@/hooks/useProducts';
import { formatMoney } from '@/lib/format';

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function rangeToInterval(range: DateRange): 'day' | 'week' | 'month' {
  if (!range.from) return 'month';
  const days = (Date.now() - new Date(range.from).getTime()) / 86_400_000;
  if (days <= 31) return 'day';
  if (days <= 180) return 'week';
  return 'month';
}

export default function DashboardPage() {
  const [range, setRange] = useState<DateRange>({ from: daysAgo(29) });
  const [preset, setPreset] = useState('30d');
  const [groupBy, setGroupBy] = useState<'product' | 'category'>('product');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const interval = rangeToInterval(range);

  const topProducts = useTopProducts(range, groupBy, 10);
  const spendingOverTime = useSpendingOverTime(range, interval);
  const breakdown = useSpendingBreakdown(range);
  const averageCheck = useAverageCheck(range);
  const storeComparison = useStoreComparison(selectedProductId);
  const products = useProducts();

  const sortedProducts = useMemo(
    () => [...(products.data ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [products.data],
  );

  const fullTotal = breakdown.data
    ? breakdown.data.itemsTotal +
      breakdown.data.deliveryFee +
      breakdown.data.serviceFee +
      breakdown.data.tips +
      breakdown.data.bagFee -
      breakdown.data.promoDiscount
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Дашборд</h1>
        <DateRangeFilter value={range} activePreset={preset} onChange={(r, p) => { setRange(r); setPreset(p); }} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Траты на продукты" value={formatMoney(breakdown.data?.itemsTotal ?? 0)} />
        <StatCard label="Полные траты" value={formatMoney(fullTotal)} />
        <StatCard
          label="Доставка / сборы / чаевые"
          value={formatMoney(
            (breakdown.data?.deliveryFee ?? 0) +
              (breakdown.data?.serviceFee ?? 0) +
              (breakdown.data?.tips ?? 0),
          )}
        />
        <StatCard label="Потрачено на пакеты" value={formatMoney(breakdown.data?.bagFee ?? 0)} />
        <StatCard
          label="Сэкономлено по промокодам"
          value={formatMoney(breakdown.data?.promoDiscount ?? 0)}
          tone="good"
        />
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <CardTitle>Топ трат</CardTitle>
          <Segmented
            value={groupBy}
            onChange={setGroupBy}
            options={[
              { value: 'product', label: 'По продуктам' },
              { value: 'category', label: 'По категориям' },
            ]}
          />
        </div>
        {topProducts.data && topProducts.data.length > 0 ? (
          <TopProductsChart data={topProducts.data} />
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Нет покупок за выбранный период</p>
        )}
      </Card>

      <Card>
        <CardTitle>Траты во времени: продукты vs с доставкой</CardTitle>
        {spendingOverTime.data && spendingOverTime.data.length > 0 ? (
          <SpendingOverTimeChart data={spendingOverTime.data} />
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Нет покупок за выбранный период</p>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>Разбивка расходов</CardTitle>
          {breakdown.data && <BreakdownChart data={breakdown.data} />}
        </Card>

        <Card>
          <CardTitle>Средний чек по типу получения</CardTitle>
          {averageCheck.data && averageCheck.data.length > 0 ? (
            <AverageCheckChart data={averageCheck.data} />
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Нет покупок за выбранный период</p>
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Сравнение цен по магазинам</CardTitle>
          <Select
            value={selectedProductId ?? ''}
            onChange={(e) => setSelectedProductId(e.target.value || null)}
            className="sm:w-56"
          >
            <option value="">Выберите продукт…</option>
            {sortedProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
        </div>
        {!selectedProductId && (
          <p className="text-sm text-[var(--text-muted)]">
            Выберите продукт, чтобы сравнить среднюю цену за базовую единицу по магазинам.
          </p>
        )}
        {selectedProductId && storeComparison.data && storeComparison.data.length > 0 && (
          <StoreComparisonChart data={storeComparison.data} />
        )}
        {selectedProductId && storeComparison.data && storeComparison.data.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">Покупок этого продукта пока нет</p>
        )}
      </Card>
    </div>
  );
}
