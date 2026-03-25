// Floor Plan Data — L-shaped kitchen 12'x14' (144"x168")
// Fabuwood Allure Galaxy Frost door style, realistic SKU conventions

export type WallName = 'north' | 'east' | 'south' | 'west' | 'island';

export type CabinetType = 'base' | 'wall' | 'tall' | 'corner' | 'island';

export type CabinetSubType =
  | 'standard'
  | 'blind'
  | 'diagonal'
  | 'lazy-susan'
  | 'sink'
  | 'drawer';

export interface Cabinet {
  id: string;
  type: CabinetType;
  subType: CabinetSubType;
  sku: string;
  name: string;
  manufacturer: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
  rotation: number;
  wall: WallName;
  doorStyle: string;
  finish: string;
  modifications: string[];
}

export interface Appliance {
  id: string;
  type: 'appliance';
  name: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  model: string;
}

export interface Fixture {
  id: string;
  type: 'fixture';
  name: string;
  x: number;
  y: number;
  width: number;
  depth: number;
}

export interface WallSegment {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  thickness: number;
}

export interface Opening {
  id: string;
  type: 'door' | 'window';
  wall: WallName;
  x: number;
  y: number;
  width: number;
  height: number;
  sillHeight?: number;
  swingDirection?: 'left' | 'right' | 'none';
}

export interface FloorPlan {
  roomWidth: number;
  roomDepth: number;
  ceilingHeight: number;
  walls: WallSegment[];
  openings: Opening[];
  cabinets: Cabinet[];
  appliances: Appliance[];
  fixtures: Fixture[];
}

export const floorPlan: FloorPlan = {
  roomWidth: 168, // 14'
  roomDepth: 144, // 12'
  ceilingHeight: 96,
  walls: [
    { id: 'wall-n', start: { x: 0, y: 0 }, end: { x: 168, y: 0 }, thickness: 5 },
    { id: 'wall-e', start: { x: 168, y: 0 }, end: { x: 168, y: 144 }, thickness: 5 },
    { id: 'wall-s', start: { x: 168, y: 144 }, end: { x: 0, y: 144 }, thickness: 5 },
    { id: 'wall-w', start: { x: 0, y: 144 }, end: { x: 0, y: 0 }, thickness: 5 },
  ],
  openings: [
    { id: 'open-01', type: 'door', wall: 'south', x: 120, y: 144, width: 36, height: 80, swingDirection: 'right' },
    { id: 'open-02', type: 'window', wall: 'north', x: 60, y: 0, width: 48, height: 36, sillHeight: 42 },
    { id: 'open-03', type: 'window', wall: 'east', x: 168, y: 36, width: 36, height: 36, sillHeight: 42 },
  ],
  cabinets: [
    // === NORTH WALL (sink run, L-shape long leg) ===
    { id: 'cab-01', type: 'corner', subType: 'blind', sku: 'BBC36-LH', name: 'Blind Base Corner Left', manufacturer: 'Fabuwood', x: 0, y: 0, width: 36, depth: 24, height: 34.5, rotation: 0, wall: 'north', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: [] },
    { id: 'cab-02', type: 'base', subType: 'standard', sku: 'B18', name: 'Base 18"', manufacturer: 'Fabuwood', x: 36, y: 0, width: 18, depth: 24, height: 34.5, rotation: 0, wall: 'north', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: ['soft-close'] },
    { id: 'cab-03', type: 'base', subType: 'sink', sku: 'SB36', name: 'Sink Base 36"', manufacturer: 'Fabuwood', x: 54, y: 0, width: 36, depth: 24, height: 34.5, rotation: 0, wall: 'north', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: [] },
    { id: 'cab-04', type: 'base', subType: 'standard', sku: 'B21', name: 'Base 21"', manufacturer: 'Fabuwood', x: 90, y: 0, width: 21, depth: 24, height: 34.5, rotation: 0, wall: 'north', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: ['roll-out-tray'] },
    { id: 'cab-05', type: 'base', subType: 'drawer', sku: 'DB15', name: 'Drawer Base 15"', manufacturer: 'Fabuwood', x: 111, y: 0, width: 15, depth: 24, height: 34.5, rotation: 0, wall: 'north', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: ['soft-close'] },

    // North wall uppers (above sink run)
    { id: 'cab-06', type: 'wall', subType: 'standard', sku: 'W3630', name: 'Wall 36"x30"', manufacturer: 'Fabuwood', x: 0, y: 0, width: 36, depth: 12, height: 30, rotation: 0, wall: 'north', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: [] },
    { id: 'cab-07', type: 'wall', subType: 'standard', sku: 'W3030', name: 'Wall 30"x30"', manufacturer: 'Fabuwood', x: 96, y: 0, width: 30, depth: 12, height: 30, rotation: 0, wall: 'north', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: ['glass-insert'] },

    // === EAST WALL (range run, L-shape short leg) ===
    { id: 'cab-08', type: 'corner', subType: 'blind', sku: 'BBC42-RH', name: 'Blind Base Corner Right', manufacturer: 'Fabuwood', x: 168, y: 0, width: 42, depth: 24, height: 34.5, rotation: 90, wall: 'east', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: [] },
    { id: 'cab-09', type: 'base', subType: 'drawer', sku: 'DB18', name: 'Drawer Base 18"', manufacturer: 'Fabuwood', x: 168, y: 42, width: 18, depth: 24, height: 34.5, rotation: 90, wall: 'east', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: ['soft-close'] },
    // 30" range gap at y: 60-90
    { id: 'cab-10', type: 'base', subType: 'standard', sku: 'B24', name: 'Base 24"', manufacturer: 'Fabuwood', x: 168, y: 90, width: 24, depth: 24, height: 34.5, rotation: 90, wall: 'east', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: ['roll-out-tray'] },

    // East wall uppers
    { id: 'cab-11', type: 'corner', subType: 'diagonal', sku: 'WDC2430', name: 'Wall Diagonal Corner 24"x30"', manufacturer: 'Fabuwood', x: 168, y: 0, width: 24, depth: 24, height: 30, rotation: 90, wall: 'east', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: [] },
    { id: 'cab-12', type: 'wall', subType: 'standard', sku: 'W1830', name: 'Wall 18"x30"', manufacturer: 'Fabuwood', x: 168, y: 24, width: 18, depth: 12, height: 30, rotation: 90, wall: 'east', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: [] },

    // === WEST WALL (tall pantry) ===
    { id: 'cab-13', type: 'tall', subType: 'standard', sku: 'T189624', name: 'Tall Pantry 18"x96"', manufacturer: 'Fabuwood', x: 0, y: 120, width: 18, depth: 24, height: 96, rotation: 270, wall: 'west', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: ['roll-out-tray'] },
    { id: 'cab-14', type: 'corner', subType: 'lazy-susan', sku: 'BLS33', name: 'Lazy Susan Base 33"', manufacturer: 'Fabuwood', x: 0, y: 0, width: 33, depth: 33, height: 34.5, rotation: 0, wall: 'west', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: [] },

    // === ISLAND (3 cabinets) ===
    { id: 'cab-15', type: 'island', subType: 'drawer', sku: 'DB24', name: 'Island Drawer Base 24"', manufacturer: 'Fabuwood', x: 48, y: 72, width: 24, depth: 24, height: 34.5, rotation: 180, wall: 'island', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: ['soft-close'] },
    { id: 'cab-16', type: 'island', subType: 'standard', sku: 'B30', name: 'Island Base 30"', manufacturer: 'Fabuwood', x: 72, y: 72, width: 30, depth: 24, height: 34.5, rotation: 180, wall: 'island', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: ['finished-end'] },
    { id: 'cab-17', type: 'island', subType: 'standard', sku: 'B24', name: 'Island Base 24"', manufacturer: 'Fabuwood', x: 102, y: 72, width: 24, depth: 24, height: 34.5, rotation: 180, wall: 'island', doorStyle: 'shaker', finish: 'Galaxy Frost', modifications: ['finished-end'] },
  ],
  appliances: [
    { id: 'app-01', type: 'appliance', name: '30" Gas Range', x: 168, y: 60, width: 30, depth: 25, model: 'GE Profile PGB960' },
    { id: 'app-02', type: 'appliance', name: '24" Dishwasher', x: 90, y: 0, width: 24, depth: 24, model: 'Bosch SHPM88Z75N' },
    { id: 'app-03', type: 'appliance', name: '36" Refrigerator', x: 132, y: 0, width: 36, depth: 30, model: 'LG LRMVS3006S' },
    { id: 'app-04', type: 'appliance', name: '30" Over-Range Microwave', x: 168, y: 60, width: 30, depth: 16, model: 'Whirlpool WMH53521HZ' },
  ],
  fixtures: [
    { id: 'fix-01', type: 'fixture', name: '33" Undermount Sink', x: 55.5, y: 0, width: 33, depth: 22 },
    { id: 'fix-02', type: 'fixture', name: 'Single-Handle Faucet', x: 70, y: 0, width: 4, depth: 8 },
  ],
};
