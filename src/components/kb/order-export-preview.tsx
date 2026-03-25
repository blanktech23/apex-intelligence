"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileCode2,
  FileText,
  ClipboardList,
  Factory,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ExportTab = "xml" | "specs" | "contract" | "orders";

interface TabDef {
  key: ExportTab;
  label: string;
  icon: React.ElementType;
}

const tabs: TabDef[] = [
  { key: "xml", label: "2020 XML", icon: FileCode2 },
  { key: "specs", label: "Spec Sheets", icon: FileText },
  { key: "contract", label: "Contract", icon: ClipboardList },
  { key: "orders", label: "Mfr Orders", icon: Factory },
];

/* ------------------------------------------------------------------ */
/*  Mock XML                                                           */
/* ------------------------------------------------------------------ */

const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<Design2020 version="11.12">
  <Project name="Johnson Kitchen" date="2026-03-24"
           designer="Sarah Mitchell" client="Robert Johnson">
    <Room name="Kitchen" width="168" depth="144"
          ceilingHeight="96" layout="L-shaped">
      <Cabinet sku="BBC36-LH" manufacturer="Fabuwood"
               series="Allure" doorStyle="Galaxy Frost"
               x="0" y="0" width="36" depth="24" height="34.5"
               rotation="0" wall="north"/>
      <Cabinet sku="B18" manufacturer="Fabuwood"
               series="Allure" doorStyle="Galaxy Frost"
               x="36" y="0" width="18" depth="24" height="34.5"
               modifications="soft-close" wall="north"/>
      <Cabinet sku="SB36" manufacturer="Fabuwood"
               x="54" y="0" width="36" depth="24" height="34.5"
               wall="north"/>
      <Cabinet sku="B21" manufacturer="Fabuwood"
               x="90" y="0" width="21" depth="24" height="34.5"
               modifications="roll-out-tray" wall="north"/>
      <Cabinet sku="DB15" manufacturer="Fabuwood"
               x="111" y="0" width="15" depth="24" height="34.5"
               modifications="soft-close" wall="north"/>
      <!-- ... 12 additional cabinets ... -->
      <Countertop material="Quartz" color="Calacatta"
                  sqft="62" edgeProfile="eased"/>
      <Appliance sku="GE-PGB960" type="range"
                 x="168" y="60" width="30"/>
      <Appliance sku="BOSCH-SHPM88Z75N" type="dishwasher"
                 x="90" y="0" width="24"/>
      <Appliance sku="LG-LRMVS3006S" type="refrigerator"
                 x="132" y="0" width="36"/>
    </Room>
  </Project>
</Design2020>`;

/* ------------------------------------------------------------------ */
/*  Cabinet Schedule for Spec Sheet                                    */
/* ------------------------------------------------------------------ */

const cabinetSchedule = [
  { sku: "BBC36-LH", desc: 'Blind Base Corner Left 36"', qty: 1, wall: "North", mods: "--" },
  { sku: "B18", desc: 'Base 18"', qty: 1, wall: "North", mods: "Soft-Close" },
  { sku: "SB36", desc: 'Sink Base 36"', qty: 1, wall: "North", mods: "--" },
  { sku: "B21", desc: 'Base 21"', qty: 1, wall: "North", mods: "Roll-Out Tray x2" },
  { sku: "DB15", desc: 'Drawer Base 15"', qty: 1, wall: "North", mods: "Soft-Close" },
  { sku: "W3630", desc: 'Wall 36"x30"', qty: 1, wall: "North", mods: "--" },
  { sku: "W3030", desc: 'Wall 30"x30"', qty: 1, wall: "North", mods: "Glass Insert" },
  { sku: "BBC42-RH", desc: 'Blind Base Corner Right 42"', qty: 1, wall: "East", mods: "--" },
  { sku: "DB18", desc: 'Drawer Base 18"', qty: 1, wall: "East", mods: "Soft-Close" },
  { sku: "B24", desc: 'Base 24"', qty: 1, wall: "East", mods: "Roll-Out Tray" },
  { sku: "WDC2430", desc: 'Wall Diagonal Corner 24"x30"', qty: 1, wall: "East", mods: "--" },
  { sku: "W1830", desc: 'Wall 18"x30"', qty: 1, wall: "East", mods: "--" },
  { sku: "T189624", desc: 'Tall Pantry 18"x96"', qty: 1, wall: "West", mods: "Roll-Out Tray" },
  { sku: "BLS33", desc: 'Lazy Susan Base 33"', qty: 1, wall: "West", mods: "--" },
  { sku: "DB24", desc: 'Island Drawer Base 24"', qty: 1, wall: "Island", mods: "Soft-Close" },
  { sku: "B30", desc: 'Island Base 30"', qty: 1, wall: "Island", mods: "Finished End" },
  { sku: "B24", desc: 'Island Base 24"', qty: 1, wall: "Island", mods: "Finished End" },
];

/* ------------------------------------------------------------------ */
/*  Fabuwood Order Items                                               */
/* ------------------------------------------------------------------ */

const fabuOrderItems = [
  { sku: "BBC36-LH", name: 'Blind Base Corner Left 36"', qty: 1, mod: "", price: 512 },
  { sku: "B18", name: 'Base 18"', qty: 1, mod: "Soft-Close", price: 357 },
  { sku: "SB36", name: 'Sink Base 36"', qty: 1, mod: "", price: 398 },
  { sku: "B21", name: 'Base 21"', qty: 1, mod: "Roll-Out Tray x2", price: 538 },
  { sku: "DB15", name: 'Drawer Base 15"', qty: 1, mod: "Soft-Close", price: 440 },
  { sku: "W3630", name: 'Wall 36"x30"', qty: 1, mod: "", price: 335 },
  { sku: "W3030", name: 'Wall 30"x30"', qty: 1, mod: "Glass Insert", price: 423 },
  { sku: "BBC42-RH", name: 'Blind Base Corner Right 42"', qty: 1, mod: "", price: 548 },
  { sku: "DB18", name: 'Drawer Base 18"', qty: 1, mod: "Soft-Close", price: 473 },
  { sku: "B24", name: 'Base 24"', qty: 1, mod: "Roll-Out Tray", price: 575 },
  { sku: "WDC2430", name: 'Wall Diagonal Corner 24"x30"', qty: 1, mod: "", price: 365 },
  { sku: "W1830", name: 'Wall 18"x30"', qty: 1, mod: "", price: 225 },
  { sku: "T189624", name: 'Tall Pantry 18"x96"', qty: 1, mod: "Roll-Out Tray", price: 1085 },
  { sku: "BLS33", name: 'Lazy Susan Base 33"', qty: 1, mod: "", price: 685 },
  { sku: "DB24", name: 'Island Drawer Base 24"', qty: 1, mod: "Soft-Close", price: 510 },
  { sku: "B30", name: 'Island Base 30"', qty: 1, mod: "Finished End", price: 510 },
  { sku: "B24", name: 'Island Base 24"', qty: 1, mod: "Finished End", price: 470 },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OrderExportPreview({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState<ExportTab>("xml");

  const fabuTotal = fabuOrderItems.reduce((a, i) => a + i.price * i.qty, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Order Export Preview</DialogTitle>
          <DialogDescription>
            Review export formats before downloading or submitting
          </DialogDescription>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all border-b-2 ${
                  activeTab === tab.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="min-h-[400px]">
          {/* ---- 2020 XML ---- */}
          {activeTab === "xml" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  2020 Design XML export format (v11.12 compatible)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => toast.success("XML downloaded: johnson-kitchen-2026-03-24.xml")}
                >
                  <Download className="size-3" />
                  Download XML
                </Button>
              </div>
              <div className="rounded-lg border border-border bg-[#0d1117] p-4 overflow-x-auto">
                <pre className="text-[11px] leading-relaxed font-mono text-green-400 whitespace-pre">
                  {mockXml}
                </pre>
              </div>
            </div>
          )}

          {/* ---- Spec Sheets ---- */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Room specification summary</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => toast.success("Spec sheet downloaded as PDF")}
                >
                  <Download className="size-3" />
                  Download PDF
                </Button>
              </div>

              {/* Room header */}
              <div className="glass rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">
                  Kitchen &mdash; 12&apos;-0&quot; x 14&apos;-0&quot;
                </h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs">
                  <div>
                    <span className="text-muted-foreground">Manufacturer:</span>
                    <span className="ml-2 font-medium text-foreground">Fabuwood Allure Series</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Door Style:</span>
                    <span className="ml-2 font-medium text-foreground">Galaxy, Full Overlay</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Species:</span>
                    <span className="ml-2 font-medium text-foreground">Birch</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Crown:</span>
                    <span className="ml-2 font-medium text-foreground">Stacked TF396 + TF696</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Perimeter Finish:</span>
                    <span className="ml-2 font-medium text-foreground">Frost</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Island Finish:</span>
                    <span className="ml-2 font-medium text-foreground">Timber</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accent Finish:</span>
                    <span className="ml-2 font-medium text-foreground">Navy</span>
                  </div>
                </div>
              </div>

              {/* Cabinet schedule table */}
              <div className="rounded-lg border border-border overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/30 text-left">
                      <th className="px-3 py-2 font-medium text-muted-foreground">SKU</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground">Description</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground text-center">Qty</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground">Wall</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground">Modifications</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {cabinetSchedule.map((row, i) => (
                      <tr key={`${row.sku}-${i}`} className="hover:bg-muted/10">
                        <td className="px-3 py-2 font-mono text-muted-foreground">{row.sku}</td>
                        <td className="px-3 py-2 text-foreground">{row.desc}</td>
                        <td className="px-3 py-2 text-center text-muted-foreground">{row.qty}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.wall}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.mods}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---- Contract Package ---- */}
          {activeTab === "contract" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Contract package summary</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => toast.success("Contract package downloaded as PDF")}
                >
                  <Download className="size-3" />
                  Download PDF
                </Button>
              </div>

              <div className="glass rounded-lg p-4 space-y-4 text-sm">
                {/* Scope of Work */}
                <div>
                  <h4 className="font-semibold text-foreground mb-1.5">Scope of Work</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Design, supply, and installation of a complete L-shaped kitchen remodel
                    including 17 Fabuwood Allure Galaxy cabinets (base, wall, tall, and island
                    configurations), quartz countertops (Calacatta finish, 62 sq ft), GE/LG/Bosch
                    appliance package, Blanco undermount sink with Delta faucet, and all associated
                    hardware, trim, and molding. Includes demolition of existing cabinetry, plumbing
                    rough-in adjustments, and electrical modifications for appliance placement.
                  </p>
                </div>

                {/* Material Summary */}
                <div>
                  <h4 className="font-semibold text-foreground mb-1.5">Material Summary</h4>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="rounded-md border border-border p-2.5 text-center">
                      <p className="text-lg font-bold text-foreground">17</p>
                      <p className="text-muted-foreground">Cabinets</p>
                    </div>
                    <div className="rounded-md border border-border p-2.5 text-center">
                      <p className="text-lg font-bold text-foreground">62</p>
                      <p className="text-muted-foreground">Countertop sq ft</p>
                    </div>
                    <div className="rounded-md border border-border p-2.5 text-center">
                      <p className="text-lg font-bold text-foreground">4</p>
                      <p className="text-muted-foreground">Appliances</p>
                    </div>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div>
                  <h4 className="font-semibold text-foreground mb-1.5">Pricing Summary</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Materials & Modifications</span>
                      <span className="font-medium text-foreground">$24,890</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Labor (demolition + installation)</span>
                      <span className="font-medium text-foreground">$8,400</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Contingency (10%)</span>
                      <span className="font-medium text-foreground">$3,329</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between font-semibold text-foreground">
                      <span>Total</span>
                      <span>$36,619</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-semibold text-foreground mb-1.5">Timeline</h4>
                  <div className="space-y-1.5 text-xs">
                    {[
                      { phase: "Design Approval", date: "Week 1" },
                      { phase: "Order Placement", date: "Week 2" },
                      { phase: "Production", date: "Weeks 3-6" },
                      { phase: "Delivery", date: "Week 7" },
                      { phase: "Installation", date: "Weeks 8-9" },
                    ].map((step) => (
                      <div key={step.phase} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{step.phase}</span>
                        <span className="flex-1 border-b border-dashed border-border" />
                        <span className="font-medium text-foreground">{step.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms */}
                <div>
                  <h4 className="font-semibold text-foreground mb-1.5">Terms</h4>
                  <p className="text-xs text-muted-foreground italic">
                    Standard terms and conditions apply. 50% deposit required at signing,
                    40% due at delivery, 10% balance due at installation completion.
                    Changes after order placement subject to restocking fees.
                  </p>
                </div>

                {/* Signature lines */}
                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div>
                    <div className="h-px bg-border mb-1" />
                    <p className="text-[10px] text-muted-foreground">Client Signature / Date</p>
                  </div>
                  <div>
                    <div className="h-px bg-border mb-1" />
                    <p className="text-[10px] text-muted-foreground">Designer Signature / Date</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---- Manufacturer Orders ---- */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Per-manufacturer order breakdown</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => toast.success("Manufacturer orders downloaded")}
                >
                  <Download className="size-3" />
                  Download All
                </Button>
              </div>

              {/* Fabuwood order */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center justify-between bg-muted/30 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Factory className="size-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-semibold text-foreground">Fabuwood — Allure Galaxy</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                    <CheckCircle2 className="size-3" />
                    Ready to Submit
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {fabuOrderItems.map((item, i) => (
                    <div key={`${item.sku}-${i}`} className="grid grid-cols-12 items-center gap-2 px-4 py-2 text-xs">
                      <div className="col-span-2 font-mono text-muted-foreground">{item.sku}</div>
                      <div className="col-span-5 text-foreground">{item.name}</div>
                      <div className="col-span-2 text-muted-foreground">{item.mod || "--"}</div>
                      <div className="col-span-1 text-center text-muted-foreground">{item.qty}</div>
                      <div className="col-span-2 text-right font-medium text-foreground">
                        ${item.price.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-muted/20 px-4 py-2.5">
                    <span className="text-xs font-semibold text-foreground">Subtotal</span>
                    <span className="text-sm font-bold text-foreground">
                      ${fabuTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Placeholder */}
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Additional manufacturers (countertop, appliance, fixture suppliers)
                  would appear here with their own order summaries.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
