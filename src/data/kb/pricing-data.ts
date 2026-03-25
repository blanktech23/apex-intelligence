// Pricing Data — Multiplier tiers, markup presets, delivery zones, tax
// Based on realistic dealer cost structures (Tribeca/industry standard)

export interface MultiplierTier {
  manufacturer: string;
  standard: number;
  volume: number;
  promotional: number;
}

export interface MarkupPreset {
  label: string;
  percent: number;
}

export interface DeliveryZone {
  zone: number;
  label: string;
  minDistance: number;
  maxDistance: number;
  showroomFee: number;
  perCabinetFee: number;
  minFee: number;
}

export interface CostBreakdown {
  listPrice: number;
  dealerCost: number;
  markup: number;
  sellingPrice: number;
  tax: number;
  total: number;
}

export interface PricingSummary {
  cabinetListTotal: number;
  cabinetDealerCost: number;
  modifications: number;
  subtotal: number;
  delivery: number;
  tax: number;
  grandTotal: number;
  marginPercent: number;
}

// === MULTIPLIER TIERS ===
// Multiplier = dealer cost / list price (lower = better margin)
export const multiplierTiers: MultiplierTier[] = [
  { manufacturer: 'Fabuwood', standard: 0.42, volume: 0.38, promotional: 0.35 },
  { manufacturer: 'KraftMaid', standard: 0.45, volume: 0.40, promotional: 0.37 },
  { manufacturer: 'Merillat', standard: 0.48, volume: 0.43, promotional: 0.40 },
  { manufacturer: 'American Woodmark', standard: 0.44, volume: 0.39, promotional: 0.36 },
];

// === MARKUP PRESETS ===
export const markupPresets: MarkupPreset[] = [
  { label: 'Economy', percent: 25 },
  { label: 'Standard', percent: 30 },
  { label: 'Premium', percent: 35 },
  { label: 'Luxury', percent: 40 },
];

// === DELIVERY ZONES (Tribeca-style) ===
export const deliveryZones: DeliveryZone[] = [
  { zone: 1, label: 'Local', minDistance: 0, maxDistance: 55, showroomFee: 150, perCabinetFee: 15, minFee: 150 },
  { zone: 2, label: 'Regional', minDistance: 56, maxDistance: 100, showroomFee: 200, perCabinetFee: 15, minFee: 200 },
  { zone: 3, label: 'Extended', minDistance: 101, maxDistance: 200, showroomFee: 350, perCabinetFee: 18, minFee: 350 },
  { zone: 4, label: 'Long Distance', minDistance: 201, maxDistance: 400, showroomFee: 500, perCabinetFee: 22, minFee: 500 },
  { zone: 5, label: 'National', minDistance: 401, maxDistance: 9999, showroomFee: 750, perCabinetFee: 28, minFee: 750 },
];

export const defaultTaxRate = 0.07;

// === HELPERS ===

export function getMultiplier(manufacturer: string, tier: 'standard' | 'volume' | 'promotional'): number {
  const entry = multiplierTiers.find((m) => m.manufacturer === manufacturer);
  return entry ? entry[tier] : 0.45; // fallback
}

export function calculateDealerCost(listPrice: number, manufacturer: string, tier: 'standard' | 'volume' | 'promotional'): number {
  return Math.round(listPrice * getMultiplier(manufacturer, tier) * 100) / 100;
}

export function calculateSellingPrice(dealerCost: number, markupPercent: number): number {
  return Math.round(dealerCost * (1 + markupPercent / 100) * 100) / 100;
}

export function calculateDelivery(zone: DeliveryZone, cabinetCount: number, toJobsite: boolean): number {
  if (toJobsite) {
    const perCabTotal = zone.perCabinetFee * cabinetCount;
    return Math.max(perCabTotal, zone.minFee);
  }
  return zone.showroomFee;
}

export function calculateCostBreakdown(
  listPrice: number,
  manufacturer: string,
  tier: 'standard' | 'volume' | 'promotional',
  markupPercent: number,
  taxRate: number = defaultTaxRate
): CostBreakdown {
  const dealerCost = calculateDealerCost(listPrice, manufacturer, tier);
  const sellingPrice = calculateSellingPrice(dealerCost, markupPercent);
  const markup = sellingPrice - dealerCost;
  const tax = Math.round(sellingPrice * taxRate * 100) / 100;
  return {
    listPrice,
    dealerCost,
    markup,
    sellingPrice,
    tax,
    total: Math.round((sellingPrice + tax) * 100) / 100,
  };
}
