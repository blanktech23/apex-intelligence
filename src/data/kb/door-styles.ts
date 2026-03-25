// Door Styles — Configuration cascade: Style → Overlay → Species → Finish → Modifications

export type DoorProfile =
  | 'shaker'
  | 'slab'
  | 'raised-panel'
  | 'recessed-panel'
  | 'beadboard'
  | 'arch'
  | 'mission';

export type Construction = 'mortise-tenon' | 'mitered' | 'slab';

export type Material = 'solid-wood' | 'mdf' | 'thermofoil';

export interface DoorStyle {
  id: string;
  name: string;
  profile: DoorProfile;
  priceGroup: number;
  construction: Construction;
  material: Material;
  description: string;
}

export interface OverlayType {
  id: string;
  name: 'Full Overlay' | 'Standard Overlay' | 'Inset';
  priceAdder: number;
  description: string;
}

export interface WoodSpecies {
  id: string;
  name: string;
  hardness: number; // Janka hardness
  grainPattern: string;
  availability: Record<string, boolean>; // doorStyleId -> available
}

export type FinishCategory = 'paint' | 'stain' | 'glaze';

export interface Finish {
  id: string;
  name: string;
  hex: string;
  species: string[]; // species IDs this finish works on
  category: FinishCategory;
}

export interface Modification {
  id: string;
  name: string;
  priceAdder: number;
  unit: string;
  applicableTo: string[]; // cabinet type IDs
  description: string;
}

// === DOOR STYLES ===
export const doorStyles: DoorStyle[] = [
  { id: 'ds-shaker', name: 'Shaker', profile: 'shaker', priceGroup: 3, construction: 'mortise-tenon', material: 'solid-wood', description: 'Clean 5-piece flat center panel. Most popular K&B style.' },
  { id: 'ds-slab', name: 'Slab', profile: 'slab', priceGroup: 2, construction: 'slab', material: 'mdf', description: 'Flat panel, no frame. Contemporary/modern aesthetic.' },
  { id: 'ds-raised-panel', name: 'Raised Panel', profile: 'raised-panel', priceGroup: 5, construction: 'mortise-tenon', material: 'solid-wood', description: 'Traditional raised center panel with contoured edges.' },
  { id: 'ds-recessed-panel', name: 'Recessed Panel', profile: 'recessed-panel', priceGroup: 4, construction: 'mortise-tenon', material: 'solid-wood', description: 'Flat panel set below frame. Transitional look.' },
  { id: 'ds-beadboard', name: 'Beadboard', profile: 'beadboard', priceGroup: 4, construction: 'mortise-tenon', material: 'solid-wood', description: 'Vertical bead pattern center panel. Cottage/farmhouse style.' },
  { id: 'ds-arch', name: 'Cathedral Arch', profile: 'arch', priceGroup: 6, construction: 'mitered', material: 'solid-wood', description: 'Arched top rail with raised panel. Traditional formal.' },
  { id: 'ds-mission', name: 'Mission', profile: 'mission', priceGroup: 5, construction: 'mortise-tenon', material: 'solid-wood', description: 'Craftsman-style with through-tenon detail.' },
];

// === OVERLAY TYPES ===
export const overlayTypes: OverlayType[] = [
  { id: 'ov-full', name: 'Full Overlay', priceAdder: 0, description: 'Doors cover face frame entirely. Standard on frameless. +$0.' },
  { id: 'ov-standard', name: 'Standard Overlay', priceAdder: -25, description: 'Doors partially cover face frame, revealing 1-1.25" between doors. -$25/cabinet.' },
  { id: 'ov-inset', name: 'Inset', priceAdder: 185, description: 'Doors flush with face frame. Requires precision fit. +$185/cabinet.' },
];

// === WOOD SPECIES ===
export const woodSpecies: WoodSpecies[] = [
  {
    id: 'sp-maple', name: 'Maple', hardness: 1450, grainPattern: 'Fine, uniform',
    availability: { 'ds-shaker': true, 'ds-slab': false, 'ds-raised-panel': true, 'ds-recessed-panel': true, 'ds-beadboard': true, 'ds-arch': true, 'ds-mission': true },
  },
  {
    id: 'sp-cherry', name: 'Cherry', hardness: 950, grainPattern: 'Fine, straight with occasional waves',
    availability: { 'ds-shaker': true, 'ds-slab': false, 'ds-raised-panel': true, 'ds-recessed-panel': true, 'ds-beadboard': false, 'ds-arch': true, 'ds-mission': true },
  },
  {
    id: 'sp-red-oak', name: 'Red Oak', hardness: 1290, grainPattern: 'Prominent, open grain',
    availability: { 'ds-shaker': true, 'ds-slab': false, 'ds-raised-panel': true, 'ds-recessed-panel': true, 'ds-beadboard': true, 'ds-arch': true, 'ds-mission': true },
  },
  {
    id: 'sp-birch', name: 'Birch', hardness: 1260, grainPattern: 'Fine, consistent',
    availability: { 'ds-shaker': true, 'ds-slab': false, 'ds-raised-panel': true, 'ds-recessed-panel': true, 'ds-beadboard': true, 'ds-arch': false, 'ds-mission': false },
  },
  {
    id: 'sp-mdf', name: 'Paint Grade (MDF)', hardness: 0, grainPattern: 'None — smooth',
    availability: { 'ds-shaker': true, 'ds-slab': true, 'ds-raised-panel': true, 'ds-recessed-panel': true, 'ds-beadboard': true, 'ds-arch': true, 'ds-mission': false },
  },
];

// === FINISHES ===
export const finishes: Finish[] = [
  // Paints (MDF + Maple + Birch)
  { id: 'fin-white', name: 'White', hex: '#FFFFFF', species: ['sp-mdf', 'sp-maple', 'sp-birch'], category: 'paint' },
  { id: 'fin-dove', name: 'Dove White', hex: '#F0EDE5', species: ['sp-mdf', 'sp-maple', 'sp-birch'], category: 'paint' },
  { id: 'fin-frost', name: 'Frost', hex: '#E8E6E1', species: ['sp-mdf', 'sp-maple', 'sp-birch'], category: 'paint' },
  { id: 'fin-linen', name: 'Linen', hex: '#EDE8D8', species: ['sp-mdf', 'sp-maple', 'sp-birch'], category: 'paint' },
  { id: 'fin-navy', name: 'Navy', hex: '#2C3E50', species: ['sp-mdf', 'sp-maple', 'sp-birch'], category: 'paint' },
  { id: 'fin-sage', name: 'Sage', hex: '#8BA888', species: ['sp-mdf', 'sp-maple', 'sp-birch'], category: 'paint' },
  { id: 'fin-graphite', name: 'Graphite', hex: '#4A4A4A', species: ['sp-mdf', 'sp-maple', 'sp-birch'], category: 'paint' },
  { id: 'fin-black', name: 'Black', hex: '#1A1A1A', species: ['sp-mdf', 'sp-maple', 'sp-birch'], category: 'paint' },

  // Stains (wood species only)
  { id: 'fin-natural', name: 'Natural', hex: '#D4A76A', species: ['sp-maple', 'sp-cherry', 'sp-red-oak', 'sp-birch'], category: 'stain' },
  { id: 'fin-honey', name: 'Honey', hex: '#C4923A', species: ['sp-maple', 'sp-cherry', 'sp-red-oak', 'sp-birch'], category: 'stain' },
  { id: 'fin-wheat', name: 'Wheat', hex: '#C5AB6F', species: ['sp-maple', 'sp-red-oak', 'sp-birch'], category: 'stain' },
  { id: 'fin-mocha', name: 'Mocha', hex: '#7B5B3A', species: ['sp-maple', 'sp-cherry', 'sp-red-oak', 'sp-birch'], category: 'stain' },
  { id: 'fin-timber', name: 'Timber', hex: '#6B4423', species: ['sp-maple', 'sp-cherry', 'sp-red-oak', 'sp-birch'], category: 'stain' },
  { id: 'fin-espresso', name: 'Espresso', hex: '#3C2415', species: ['sp-maple', 'sp-cherry', 'sp-red-oak', 'sp-birch'], category: 'stain' },
  { id: 'fin-ebony', name: 'Ebony', hex: '#2A1E14', species: ['sp-maple', 'sp-red-oak'], category: 'stain' },
  { id: 'fin-driftwood', name: 'Driftwood', hex: '#9B8E7E', species: ['sp-maple', 'sp-red-oak', 'sp-birch'], category: 'stain' },

  // Glazes (applied over paint or stain)
  { id: 'fin-pewter-glaze', name: 'Pewter Glaze', hex: '#8C8C8C', species: ['sp-mdf', 'sp-maple', 'sp-cherry', 'sp-birch'], category: 'glaze' },
  { id: 'fin-chocolate-glaze', name: 'Chocolate Glaze', hex: '#5C3317', species: ['sp-mdf', 'sp-maple', 'sp-cherry', 'sp-birch'], category: 'glaze' },
  { id: 'fin-coffee-glaze', name: 'Coffee Glaze', hex: '#6F4E37', species: ['sp-mdf', 'sp-maple', 'sp-cherry'], category: 'glaze' },
];

// === MODIFICATIONS ===
export const modifications: Modification[] = [
  { id: 'mod-glass-insert', name: 'Glass Insert', priceAdder: 120, unit: 'per door', applicableTo: ['wall', 'tall'], description: 'Clear tempered glass panel replaces center panel. Mullion frame included.' },
  { id: 'mod-mullion', name: 'Mullion Door', priceAdder: 85, unit: 'per door', applicableTo: ['wall'], description: 'Decorative mullion grid overlay on glass insert door.' },
  { id: 'mod-applied-molding', name: 'Applied Molding', priceAdder: 65, unit: 'per door', applicableTo: ['base', 'wall', 'tall', 'island'], description: 'Decorative molding applied to slab door face for added dimension.' },
  { id: 'mod-soft-close', name: 'Soft-Close Upgrade', priceAdder: 45, unit: 'per cabinet', applicableTo: ['base', 'wall', 'tall', 'corner', 'island', 'vanity'], description: 'Blumotion soft-close hinges and drawer glides. Prevents slamming.' },
  { id: 'mod-roll-out-tray', name: 'Roll-Out Tray', priceAdder: 95, unit: 'per tray', applicableTo: ['base', 'tall', 'island'], description: 'Full-extension roll-out shelf with raised edges. Ball-bearing glides.' },
  { id: 'mod-finished-end', name: 'Finished End Panel', priceAdder: 75, unit: 'per side', applicableTo: ['base', 'wall', 'tall', 'island'], description: 'Matching door-style panel applied to exposed cabinet end.' },
];

// === HELPERS ===

export function getFinishesForSpecies(speciesId: string): Finish[] {
  return finishes.filter((f) => f.species.includes(speciesId));
}

export function getCompatibleSpecies(doorStyleId: string): WoodSpecies[] {
  return woodSpecies.filter((sp) => sp.availability[doorStyleId]);
}

export function getModificationsForType(cabinetType: string): Modification[] {
  return modifications.filter((m) => m.applicableTo.includes(cabinetType));
}

export function calculateDoorPrice(
  basePrice: number,
  doorStyle: DoorStyle,
  overlay: OverlayType,
  mods: Modification[]
): number {
  const styleMultiplier = 1 + (doorStyle.priceGroup - 1) * 0.08;
  const modTotal = mods.reduce((sum, m) => sum + m.priceAdder, 0);
  return Math.round(basePrice * styleMultiplier + overlay.priceAdder + modTotal);
}
