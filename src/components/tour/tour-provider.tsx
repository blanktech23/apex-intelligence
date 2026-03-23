"use client";

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { DriveStep, Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useRole, type Role } from "@/lib/role-context";
import { usePersona } from "@/lib/persona-context";
import { useTour } from "./use-tour";
import { getTourById, getFilteredSteps, type TourStep } from "./tour-definitions";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface TourContextType {
  startTour: (tourId: string) => void;
  isTourActive: boolean;
  activeTourId: string | null;
}

const TourContext = createContext<TourContextType>({
  startTour: () => {},
  isTourActive: false,
  activeTourId: null,
});

export function useTourContext() {
  return useContext(TourContext);
}

// ---------------------------------------------------------------------------
// Convert our steps to Driver.js format
// ---------------------------------------------------------------------------

function toDriverSteps(steps: TourStep[]): DriveStep[] {
  return steps
    .filter((step) => {
      // Only include steps whose target element exists in DOM
      return typeof document !== "undefined" && document.querySelector(step.element);
    })
    .map((step) => ({
      element: step.element,
      popover: {
        title: step.popover.title,
        description: step.popover.description,
        side: step.popover.side,
        align: step.popover.align ?? "center",
      },
    }));
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function TourProvider({ children }: { children: ReactNode }) {
  const { role } = useRole();
  const { persona } = usePersona();
  const { markCompleted, markDismissed, markStarted } = useTour();
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [driverInstance, setDriverInstance] = useState<Driver | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clean up driver on unmount
  useEffect(() => {
    return () => {
      driverInstance?.destroy();
    };
  }, [driverInstance]);

  const startTour = useCallback(
    async (tourId: string) => {
      if (!mounted) return;

      // Use persona-aware tour lookup
      const tourDef = getTourById(tourId, persona);
      if (!tourDef) return;

      const filteredSteps = getFilteredSteps(tourDef, role);
      const driverSteps = toDriverSteps(filteredSteps);

      if (driverSteps.length === 0) return;

      // Destroy previous instance if any
      driverInstance?.destroy();

      // Dynamic import — Driver.js accesses `document` at import time
      const { driver } = await import("driver.js");

      const d = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayOpacity: 0.25,
        stagePadding: 16,
        stageRadius: 12,
        popoverOffset: 16,
        nextBtnText: "Next",
        prevBtnText: "Back",
        doneBtnText: "Got it",
        progressText: "{{current}} / {{total}}",
        steps: driverSteps,
        onDestroyStarted: () => {
          // User clicked X or overlay — treat as dismiss
          if (!d.hasNextStep() || d.isLastStep()) {
            markCompleted(tourId);
          } else {
            markDismissed(tourId);
          }
          d.destroy();
          setActiveTourId(null);
        },
        onDestroyed: () => {
          setActiveTourId(null);
        },
      });

      markStarted();
      setActiveTourId(tourId);
      setDriverInstance(d);
      d.drive();
    },
    [role, persona, driverInstance, markCompleted, markDismissed, markStarted, mounted]
  );

  return (
    <TourContext.Provider
      value={{
        startTour,
        isTourActive: activeTourId !== null,
        activeTourId,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}
