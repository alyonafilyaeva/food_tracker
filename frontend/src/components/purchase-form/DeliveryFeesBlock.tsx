'use client';

import { Input } from '@/components/ui/Input';

interface DeliveryFees {
  deliveryFee: string;
  serviceFee: string;
  tips: string;
  promoDiscount: string;
}

interface DeliveryFeesBlockProps {
  value: DeliveryFees;
  onChange: (patch: Partial<DeliveryFees>) => void;
}

// Блок показывается только при fulfillmentType = DELIVERY
export function DeliveryFeesBlock({ value, onChange }: DeliveryFeesBlockProps) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg bg-[var(--page)] p-3 sm:grid-cols-4">
      <Input
        label="Доставка"
        type="number"
        min={0}
        step="0.01"
        value={value.deliveryFee}
        onChange={(e) => onChange({ deliveryFee: e.target.value })}
      />
      <Input
        label="Сервисный сбор"
        type="number"
        min={0}
        step="0.01"
        value={value.serviceFee}
        onChange={(e) => onChange({ serviceFee: e.target.value })}
      />
      <Input
        label="Чаевые"
        type="number"
        min={0}
        step="0.01"
        value={value.tips}
        onChange={(e) => onChange({ tips: e.target.value })}
      />
      <Input
        label="Скидка по промокоду"
        type="number"
        min={0}
        step="0.01"
        value={value.promoDiscount}
        onChange={(e) => onChange({ promoDiscount: e.target.value })}
      />
    </div>
  );
}
