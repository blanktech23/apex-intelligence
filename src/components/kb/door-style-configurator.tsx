"use client";

import { useState, useMemo } from "react";
import { Check, ChevronLeft, ChevronRight, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  doorStyles,
  overlayTypes,
  woodSpecies,
  finishes,
  modifications,
  type DoorStyle,
  type OverlayType,
  type WoodSpecies,
  type Finish,
  type Modification,
  type FinishCategory,
} from "@/data/kb/door-styles";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface DoorStyleConfig {
  doorStyle: DoorStyle;
  overlay: OverlayType;
  species: WoodSpecies;
  finish: Finish;
  modifications: Modification[];
}

interface DoorStyleConfiguratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (config: DoorStyleConfig) => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const STEPS = [
  "Door Style",
  "Overlay",
  "Species",
  "Finish",
  "Modifications",
] as const;

const PG_COLORS: Record<number, string> = {
  1: "bg-emerald-500/15 text-emerald-400",
  2: "bg-emerald-500/15 text-emerald-400",
  3: "bg-blue-500/15 text-blue-400",
  4: "bg-indigo-500/15 text-indigo-400",
  5: "bg-violet-500/15 text-violet-400",
  6: "bg-amber-500/15 text-amber-400",
  7: "bg-orange-500/15 text-orange-400",
  8: "bg-red-500/15 text-red-400",
};

/* ------------------------------------------------------------------ */
/*  Step Indicator                                                      */
/* ------------------------------------------------------------------ */

function StepIndicator({
  currentStep,
  onGoToStep,
}: {
  currentStep: number;
  onGoToStep: (step: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-0 py-3">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <button
            onClick={() => {
              if (i < currentStep) onGoToStep(i);
            }}
            disabled={i > currentStep}
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
              i < currentStep
                ? "bg-indigo-600 text-white cursor-pointer"
                : i === currentStep
                  ? "bg-indigo-600 text-white ring-2 ring-indigo-400/30"
                  : "bg-muted/30 text-muted-foreground/40"
            }`}
          >
            {i < currentStep ? (
              <Check className="size-3.5" />
            ) : (
              i + 1
            )}
          </button>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-6 ${
                i < currentStep ? "bg-indigo-600" : "bg-muted/30"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary Strip                                                       */
/* ------------------------------------------------------------------ */

function SummaryStrip({
  doorStyle,
  overlay,
  species,
  finish,
}: {
  doorStyle: DoorStyle | null;
  overlay: OverlayType | null;
  species: WoodSpecies | null;
  finish: Finish | null;
}) {
  const parts = [
    doorStyle?.name,
    overlay?.name,
    species?.name,
    finish?.name,
  ].filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-muted/20 border-b border-border text-[11px] text-muted-foreground">
      <Palette className="size-3 text-indigo-400 shrink-0" />
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground/30">&rsaquo;</span>}
          <span className="font-medium text-foreground/80">{p}</span>
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Door Profile SVG                                                    */
/* ------------------------------------------------------------------ */

function DoorProfileSVG({ profile }: { profile: string }) {
  return (
    <svg viewBox="0 0 40 52" className="w-10 h-13 mx-auto mb-2">
      <rect
        x={2}
        y={2}
        width={36}
        height={48}
        rx={1}
        fill="none"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth={1}
      />
      {profile === "shaker" && (
        <rect
          x={6}
          y={6}
          width={28}
          height={40}
          fill="none"
          stroke="rgba(148,163,184,0.3)"
          strokeWidth={0.75}
        />
      )}
      {profile === "slab" && null}
      {profile === "raised-panel" && (
        <>
          <rect
            x={6}
            y={6}
            width={28}
            height={40}
            fill="none"
            stroke="rgba(148,163,184,0.3)"
            strokeWidth={0.75}
          />
          <rect
            x={10}
            y={10}
            width={20}
            height={32}
            fill="rgba(148,163,184,0.06)"
            stroke="rgba(148,163,184,0.2)"
            strokeWidth={0.5}
          />
        </>
      )}
      {profile === "recessed-panel" && (
        <>
          <rect
            x={6}
            y={6}
            width={28}
            height={40}
            fill="rgba(148,163,184,0.04)"
            stroke="rgba(148,163,184,0.3)"
            strokeWidth={0.75}
          />
          <rect
            x={10}
            y={10}
            width={20}
            height={32}
            fill="none"
            stroke="rgba(148,163,184,0.15)"
            strokeWidth={0.5}
            strokeDasharray="2,2"
          />
        </>
      )}
      {profile === "beadboard" && (
        <>
          <rect
            x={6}
            y={6}
            width={28}
            height={40}
            fill="none"
            stroke="rgba(148,163,184,0.3)"
            strokeWidth={0.75}
          />
          {[12, 17, 22, 27].map((lx) => (
            <line
              key={lx}
              x1={lx}
              y1={8}
              x2={lx}
              y2={44}
              stroke="rgba(148,163,184,0.15)"
              strokeWidth={0.5}
            />
          ))}
        </>
      )}
      {profile === "arch" && (
        <>
          <path
            d="M6,46 L6,12 Q20,2 34,12 L34,46 Z"
            fill="none"
            stroke="rgba(148,163,184,0.3)"
            strokeWidth={0.75}
          />
          <path
            d="M10,44 L10,16 Q20,8 30,16 L30,44 Z"
            fill="rgba(148,163,184,0.06)"
            stroke="rgba(148,163,184,0.2)"
            strokeWidth={0.5}
          />
        </>
      )}
      {profile === "mission" && (
        <>
          <rect
            x={6}
            y={6}
            width={28}
            height={40}
            fill="none"
            stroke="rgba(148,163,184,0.3)"
            strokeWidth={0.75}
          />
          <line
            x1={6}
            y1={18}
            x2={34}
            y2={18}
            stroke="rgba(148,163,184,0.2)"
            strokeWidth={0.5}
          />
          <line
            x1={6}
            y1={34}
            x2={34}
            y2={34}
            stroke="rgba(148,163,184,0.2)"
            strokeWidth={0.5}
          />
        </>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

export function DoorStyleConfigurator({
  open,
  onOpenChange,
  onApply,
}: DoorStyleConfiguratorProps) {
  const [step, setStep] = useState(0);
  const [selectedDoorStyle, setSelectedDoorStyle] = useState<DoorStyle | null>(
    null
  );
  const [selectedOverlay, setSelectedOverlay] = useState<OverlayType | null>(
    null
  );
  const [selectedSpecies, setSelectedSpecies] = useState<WoodSpecies | null>(
    null
  );
  const [selectedFinish, setSelectedFinish] = useState<Finish | null>(null);
  const [selectedMods, setSelectedMods] = useState<Modification[]>([]);
  const [finishTab, setFinishTab] = useState<FinishCategory>("paint");

  // Filtered species based on selected door style
  const availableSpecies = useMemo(() => {
    if (!selectedDoorStyle) return woodSpecies;
    return woodSpecies.map((sp) => ({
      ...sp,
      isAvailable: sp.availability[selectedDoorStyle.id] ?? false,
    }));
  }, [selectedDoorStyle]);

  // Filtered finishes based on selected species
  const availableFinishes = useMemo(() => {
    return finishes.filter((f) => {
      if (f.category !== finishTab) return false;
      if (!selectedSpecies) return true;
      return f.species.includes(selectedSpecies.id);
    });
  }, [selectedSpecies, finishTab]);

  // Running total
  const runningTotal = useMemo(() => {
    let total = 0;
    if (selectedOverlay) total += selectedOverlay.priceAdder;
    total += selectedMods.reduce((s, m) => s + m.priceAdder, 0);
    return total;
  }, [selectedOverlay, selectedMods]);

  const canNext =
    (step === 0 && selectedDoorStyle !== null) ||
    (step === 1 && selectedOverlay !== null) ||
    (step === 2 && selectedSpecies !== null) ||
    (step === 3 && selectedFinish !== null) ||
    step === 4;

  function handleNext() {
    if (step < 4) setStep(step + 1);
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function handleApply(applyAll: boolean) {
    if (selectedDoorStyle && selectedOverlay && selectedSpecies && selectedFinish) {
      onApply({
        doorStyle: selectedDoorStyle,
        overlay: selectedOverlay,
        species: selectedSpecies,
        finish: selectedFinish,
        modifications: selectedMods,
      });
    }
  }

  function toggleMod(mod: Modification) {
    setSelectedMods((prev) =>
      prev.find((m) => m.id === mod.id)
        ? prev.filter((m) => m.id !== mod.id)
        : [...prev, mod]
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[480px] sm:max-w-[480px] flex flex-col p-0"
        showCloseButton={true}
      >
        <SheetHeader className="px-4 pt-4 pb-0">
          <SheetTitle className="text-sm">Door Style Configurator</SheetTitle>
          <SheetDescription className="text-xs">
            {STEPS[step]} — Step {step + 1} of 5
          </SheetDescription>
        </SheetHeader>

        <StepIndicator currentStep={step} onGoToStep={setStep} />

        <SummaryStrip
          doorStyle={selectedDoorStyle}
          overlay={selectedOverlay}
          species={selectedSpecies}
          finish={selectedFinish}
        />

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {/* Step 1: Door Style */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-3">
              {doorStyles.map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => setSelectedDoorStyle(ds)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    selectedDoorStyle?.id === ds.id
                      ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                      : "border-border hover:border-muted-foreground/30 bg-muted/10"
                  }`}
                >
                  <DoorProfileSVG profile={ds.profile} />
                  <p className="text-xs font-semibold text-foreground">
                    {ds.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        PG_COLORS[ds.priceGroup] ?? PG_COLORS[3]
                      }`}
                    >
                      PG{ds.priceGroup}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground leading-tight">
                    {ds.construction} / {ds.material}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Overlay Type */}
          {step === 1 && (
            <div className="space-y-3">
              {overlayTypes.map((ov) => (
                <button
                  key={ov.id}
                  onClick={() => setSelectedOverlay(ov)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedOverlay?.id === ov.id
                      ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                      : "border-border hover:border-muted-foreground/30 bg-muted/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">
                      {ov.name}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        ov.priceAdder > 0
                          ? "bg-amber-500/15 text-amber-400"
                          : ov.priceAdder < 0
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      {ov.priceAdder > 0
                        ? `+$${ov.priceAdder}/cabinet`
                        : ov.priceAdder < 0
                          ? `-$${Math.abs(ov.priceAdder)}/cabinet`
                          : "+$0"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ov.description}
                  </p>
                  {/* Visual gap indicator */}
                  <div className="mt-3 flex items-end gap-1 h-8">
                    <div className="flex-1 rounded-sm border border-muted-foreground/20 h-full bg-muted/20" />
                    <div
                      style={{
                        width:
                          ov.name === "Inset"
                            ? 0
                            : ov.name === "Full Overlay"
                              ? 2
                              : 6,
                      }}
                    />
                    <div className="flex-1 rounded-sm border border-muted-foreground/20 h-full bg-muted/20" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Species */}
          {step === 2 && (
            <div className="space-y-3">
              {availableSpecies.map((sp) => {
                const isAvailable =
                  "isAvailable" in sp ? (sp as { isAvailable: boolean }).isAvailable : true;
                return (
                  <button
                    key={sp.id}
                    onClick={() => {
                      if (isAvailable) setSelectedSpecies(sp);
                    }}
                    disabled={!isAvailable}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      !isAvailable
                        ? "opacity-40 cursor-not-allowed border-border bg-muted/5"
                        : selectedSpecies?.id === sp.id
                          ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                          : "border-border hover:border-muted-foreground/30 bg-muted/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {sp.name}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isAvailable
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-muted/30 text-muted-foreground/50"
                        }`}
                      >
                        {isAvailable ? "Available" : "Not Available"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {sp.grainPattern}
                      {sp.hardness > 0 && ` — Janka ${sp.hardness}`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 4: Finish */}
          {step === 3 && (
            <div className="space-y-3">
              {/* Category tabs */}
              <div className="flex items-center gap-1 rounded-lg bg-muted/20 p-1">
                {(["paint", "stain", "glaze"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFinishTab(cat)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      finishTab === cat
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}s
                  </button>
                ))}
              </div>

              {/* Finish swatches */}
              <div className="grid grid-cols-3 gap-2">
                {availableFinishes.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFinish(f)}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      selectedFinish?.id === f.id
                        ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                        : "border-border hover:border-muted-foreground/30 bg-muted/10"
                    }`}
                  >
                    <div
                      className="mx-auto mb-2 h-8 w-8 rounded-full border border-white/10"
                      style={{ backgroundColor: f.hex }}
                    />
                    <p className="text-[10px] font-medium text-foreground leading-tight">
                      {f.name}
                    </p>
                  </button>
                ))}
                {availableFinishes.length === 0 && (
                  <p className="col-span-3 text-center text-xs text-muted-foreground py-8">
                    No {finishTab}s available for the selected species. Try
                    another category.
                  </p>
                )}
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-muted-foreground/60 italic leading-relaxed border-t border-border pt-3">
                Color accuracy note: Screen colors approximate. Order samples
                for final approval.
              </p>
            </div>
          )}

          {/* Step 5: Modifications */}
          {step === 4 && (
            <div className="space-y-3">
              {modifications.map((mod) => {
                const isActive = selectedMods.some((m) => m.id === mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => toggleMod(mod)}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      isActive
                        ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                        : "border-border hover:border-muted-foreground/30 bg-muted/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded-sm border flex items-center justify-center ${
                            isActive
                              ? "border-indigo-500 bg-indigo-600"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {isActive && (
                            <Check className="size-3 text-white" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-foreground">
                          {mod.name}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                        +${mod.priceAdder}/{mod.unit}
                      </span>
                    </div>
                    <p className="mt-1 ml-6 text-[10px] text-muted-foreground leading-relaxed">
                      {mod.description}
                    </p>
                  </button>
                );
              })}

              {/* Running total */}
              <div className="rounded-lg bg-muted/20 border border-border p-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Price adjustments
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      runningTotal >= 0
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {runningTotal >= 0 ? "+" : "-"}$
                    {Math.abs(runningTotal)}/cabinet
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="border-t border-border p-4 space-y-2">
          {step === 4 ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => handleApply(false)}
                disabled={
                  !selectedDoorStyle ||
                  !selectedOverlay ||
                  !selectedSpecies ||
                  !selectedFinish
                }
              >
                Apply to Selected
              </Button>
              <Button
                className="flex-1 text-xs"
                onClick={() => handleApply(true)}
                disabled={
                  !selectedDoorStyle ||
                  !selectedOverlay ||
                  !selectedSpecies ||
                  !selectedFinish
                }
              >
                Apply to All
              </Button>
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-1 text-xs"
              onClick={handleBack}
              disabled={step === 0}
            >
              <ChevronLeft className="size-3.5" />
              Back
            </Button>
            {step < 4 && (
              <Button
                className="flex-1 gap-1 text-xs"
                onClick={handleNext}
                disabled={!canNext}
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
