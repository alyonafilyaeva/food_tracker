import type { Unit } from '@/lib/types';

export interface ItemFormRow {
  localId: string;
  productId: string | null;
  productName: string;
  packsCount: string;
  volumePerPack: string;
  volumeUnit: Unit;
  pricePerPack: string;
}

export function createEmptyRow(): ItemFormRow {
  return {
    localId: crypto.randomUUID(),
    productId: null,
    productName: '',
    packsCount: '1',
    volumePerPack: '',
    volumeUnit: 'PCS',
    pricePerPack: '',
  };
}
