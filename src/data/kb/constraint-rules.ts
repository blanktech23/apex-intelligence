// Constraint Rules — 20 NKBA guidelines with status for demo kitchen
// References actual cabinet/appliance IDs from floor-plan-data.ts

export type Severity = 'P1' | 'P2' | 'P3';
export type RuleStatus = 'pass' | 'fail' | 'warning';

export interface ConstraintRule {
  id: string;
  code: string;
  name: string;
  description: string;
  nkbaRef: string;
  severity: Severity;
  status: RuleStatus;
  message: string;
  affectedItemIds: string[];
  measurement?: {
    actual: number;
    required: number;
    unit: string;
  };
}

export const constraintRules: ConstraintRule[] = [
  // === P1 FAILURES (3) ===
  {
    id: 'rule-01',
    code: 'ISLAND-CLR',
    name: 'Island Walkway Clearance',
    description: 'Minimum 42" clearance between island and surrounding cabinets/walls for single-cook kitchens. 48" for multi-cook.',
    nkbaRef: 'NKBA 4.3',
    severity: 'P1',
    status: 'fail',
    message: 'Island-to-east-wall clearance is 38". Minimum 42" required (NKBA 4.3). Move island 4" west or reduce island depth.',
    affectedItemIds: ['cab-15', 'cab-16', 'cab-17', 'cab-10'],
    measurement: { actual: 38, required: 42, unit: 'inches' },
  },
  {
    id: 'rule-02',
    code: 'BLIND-FILLER',
    name: 'Blind Corner Filler Strip',
    description: 'Blind corner cabinets require a 3" minimum filler strip to ensure adjacent door/drawer clearance.',
    nkbaRef: 'NKBA 12.1',
    severity: 'P1',
    status: 'fail',
    message: 'Blind base corner BBC36-LH (cab-01) is missing required 3" filler strip. Adjacent door will bind on perpendicular cabinet face.',
    affectedItemIds: ['cab-01', 'cab-14'],
  },
  {
    id: 'rule-03',
    code: 'DW-SINK-DIST',
    name: 'Dishwasher-to-Sink Distance',
    description: 'Dishwasher should be within 36" of the nearest edge of the sink for ergonomic loading/unloading.',
    nkbaRef: 'NKBA 8.1',
    severity: 'P1',
    status: 'fail',
    message: 'Dishwasher (app-02) is 40" from sink edge. Maximum recommended distance is 36" (NKBA 8.1). Swap cab-04 position with dishwasher.',
    affectedItemIds: ['app-02', 'fix-01', 'cab-04'],
    measurement: { actual: 40, required: 36, unit: 'inches' },
  },

  // === P2 WARNINGS (2) ===
  {
    id: 'rule-04',
    code: 'WORK-TRI',
    name: 'Work Triangle Total Distance',
    description: 'Sum of work triangle legs (sink, range, fridge) should be between 12\' and 26\'. Each leg 4\'-9\'.',
    nkbaRef: 'NKBA 1.1',
    severity: 'P2',
    status: 'warning',
    message: 'Work triangle total is 23.5\'. Within 26\' max but approaching upper limit. Consider if layout changes are warranted.',
    affectedItemIds: ['fix-01', 'app-01', 'app-03'],
    measurement: { actual: 23.5, required: 26, unit: 'feet' },
  },
  {
    id: 'rule-05',
    code: 'CROWN-GAP',
    name: 'Crown Molding to Ceiling Gap',
    description: 'Crown molding should leave at least 1" gap from ceiling for expansion/installation tolerance, or be scribed to ceiling.',
    nkbaRef: 'NKBA 15.2',
    severity: 'P2',
    status: 'warning',
    message: 'Crown molding top edge is 0.5" from ceiling. Recommend 1"+ gap or scribe to ceiling to avoid buckling from seasonal expansion.',
    affectedItemIds: ['cab-06', 'cab-07', 'cab-11', 'cab-12'],
    measurement: { actual: 0.5, required: 1, unit: 'inches' },
  },

  // === P3 INFO (1) ===
  {
    id: 'rule-06',
    code: 'TASK-LIGHT',
    name: 'Task Lighting Above Prep Area',
    description: 'NKBA recommends dedicated task lighting at all work surfaces, particularly prep areas not near windows.',
    nkbaRef: 'NKBA 11.4',
    severity: 'P3',
    status: 'warning',
    message: 'No under-cabinet task lighting specified above island prep area. Consider LED strip under upper cabinets or pendant fixtures above island.',
    affectedItemIds: ['cab-15', 'cab-16', 'cab-17'],
  },

  // === PASSES (14) ===
  {
    id: 'rule-07',
    code: 'CTR-HT',
    name: 'Counter Height',
    description: 'Standard counter height is 36" (34.5" cabinet + 1.5" countertop).',
    nkbaRef: 'NKBA 2.1',
    severity: 'P1',
    status: 'pass',
    message: 'All base cabinets at 34.5" + 1.5" countertop = 36". Meets standard.',
    affectedItemIds: [],
    measurement: { actual: 36, required: 36, unit: 'inches' },
  },
  {
    id: 'rule-08',
    code: 'VENT-CLR',
    name: 'Range Ventilation Clearance',
    description: 'Minimum 24" between cooktop surface and bottom of ventilation hood or microwave.',
    nkbaRef: 'NKBA 9.1',
    severity: 'P1',
    status: 'pass',
    message: 'Over-range microwave (app-04) mounted at 30" above cooktop. Exceeds 24" minimum.',
    affectedItemIds: ['app-01', 'app-04'],
    measurement: { actual: 30, required: 24, unit: 'inches' },
  },
  {
    id: 'rule-09',
    code: 'SINK-LAND',
    name: 'Sink Landing Area',
    description: 'Minimum 24" landing area on one side of sink, 18" on the other.',
    nkbaRef: 'NKBA 6.1',
    severity: 'P1',
    status: 'pass',
    message: 'Sink has 18" (cab-02) on left and 21" (cab-04) on right. Both sides meet minimums.',
    affectedItemIds: ['cab-02', 'cab-03', 'cab-04'],
  },
  {
    id: 'rule-10',
    code: 'RANGE-LAND',
    name: 'Range Landing Area',
    description: 'Minimum 12" landing area on one side of range, 15" on the other.',
    nkbaRef: 'NKBA 7.1',
    severity: 'P1',
    status: 'pass',
    message: 'Range has 18" (cab-09) on one side and 24" (cab-10) on the other. Meets minimums.',
    affectedItemIds: ['app-01', 'cab-09', 'cab-10'],
  },
  {
    id: 'rule-11',
    code: 'DOOR-CLR',
    name: 'Door Clearance Zone',
    description: 'No cabinet doors or appliance doors should conflict with entry/exit door swing.',
    nkbaRef: 'NKBA 3.2',
    severity: 'P1',
    status: 'pass',
    message: 'Entry door (open-01) swing clears all cabinets and appliances. No conflicts detected.',
    affectedItemIds: ['open-01'],
  },
  {
    id: 'rule-12',
    code: 'FRIDGE-LAND',
    name: 'Refrigerator Landing Area',
    description: 'Minimum 15" landing area on handle side of refrigerator.',
    nkbaRef: 'NKBA 7.3',
    severity: 'P1',
    status: 'pass',
    message: 'Refrigerator has 15" counter (cab-05) on handle side. Meets minimum.',
    affectedItemIds: ['app-03', 'cab-05'],
  },
  {
    id: 'rule-13',
    code: 'WALL-CAB-HT',
    name: 'Wall Cabinet Mounting Height',
    description: 'Bottom of wall cabinets should be 54" from floor (18" above 36" counter).',
    nkbaRef: 'NKBA 2.3',
    severity: 'P2',
    status: 'pass',
    message: 'All wall cabinets mounted with bottom at 54" AFF. Standard 18" backsplash height maintained.',
    affectedItemIds: ['cab-06', 'cab-07', 'cab-11', 'cab-12'],
    measurement: { actual: 54, required: 54, unit: 'inches' },
  },
  {
    id: 'rule-14',
    code: 'TOE-KICK',
    name: 'Toe Kick Dimensions',
    description: 'Toe kick should be 3-4" deep and 3-4.5" high.',
    nkbaRef: 'NKBA 2.2',
    severity: 'P2',
    status: 'pass',
    message: 'All base cabinets have 4" high x 3" deep toe kick. Within NKBA range.',
    affectedItemIds: [],
    measurement: { actual: 4, required: 3, unit: 'inches' },
  },
  {
    id: 'rule-15',
    code: 'CORNER-ACCESS',
    name: 'Corner Cabinet Accessibility',
    description: 'Corner cabinets must have functional interior access (lazy susan, blind pull-out, or swing-out).',
    nkbaRef: 'NKBA 12.3',
    severity: 'P2',
    status: 'pass',
    message: 'Lazy susan (cab-14) provides full rotational access. Blind corners (cab-01, cab-08) have pull-out shelves specified.',
    affectedItemIds: ['cab-01', 'cab-08', 'cab-14'],
  },
  {
    id: 'rule-16',
    code: 'WINDOW-CLR',
    name: 'Window Obstruction Check',
    description: 'Wall cabinets must not obstruct window operation or sightlines.',
    nkbaRef: 'NKBA 3.5',
    severity: 'P2',
    status: 'pass',
    message: 'North window (open-02) falls between wall cabinets cab-06 and cab-07. No obstruction.',
    affectedItemIds: ['open-02', 'cab-06', 'cab-07'],
  },
  {
    id: 'rule-17',
    code: 'ELEC-GFI',
    name: 'GFCI Protection Near Water',
    description: 'All countertop receptacles within 6\' of water source must be GFCI protected.',
    nkbaRef: 'NKBA 10.1',
    severity: 'P1',
    status: 'pass',
    message: 'Electrical plan note: All counter receptacles specified as GFCI. Code compliant.',
    affectedItemIds: ['fix-01'],
  },
  {
    id: 'rule-18',
    code: 'DW-DOOR-CLR',
    name: 'Dishwasher Door Clearance',
    description: 'Dishwasher door must fully open without hitting island or opposing cabinets.',
    nkbaRef: 'NKBA 8.3',
    severity: 'P1',
    status: 'pass',
    message: 'Dishwasher door opens into 38" aisle (island side). Minimum 21" for full open. Passes.',
    affectedItemIds: ['app-02', 'cab-16'],
    measurement: { actual: 38, required: 21, unit: 'inches' },
  },
  {
    id: 'rule-19',
    code: 'ISLAND-SIZE',
    name: 'Island Minimum Size',
    description: 'Islands should be at least 24" deep and 48" long to be functional.',
    nkbaRef: 'NKBA 4.5',
    severity: 'P2',
    status: 'pass',
    message: 'Island is 78" long x 24" deep. Exceeds 48"x24" minimum.',
    affectedItemIds: ['cab-15', 'cab-16', 'cab-17'],
    measurement: { actual: 78, required: 48, unit: 'inches' },
  },
  {
    id: 'rule-20',
    code: 'WORK-TRI-LEG',
    name: 'Work Triangle Individual Legs',
    description: 'Each work triangle leg must be between 4\' and 9\'.',
    nkbaRef: 'NKBA 1.2',
    severity: 'P1',
    status: 'pass',
    message: 'Sink-to-range: 8.2\'. Range-to-fridge: 7.8\'. Fridge-to-sink: 7.5\'. All legs within 4\'-9\' range.',
    affectedItemIds: ['fix-01', 'app-01', 'app-03'],
  },
];

// === HELPERS ===

export function getFailures(): ConstraintRule[] {
  return constraintRules.filter((r) => r.status === 'fail');
}

export function getWarnings(): ConstraintRule[] {
  return constraintRules.filter((r) => r.status === 'warning');
}

export function getPasses(): ConstraintRule[] {
  return constraintRules.filter((r) => r.status === 'pass');
}

export function getRulesByAffectedItem(itemId: string): ConstraintRule[] {
  return constraintRules.filter((r) => r.affectedItemIds.includes(itemId));
}

export function getConstraintSummary(): { total: number; pass: number; fail: number; warning: number } {
  return {
    total: constraintRules.length,
    pass: constraintRules.filter((r) => r.status === 'pass').length,
    fail: constraintRules.filter((r) => r.status === 'fail').length,
    warning: constraintRules.filter((r) => r.status === 'warning').length,
  };
}
