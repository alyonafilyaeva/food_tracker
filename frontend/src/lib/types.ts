export type Unit = 'KG' | 'G' | 'L' | 'ML' | 'PCS';
export type StoreType = 'OFFLINE' | 'ONLINE' | 'HYBRID';
export type FulfillmentType = 'IN_STORE' | 'DELIVERY' | 'PICKUP';

export const UNIT_LABELS: Record<Unit, string> = {
  KG: 'кг',
  G: 'г',
  L: 'л',
  ML: 'мл',
  PCS: 'шт',
};

export const FULFILLMENT_LABELS: Record<FulfillmentType, string> = {
  IN_STORE: 'В магазине',
  DELIVERY: 'Доставка',
  PICKUP: 'Самовывоз',
};

export interface Category {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
  storeType: StoreType;
  hasDelivery: boolean;
  deliveryPlatform: string | null;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string | null;
  category: Category | null;
  defaultUnit: Unit;
}

export interface LastPurchaseInfo {
  storeId: string;
  storeName: string;
  volumePerPack: string;
  volumeUnit: Unit;
  pricePerPack: string;
  purchaseDate: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  product: Product;
  packsCount: string;
  volumePerPack: string;
  volumeUnit: Unit;
  pricePerPack: string;
  totalPrice: string;
  pricePerBaseUnit: string;
}

export interface Purchase {
  id: string;
  storeId: string;
  store: Store;
  purchaseDate: string;
  fulfillmentType: FulfillmentType;
  deliveryFee: string | null;
  serviceFee: string | null;
  tips: string | null;
  promoDiscount: string | null;
  itemsTotal: string;
  originalAmount: string;
  totalAmount: string;
  items: PurchaseItem[];
}

export interface PurchaseListResult {
  total: number;
  page: number;
  pageSize: number;
  data: Purchase[];
}

export interface PurchaseItemInput {
  productId: string;
  packsCount: number;
  volumePerPack: number;
  volumeUnit: Unit;
  pricePerPack: number;
}

export interface PurchaseInput {
  storeId: string;
  purchaseDate: string;
  fulfillmentType: FulfillmentType;
  deliveryFee?: number;
  serviceFee?: number;
  tips?: number;
  promoDiscount?: number;
  items: PurchaseItemInput[];
}

export interface TopProductRow {
  id: string | null;
  name: string;
  totalSpent: number;
  itemsCount: number;
}

export interface StoreComparisonRow {
  storeId: string;
  storeName: string;
  purchaseCount: number;
  lastPurchaseDate: string;
  avgPricePerBaseUnit: number;
  baseUnit: 'KG' | 'L' | 'PCS';
}

export interface SpendingOverTimeRow {
  bucket: string;
  itemsTotal: number;
  totalAmount: number;
}

export interface SpendingBreakdown {
  itemsTotal: number;
  deliveryFee: number;
  serviceFee: number;
  tips: number;
  promoDiscount: number;
}

export interface AverageCheckRow {
  fulfillmentType: FulfillmentType;
  avgTotal: number;
  count: number;
}
