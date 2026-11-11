const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

export function formatMoney(value: number | string): string {
  return currencyFormatter.format(Number(value));
}

export function formatNumber(value: number | string): string {
  return numberFormatter.format(Number(value));
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateInput(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function todayInputValue(): string {
  return formatDateInput(new Date());
}
