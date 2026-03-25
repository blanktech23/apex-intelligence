// Catalog Data — 80+ items across 4 manufacturers
// Real SKU naming: B=Base, W=Wall, T=Tall, SB=Sink Base, DB=Drawer Base,
// BBC=Blind Base Corner, BLS=Lazy Susan, WDC=Wall Diagonal Corner

export type CabinetCategory =
  | 'base'
  | 'wall'
  | 'tall'
  | 'corner'
  | 'specialty'
  | 'vanity';

export type Availability =
  | 'in-stock'
  | '2-3 weeks'
  | '4-6 weeks'
  | 'special-order';

export interface CatalogItem {
  id: string;
  manufacturer: string;
  name: string;
  sku: string;
  cabinetType: CabinetCategory;
  width: number;
  depth: number;
  height: number;
  listPrice: number;
  doorStyleCompatibility: string[];
  availability: Availability;
  leadTime: string;
  description: string;
}

const allDoorStyles = ['shaker', 'slab', 'raised-panel', 'recessed-panel', 'beadboard', 'arch', 'mission'];
const standardDoorStyles = ['shaker', 'raised-panel', 'recessed-panel', 'slab'];

// === FABUWOOD (Allure Series) ===
const fabuwood: CatalogItem[] = [
  { id: 'cat-fab-001', manufacturer: 'Fabuwood', name: 'Base 12"', sku: 'B12', cabinetType: 'base', width: 12, depth: 24, height: 34.5, listPrice: 245, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Single door base, 1 adjustable shelf. Allure series.' },
  { id: 'cat-fab-002', manufacturer: 'Fabuwood', name: 'Base 15"', sku: 'B15', cabinetType: 'base', width: 15, depth: 24, height: 34.5, listPrice: 268, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Single door base, 1 adjustable shelf. Allure series.' },
  { id: 'cat-fab-003', manufacturer: 'Fabuwood', name: 'Base 18"', sku: 'B18', cabinetType: 'base', width: 18, depth: 24, height: 34.5, listPrice: 312, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Single door base, 1 adjustable shelf. Allure Galaxy series.' },
  { id: 'cat-fab-004', manufacturer: 'Fabuwood', name: 'Base 21"', sku: 'B21', cabinetType: 'base', width: 21, depth: 24, height: 34.5, listPrice: 348, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Single door base, 1 adjustable shelf.' },
  { id: 'cat-fab-005', manufacturer: 'Fabuwood', name: 'Base 24"', sku: 'B24', cabinetType: 'base', width: 24, depth: 24, height: 34.5, listPrice: 385, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Double door base, 1 adjustable shelf.' },
  { id: 'cat-fab-006', manufacturer: 'Fabuwood', name: 'Base 30"', sku: 'B30', cabinetType: 'base', width: 30, depth: 24, height: 34.5, listPrice: 425, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Double door base, 1 adjustable shelf.' },
  { id: 'cat-fab-007', manufacturer: 'Fabuwood', name: 'Base 36"', sku: 'B36', cabinetType: 'base', width: 36, depth: 24, height: 34.5, listPrice: 478, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Double door base, 1 adjustable shelf, center stile.' },
  { id: 'cat-fab-008', manufacturer: 'Fabuwood', name: 'Drawer Base 15"', sku: 'DB15', cabinetType: 'base', width: 15, depth: 24, height: 34.5, listPrice: 395, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: '4-drawer stack, full-extension glides.' },
  { id: 'cat-fab-009', manufacturer: 'Fabuwood', name: 'Drawer Base 18"', sku: 'DB18', cabinetType: 'base', width: 18, depth: 24, height: 34.5, listPrice: 428, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: '4-drawer stack, full-extension glides.' },
  { id: 'cat-fab-010', manufacturer: 'Fabuwood', name: 'Drawer Base 24"', sku: 'DB24', cabinetType: 'base', width: 24, depth: 24, height: 34.5, listPrice: 465, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: '4-drawer stack, full-extension glides.' },
  { id: 'cat-fab-011', manufacturer: 'Fabuwood', name: 'Sink Base 36"', sku: 'SB36', cabinetType: 'base', width: 36, depth: 24, height: 34.5, listPrice: 398, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'False front, no shelf, plumbing cutouts.' },
  { id: 'cat-fab-012', manufacturer: 'Fabuwood', name: 'Blind Base Corner Left', sku: 'BBC36-LH', cabinetType: 'corner', width: 36, depth: 24, height: 34.5, listPrice: 512, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Left-hand blind corner base. Requires 3" filler.' },
  { id: 'cat-fab-013', manufacturer: 'Fabuwood', name: 'Blind Base Corner Right', sku: 'BBC42-RH', cabinetType: 'corner', width: 42, depth: 24, height: 34.5, listPrice: 548, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Right-hand blind corner base, 42" wide. Requires 3" filler.' },
  { id: 'cat-fab-014', manufacturer: 'Fabuwood', name: 'Lazy Susan Base 33"', sku: 'BLS33', cabinetType: 'corner', width: 33, depth: 33, height: 34.5, listPrice: 685, doorStyleCompatibility: allDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Two-shelf revolving lazy susan, bi-fold doors.' },
  { id: 'cat-fab-015', manufacturer: 'Fabuwood', name: 'Wall 18"x30"', sku: 'W1830', cabinetType: 'wall', width: 18, depth: 12, height: 30, listPrice: 225, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Single door wall, 2 adjustable shelves.' },
  { id: 'cat-fab-016', manufacturer: 'Fabuwood', name: 'Wall 30"x30"', sku: 'W3030', cabinetType: 'wall', width: 30, depth: 12, height: 30, listPrice: 298, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Double door wall, 2 adjustable shelves.' },
  { id: 'cat-fab-017', manufacturer: 'Fabuwood', name: 'Wall 36"x30"', sku: 'W3630', cabinetType: 'wall', width: 36, depth: 12, height: 30, listPrice: 335, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Double door wall, 2 adjustable shelves.' },
  { id: 'cat-fab-018', manufacturer: 'Fabuwood', name: 'Wall 36"x42"', sku: 'W3642', cabinetType: 'wall', width: 36, depth: 12, height: 42, listPrice: 412, doorStyleCompatibility: allDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Double door wall, 3 adjustable shelves. Extended height.' },
  { id: 'cat-fab-019', manufacturer: 'Fabuwood', name: 'Wall Diagonal Corner 24"x30"', sku: 'WDC2430', cabinetType: 'corner', width: 24, depth: 24, height: 30, listPrice: 365, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Diagonal wall corner, single door, 2 shelves.' },
  { id: 'cat-fab-020', manufacturer: 'Fabuwood', name: 'Tall Pantry 18"x96"', sku: 'T189624', cabinetType: 'tall', width: 18, depth: 24, height: 96, listPrice: 895, doorStyleCompatibility: allDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Full-height pantry, 4 adjustable shelves.' },
  { id: 'cat-fab-021', manufacturer: 'Fabuwood', name: 'Tall Oven 33"x96"', sku: 'T339624', cabinetType: 'tall', width: 33, depth: 24, height: 96, listPrice: 1085, doorStyleCompatibility: allDoorStyles, availability: '4-6 weeks', leadTime: '20-30 business days', description: 'Double oven tall cabinet with cutout.' },
  { id: 'cat-fab-022', manufacturer: 'Fabuwood', name: 'Vanity Base 30"', sku: 'VB30', cabinetType: 'vanity', width: 30, depth: 21, height: 34.5, listPrice: 365, doorStyleCompatibility: allDoorStyles, availability: 'in-stock', leadTime: '3-5 business days', description: 'Double door vanity base, plumbing cutout.' },
];

// === KRAFTMAID ===
const kraftmaid: CatalogItem[] = [
  { id: 'cat-km-001', manufacturer: 'KraftMaid', name: 'Base 12"', sku: 'B12-KM', cabinetType: 'base', width: 12, depth: 24, height: 34.5, listPrice: 328, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Single door base. Vantage series.' },
  { id: 'cat-km-002', manufacturer: 'KraftMaid', name: 'Base 15"', sku: 'B15-KM', cabinetType: 'base', width: 15, depth: 24, height: 34.5, listPrice: 355, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Single door base with 1 shelf.' },
  { id: 'cat-km-003', manufacturer: 'KraftMaid', name: 'Base 18"', sku: 'B18-KM', cabinetType: 'base', width: 18, depth: 24, height: 34.5, listPrice: 398, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Single door base, 1 adjustable shelf.' },
  { id: 'cat-km-004', manufacturer: 'KraftMaid', name: 'Base 24"', sku: 'B24-KM', cabinetType: 'base', width: 24, depth: 24, height: 34.5, listPrice: 465, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Double door base, 1 adjustable shelf.' },
  { id: 'cat-km-005', manufacturer: 'KraftMaid', name: 'Base 30"', sku: 'B30-KM', cabinetType: 'base', width: 30, depth: 24, height: 34.5, listPrice: 512, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Double door base, 1 adjustable shelf.' },
  { id: 'cat-km-006', manufacturer: 'KraftMaid', name: 'Base 36"', sku: 'B36-KM', cabinetType: 'base', width: 36, depth: 24, height: 34.5, listPrice: 568, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Double door base, center stile.' },
  { id: 'cat-km-007', manufacturer: 'KraftMaid', name: 'Drawer Base 18"', sku: 'DB18-KM', cabinetType: 'base', width: 18, depth: 24, height: 34.5, listPrice: 525, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: '4-drawer stack, soft-close standard.' },
  { id: 'cat-km-008', manufacturer: 'KraftMaid', name: 'Drawer Base 24"', sku: 'DB24-KM', cabinetType: 'base', width: 24, depth: 24, height: 34.5, listPrice: 565, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: '4-drawer stack, soft-close standard.' },
  { id: 'cat-km-009', manufacturer: 'KraftMaid', name: 'Sink Base 33"', sku: 'SB33-KM', cabinetType: 'base', width: 33, depth: 24, height: 34.5, listPrice: 485, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'False front sink base with tilt-out tray.' },
  { id: 'cat-km-010', manufacturer: 'KraftMaid', name: 'Sink Base 36"', sku: 'SB36-KM', cabinetType: 'base', width: 36, depth: 24, height: 34.5, listPrice: 512, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'False front sink base, no shelf.' },
  { id: 'cat-km-011', manufacturer: 'KraftMaid', name: 'Blind Corner Base 36"', sku: 'BBC36-KM', cabinetType: 'corner', width: 36, depth: 24, height: 34.5, listPrice: 625, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Blind corner base, left or right hand.' },
  { id: 'cat-km-012', manufacturer: 'KraftMaid', name: 'Lazy Susan 36"', sku: 'BLS36-KM', cabinetType: 'corner', width: 36, depth: 36, height: 34.5, listPrice: 815, doorStyleCompatibility: standardDoorStyles, availability: '4-6 weeks', leadTime: '20-30 business days', description: 'Full-round lazy susan with polymer trays.' },
  { id: 'cat-km-013', manufacturer: 'KraftMaid', name: 'Wall 30"x30"', sku: 'W3030-KM', cabinetType: 'wall', width: 30, depth: 12, height: 30, listPrice: 378, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Double door wall, 2 adjustable shelves.' },
  { id: 'cat-km-014', manufacturer: 'KraftMaid', name: 'Wall 36"x30"', sku: 'W3630-KM', cabinetType: 'wall', width: 36, depth: 12, height: 30, listPrice: 425, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Double door wall, 2 adjustable shelves.' },
  { id: 'cat-km-015', manufacturer: 'KraftMaid', name: 'Wall 36"x42"', sku: 'W3642-KM', cabinetType: 'wall', width: 36, depth: 12, height: 42, listPrice: 498, doorStyleCompatibility: standardDoorStyles, availability: '4-6 weeks', leadTime: '20-30 business days', description: 'Extended height wall, 3 shelves.' },
  { id: 'cat-km-016', manufacturer: 'KraftMaid', name: 'Tall Pantry 18"x84"', sku: 'T188424-KM', cabinetType: 'tall', width: 18, depth: 24, height: 84, listPrice: 985, doorStyleCompatibility: standardDoorStyles, availability: '4-6 weeks', leadTime: '20-30 business days', description: 'Full pantry, 4 adjustable shelves.' },
  { id: 'cat-km-017', manufacturer: 'KraftMaid', name: 'Tall Pantry 24"x96"', sku: 'T249624-KM', cabinetType: 'tall', width: 24, depth: 24, height: 96, listPrice: 1145, doorStyleCompatibility: standardDoorStyles, availability: '4-6 weeks', leadTime: '20-30 business days', description: 'Full pantry with roll-out trays.' },
  { id: 'cat-km-018', manufacturer: 'KraftMaid', name: 'Spice Drawer 6"', sku: 'SD6-KM', cabinetType: 'specialty', width: 6, depth: 24, height: 34.5, listPrice: 345, doorStyleCompatibility: standardDoorStyles, availability: '4-6 weeks', leadTime: '20-30 business days', description: 'Pull-out spice rack, 4 tiers.' },
  { id: 'cat-km-019', manufacturer: 'KraftMaid', name: 'Waste Basket Base 18"', sku: 'WB18-KM', cabinetType: 'specialty', width: 18, depth: 24, height: 34.5, listPrice: 412, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Pull-out double waste basket, 35qt each.' },
  { id: 'cat-km-020', manufacturer: 'KraftMaid', name: 'Vanity 36"', sku: 'VB36-KM', cabinetType: 'vanity', width: 36, depth: 21, height: 34.5, listPrice: 485, doorStyleCompatibility: standardDoorStyles, availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Double door vanity, 1 drawer, plumbing cutout.' },
];

// === MERILLAT (Essentials Series) ===
const merillat: CatalogItem[] = [
  { id: 'cat-mer-001', manufacturer: 'Merillat', name: 'Base 12"', sku: 'B12-MER', cabinetType: 'base', width: 12, depth: 24, height: 34.5, listPrice: 218, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Essentials single door base.' },
  { id: 'cat-mer-002', manufacturer: 'Merillat', name: 'Base 15"', sku: 'B15-MER', cabinetType: 'base', width: 15, depth: 24, height: 34.5, listPrice: 238, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Essentials single door base.' },
  { id: 'cat-mer-003', manufacturer: 'Merillat', name: 'Base 18"', sku: 'B18-MER', cabinetType: 'base', width: 18, depth: 24, height: 34.5, listPrice: 268, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Essentials single door base.' },
  { id: 'cat-mer-004', manufacturer: 'Merillat', name: 'Base 24"', sku: 'B24-MER', cabinetType: 'base', width: 24, depth: 24, height: 34.5, listPrice: 325, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Essentials double door base.' },
  { id: 'cat-mer-005', manufacturer: 'Merillat', name: 'Base 30"', sku: 'B30-MER', cabinetType: 'base', width: 30, depth: 24, height: 34.5, listPrice: 368, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Essentials double door base.' },
  { id: 'cat-mer-006', manufacturer: 'Merillat', name: 'Base 36"', sku: 'B36-MER', cabinetType: 'base', width: 36, depth: 24, height: 34.5, listPrice: 412, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Essentials double door base, center stile.' },
  { id: 'cat-mer-007', manufacturer: 'Merillat', name: 'Drawer Base 18"', sku: 'DB18-MER', cabinetType: 'base', width: 18, depth: 24, height: 34.5, listPrice: 378, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: '3-drawer stack, epoxy-coated glides.' },
  { id: 'cat-mer-008', manufacturer: 'Merillat', name: 'Sink Base 36"', sku: 'SB36-MER', cabinetType: 'base', width: 36, depth: 24, height: 34.5, listPrice: 352, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'False front sink base.' },
  { id: 'cat-mer-009', manufacturer: 'Merillat', name: 'Blind Corner Base 36"', sku: 'BBC36-MER', cabinetType: 'corner', width: 36, depth: 24, height: 34.5, listPrice: 465, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Blind corner base.' },
  { id: 'cat-mer-010', manufacturer: 'Merillat', name: 'Wall 30"x30"', sku: 'W3030-MER', cabinetType: 'wall', width: 30, depth: 12, height: 30, listPrice: 258, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Double door wall, 2 shelves.' },
  { id: 'cat-mer-011', manufacturer: 'Merillat', name: 'Wall 36"x30"', sku: 'W3630-MER', cabinetType: 'wall', width: 36, depth: 12, height: 30, listPrice: 295, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Double door wall, 2 shelves.' },
  { id: 'cat-mer-012', manufacturer: 'Merillat', name: 'Wall 18"x30"', sku: 'W1830-MER', cabinetType: 'wall', width: 18, depth: 12, height: 30, listPrice: 195, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Single door wall, 2 shelves.' },
  { id: 'cat-mer-013', manufacturer: 'Merillat', name: 'Tall Pantry 18"x84"', sku: 'T188424-MER', cabinetType: 'tall', width: 18, depth: 24, height: 84, listPrice: 745, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Full pantry, 4 shelves.' },
  { id: 'cat-mer-014', manufacturer: 'Merillat', name: 'Lazy Susan 33"', sku: 'BLS33-MER', cabinetType: 'corner', width: 33, depth: 33, height: 34.5, listPrice: 598, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Bi-fold lazy susan with polymer shelves.' },
  { id: 'cat-mer-015', manufacturer: 'Merillat', name: 'Vanity 30"', sku: 'VB30-MER', cabinetType: 'vanity', width: 30, depth: 21, height: 34.5, listPrice: 312, doorStyleCompatibility: ['shaker', 'raised-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Double door vanity base.' },
];

// === AMERICAN WOODMARK ===
const americanWoodmark: CatalogItem[] = [
  { id: 'cat-aw-001', manufacturer: 'American Woodmark', name: 'Base 12"', sku: 'B12-AW', cabinetType: 'base', width: 12, depth: 24, height: 34.5, listPrice: 265, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Reading series single door base.' },
  { id: 'cat-aw-002', manufacturer: 'American Woodmark', name: 'Base 15"', sku: 'B15-AW', cabinetType: 'base', width: 15, depth: 24, height: 34.5, listPrice: 288, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Reading series single door base.' },
  { id: 'cat-aw-003', manufacturer: 'American Woodmark', name: 'Base 18"', sku: 'B18-AW', cabinetType: 'base', width: 18, depth: 24, height: 34.5, listPrice: 328, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Reading series single door base.' },
  { id: 'cat-aw-004', manufacturer: 'American Woodmark', name: 'Base 24"', sku: 'B24-AW', cabinetType: 'base', width: 24, depth: 24, height: 34.5, listPrice: 398, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Reading series double door base.' },
  { id: 'cat-aw-005', manufacturer: 'American Woodmark', name: 'Base 30"', sku: 'B30-AW', cabinetType: 'base', width: 30, depth: 24, height: 34.5, listPrice: 445, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Reading series double door base.' },
  { id: 'cat-aw-006', manufacturer: 'American Woodmark', name: 'Base 36"', sku: 'B36-AW', cabinetType: 'base', width: 36, depth: 24, height: 34.5, listPrice: 498, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Reading series double door base, center stile.' },
  { id: 'cat-aw-007', manufacturer: 'American Woodmark', name: 'Drawer Base 15"', sku: 'DB15-AW', cabinetType: 'base', width: 15, depth: 24, height: 34.5, listPrice: 425, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: '4-drawer stack, undermount glides.' },
  { id: 'cat-aw-008', manufacturer: 'American Woodmark', name: 'Drawer Base 18"', sku: 'DB18-AW', cabinetType: 'base', width: 18, depth: 24, height: 34.5, listPrice: 458, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: '4-drawer stack, undermount glides.' },
  { id: 'cat-aw-009', manufacturer: 'American Woodmark', name: 'Sink Base 36"', sku: 'SB36-AW', cabinetType: 'base', width: 36, depth: 24, height: 34.5, listPrice: 418, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'False front sink base.' },
  { id: 'cat-aw-010', manufacturer: 'American Woodmark', name: 'Blind Corner Base 36"', sku: 'BBC36-AW', cabinetType: 'corner', width: 36, depth: 24, height: 34.5, listPrice: 545, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Blind corner base, reversible.' },
  { id: 'cat-aw-011', manufacturer: 'American Woodmark', name: 'Lazy Susan 36"', sku: 'BLS36-AW', cabinetType: 'corner', width: 36, depth: 36, height: 34.5, listPrice: 725, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: '4-6 weeks', leadTime: '20-30 business days', description: 'Full-round lazy susan, polymer trays.' },
  { id: 'cat-aw-012', manufacturer: 'American Woodmark', name: 'Wall 30"x30"', sku: 'W3030-AW', cabinetType: 'wall', width: 30, depth: 12, height: 30, listPrice: 318, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Double door wall, 2 shelves.' },
  { id: 'cat-aw-013', manufacturer: 'American Woodmark', name: 'Wall 36"x30"', sku: 'W3630-AW', cabinetType: 'wall', width: 36, depth: 12, height: 30, listPrice: 358, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Double door wall, 2 shelves.' },
  { id: 'cat-aw-014', manufacturer: 'American Woodmark', name: 'Wall 18"x30"', sku: 'W1830-AW', cabinetType: 'wall', width: 18, depth: 12, height: 30, listPrice: 238, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Single door wall, 2 shelves.' },
  { id: 'cat-aw-015', manufacturer: 'American Woodmark', name: 'Wall Diagonal Corner 24"', sku: 'WDC2430-AW', cabinetType: 'corner', width: 24, depth: 24, height: 30, listPrice: 385, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Diagonal wall corner, single door.' },
  { id: 'cat-aw-016', manufacturer: 'American Woodmark', name: 'Tall Pantry 18"x96"', sku: 'T189624-AW', cabinetType: 'tall', width: 18, depth: 24, height: 96, listPrice: 925, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: '4-6 weeks', leadTime: '20-30 business days', description: 'Full-height pantry, 4 adjustable shelves.' },
  { id: 'cat-aw-017', manufacturer: 'American Woodmark', name: 'Tall Utility 24"x84"', sku: 'T248424-AW', cabinetType: 'tall', width: 24, depth: 24, height: 84, listPrice: 1045, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: '4-6 weeks', leadTime: '20-30 business days', description: 'Utility tall with pull-out shelves.' },
  { id: 'cat-aw-018', manufacturer: 'American Woodmark', name: 'Tray Divider Base 9"', sku: 'TD9-AW', cabinetType: 'specialty', width: 9, depth: 24, height: 34.5, listPrice: 298, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Pull-out tray divider, 3 slots.' },
  { id: 'cat-aw-019', manufacturer: 'American Woodmark', name: 'Appliance Garage 18"', sku: 'AG18-AW', cabinetType: 'specialty', width: 18, depth: 12, height: 18, listPrice: 365, doorStyleCompatibility: ['shaker', 'slab'], availability: 'special-order', leadTime: '6-8 weeks', description: 'Tambour door appliance garage.' },
  { id: 'cat-aw-020', manufacturer: 'American Woodmark', name: 'Vanity 36"', sku: 'VB36-AW', cabinetType: 'vanity', width: 36, depth: 21, height: 34.5, listPrice: 425, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Double door vanity with drawer.' },
  { id: 'cat-aw-021', manufacturer: 'American Woodmark', name: 'Base 42"', sku: 'B42-AW', cabinetType: 'base', width: 42, depth: 24, height: 34.5, listPrice: 548, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: '2-3 weeks', leadTime: '10-15 business days', description: 'Extra-wide double door base, center stile, 1 shelf.' },
  { id: 'cat-aw-022', manufacturer: 'American Woodmark', name: 'Microwave Wall 30"', sku: 'MW3018-AW', cabinetType: 'wall', width: 30, depth: 18, height: 18, listPrice: 345, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: '30" microwave shelf wall cabinet with vent cutout.' },
  { id: 'cat-aw-023', manufacturer: 'American Woodmark', name: 'Wall 24"x36"', sku: 'W2436-AW', cabinetType: 'wall', width: 24, depth: 12, height: 36, listPrice: 312, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'Single door wall, 36" height, 2 adjustable shelves.' },
  { id: 'cat-aw-024', manufacturer: 'American Woodmark', name: 'Sink Base 33"', sku: 'SB33-AW', cabinetType: 'base', width: 33, depth: 24, height: 34.5, listPrice: 395, doorStyleCompatibility: ['shaker', 'raised-panel', 'recessed-panel', 'slab'], availability: 'in-stock', leadTime: '5-7 business days', description: 'False front sink base, 33" width.' },
];

export const catalogItems: CatalogItem[] = [
  ...fabuwood,
  ...kraftmaid,
  ...merillat,
  ...americanWoodmark,
];

export const manufacturers = ['Fabuwood', 'KraftMaid', 'Merillat', 'American Woodmark'] as const;
export type Manufacturer = (typeof manufacturers)[number];

export function getCatalogByManufacturer(mfr: Manufacturer): CatalogItem[] {
  return catalogItems.filter((item) => item.manufacturer === mfr);
}

export function searchCatalog(query: string): CatalogItem[] {
  const q = query.toLowerCase();
  return catalogItems.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.manufacturer.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
  );
}
