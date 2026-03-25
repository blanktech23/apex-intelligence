// Elevation Data — Wall-specific views with cabinet assignments
// All cabinet IDs reference floor-plan-data.ts

export type CrownProfile = 'cove' | 'shaker' | 'stacked';

export interface ElevationWall {
  wallId: string;
  name: string;
  length: number; // inches
  cabinetIds: string[];
  crownProfile: CrownProfile;
  soffit: boolean;
  ceilingHeight: number;
}

export interface ElevationDimensions {
  toeKickHeight: number;
  baseHeight: number;
  counterHeight: number;
  backsplashHeight: number;
  wallCabinetBottom: number;
  wallCabinetTop30: number;
  wallCabinetTop36: number;
  wallCabinetTop42: number;
  tallCabinetTop: number;
}

export interface CrownMoldingProfile {
  id: string;
  name: string;
  profile: CrownProfile;
  height: number; // inches
  projection: number; // inches from cabinet face
  svgPath: string;
}

// === ELEVATION WALLS ===
export const elevationWalls: ElevationWall[] = [
  {
    wallId: 'elev-north',
    name: 'North Wall',
    length: 168,
    cabinetIds: ['cab-01', 'cab-02', 'cab-03', 'cab-04', 'cab-05', 'cab-06', 'cab-07'],
    crownProfile: 'shaker',
    soffit: false,
    ceilingHeight: 96,
  },
  {
    wallId: 'elev-east',
    name: 'East Wall',
    length: 144,
    cabinetIds: ['cab-08', 'cab-09', 'cab-10', 'cab-11', 'cab-12'],
    crownProfile: 'shaker',
    soffit: false,
    ceilingHeight: 96,
  },
  {
    wallId: 'elev-south',
    name: 'South Wall',
    length: 168,
    cabinetIds: [],
    crownProfile: 'shaker',
    soffit: false,
    ceilingHeight: 96,
  },
  {
    wallId: 'elev-west',
    name: 'West Wall',
    length: 144,
    cabinetIds: ['cab-13', 'cab-14'],
    crownProfile: 'shaker',
    soffit: false,
    ceilingHeight: 96,
  },
  {
    wallId: 'elev-island',
    name: 'Island',
    length: 78, // 24 + 30 + 24
    cabinetIds: ['cab-15', 'cab-16', 'cab-17'],
    crownProfile: 'shaker',
    soffit: false,
    ceilingHeight: 96,
  },
];

// === STANDARD DIMENSIONS ===
export const elevationDimensions: ElevationDimensions = {
  toeKickHeight: 4,
  baseHeight: 34.5,
  counterHeight: 36, // 34.5 + 1.5" countertop
  backsplashHeight: 18,
  wallCabinetBottom: 54, // 36" counter + 18" backsplash
  wallCabinetTop30: 84, // 54 + 30
  wallCabinetTop36: 90, // 54 + 36
  wallCabinetTop42: 96, // 54 + 42 (reaches ceiling)
  tallCabinetTop: 96,
};

// === CROWN MOLDING PROFILES ===
export const crownMoldingProfiles: CrownMoldingProfile[] = [
  {
    id: 'crown-cove',
    name: 'Classic Cove',
    profile: 'cove',
    height: 3.5,
    projection: 2.25,
    svgPath: 'M0,0 C0,14 14,14 14,0 L14,-3.5 L0,-3.5 Z',
  },
  {
    id: 'crown-shaker',
    name: 'Shaker Step',
    profile: 'shaker',
    height: 2.75,
    projection: 1.75,
    svgPath: 'M0,0 L0,-1.5 L7,-1.5 L7,-2.75 L11,-2.75 L11,0 Z',
  },
  {
    id: 'crown-stacked',
    name: 'Stacked Crown',
    profile: 'stacked',
    height: 5.25,
    projection: 3.5,
    svgPath: 'M0,0 L0,-2 L5,-2 C5,-3.5 10,-3.5 10,-2 L14,-2 L14,-5.25 L0,-5.25 Z',
  },
];

// === HELPERS ===

export function getElevationWall(wallId: string): ElevationWall | undefined {
  return elevationWalls.find((w) => w.wallId === wallId);
}

export function getWallsForCabinet(cabinetId: string): ElevationWall[] {
  return elevationWalls.filter((w) => w.cabinetIds.includes(cabinetId));
}

export function getCrownProfile(profile: CrownProfile): CrownMoldingProfile | undefined {
  return crownMoldingProfiles.find((c) => c.profile === profile);
}

export function getAvailableHeightAboveWallCabinets(wall: ElevationWall): number {
  // Space between top of 30" wall cabinets and ceiling
  return wall.ceilingHeight - elevationDimensions.wallCabinetTop30;
}
