import { Decimal } from 'decimal.js';
import type { Unit } from '@prisma/client';
import { AppError } from './errors';

// Коэффициент перевода упаковки в базовую единицу (кг / л / шт).
// Используется только для сравнения цен между магазинами — defaultUnit продукта здесь не участвует.
const UNIT_TO_BASE_FACTOR: Record<Unit, number> = {
  KG: 1,
  G: 0.001,
  L: 1,
  ML: 0.001,
  PCS: 1,
};

const BASE_UNIT_OF: Record<Unit, 'KG' | 'L' | 'PCS'> = {
  KG: 'KG',
  G: 'KG',
  L: 'L',
  ML: 'L',
  PCS: 'PCS',
};

export function toBaseQuantity(volume: number, unit: Unit): Decimal {
  return new Decimal(volume).mul(UNIT_TO_BASE_FACTOR[unit]);
}

export function getBaseUnit(unit: Unit): 'KG' | 'L' | 'PCS' {
  return BASE_UNIT_OF[unit];
}

interface PurchaseItemCalcInput {
  packsCount: number;
  volumePerPack: number;
  volumeUnit: Unit;
  pricePerPack: number;
}

export interface PurchaseItemCalcResult {
  totalPrice: Decimal;
  pricePerBaseUnit: Decimal;
  baseUnit: 'KG' | 'L' | 'PCS';
}

export function calcPurchaseItem(input: PurchaseItemCalcInput): PurchaseItemCalcResult {
  const packs = new Decimal(input.packsCount);
  const totalPrice = packs.mul(input.pricePerPack);
  const totalBaseQty = toBaseQuantity(input.volumePerPack, input.volumeUnit).mul(packs);

  if (totalBaseQty.isZero()) {
    throw new AppError(400, 'Суммарный объём позиции не может быть равен нулю');
  }

  return {
    totalPrice,
    pricePerBaseUnit: totalPrice.div(totalBaseQty),
    baseUnit: getBaseUnit(input.volumeUnit),
  };
}
