import { PurchaseForm } from '@/components/purchase-form/PurchaseForm';

export default function NewPurchasePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-[var(--text-primary)]">Новый чек</h1>
      <PurchaseForm />
    </div>
  );
}
