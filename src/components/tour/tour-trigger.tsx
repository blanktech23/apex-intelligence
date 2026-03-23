"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { usePersona } from "@/lib/persona-context";
import { useTour } from "./use-tour";
import { useTourContext } from "./tour-provider";
import { getTourById } from "./tour-definitions";

interface TourTriggerProps {
  tourId: string;
  trigger: "first_login" | "first_visit";
  route?: string;
  /** Delay in ms before starting the tour (lets page render settle) */
  delay?: number;
}

export function TourTrigger({ tourId, trigger, route, delay = 800 }: TourTriggerProps) {
  const pathname = usePathname();
  const { persona } = usePersona();
  const { shouldShowTour } = useTour();
  const { startTour, isTourActive } = useTourContext();
  const hasTriggered = useRef(false);

  useEffect(() => {
    // Don't trigger if another tour is already active
    if (isTourActive) return;
    // Don't re-trigger in same mount cycle
    if (hasTriggered.current) return;

    const tourDef = getTourById(tourId, persona);
    if (!tourDef) return;

    // Route matching
    if (route && !pathname.startsWith(route)) return;
    if (tourDef.route && !pathname.startsWith(tourDef.route)) return;

    // Check fatigue prevention
    if (!shouldShowTour(tourId)) return;

    // For first_login, trigger on any authenticated route
    // For first_visit, trigger when the route matches
    if (trigger === "first_visit" && !route && !tourDef.route) return;

    hasTriggered.current = true;

    const timer = setTimeout(() => {
      // Re-check in case state changed during delay
      if (shouldShowTour(tourId)) {
        startTour(tourId);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [tourId, trigger, route, pathname, persona, shouldShowTour, startTour, isTourActive, delay]);

  // Reset trigger flag when route changes
  useEffect(() => {
    hasTriggered.current = false;
  }, [pathname]);

  return null;
}
