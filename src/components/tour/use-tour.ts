"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { usePersona, type Persona } from "@/lib/persona-context";

// ---------------------------------------------------------------------------
// Tour state types
// ---------------------------------------------------------------------------

export interface TourState {
  completedTours: string[];
  dismissedTours: Record<string, string>; // { tourId: ISO timestamp }
  lastTourShownAt: string | null;
  tourVersion: number;
}

const STORAGE_KEY_PREFIX = "tourState_";
const TOUR_VERSION = 1;
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

function storageKey(persona: Persona): string {
  return `${STORAGE_KEY_PREFIX}${persona}`;
}

// ---------------------------------------------------------------------------
// External store for cross-component reactivity
// ---------------------------------------------------------------------------

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

const DEFAULT_STATE: TourState = { completedTours: [], dismissedTours: {}, lastTourShownAt: null, tourVersion: TOUR_VERSION };

// Cache per persona to avoid redundant JSON.parse
const cachedSnapshots: Record<string, { raw: string | null; state: TourState }> = {};

function readState(persona: Persona): TourState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  const key = storageKey(persona);
  try {
    const raw = localStorage.getItem(key);
    const cached = cachedSnapshots[key];
    if (cached && cached.raw === raw) return cached.state;
    if (!raw) {
      cachedSnapshots[key] = { raw: null, state: DEFAULT_STATE };
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(raw) as TourState;
    if (parsed.tourVersion !== TOUR_VERSION) {
      cachedSnapshots[key] = { raw, state: DEFAULT_STATE };
      return DEFAULT_STATE;
    }
    cachedSnapshots[key] = { raw, state: parsed };
    return parsed;
  } catch {
    cachedSnapshots[key] = { raw: null, state: DEFAULT_STATE };
    return DEFAULT_STATE;
  }
}

function writeState(persona: Persona, updater: (prev: TourState) => TourState) {
  const key = storageKey(persona);
  const next = updater(readState(persona));
  const raw = JSON.stringify(next);
  localStorage.setItem(key, raw);
  cachedSnapshots[key] = { raw, state: next };
  emitChange();
}

// ---------------------------------------------------------------------------
// Session tracking (in-memory, resets on page reload)
// ---------------------------------------------------------------------------

let tourShownThisSession = false;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTour() {
  const { persona } = usePersona();

  const getSnapshot = useCallback(() => readState(persona), [persona]);
  const getServerSnapshot = useCallback(() => DEFAULT_STATE, []);

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isTourCompleted = useCallback(
    (tourId: string) => state.completedTours.includes(tourId),
    [state.completedTours]
  );

  const isTourDismissed = useCallback(
    (tourId: string) => {
      const dismissedAt = state.dismissedTours[tourId];
      if (!dismissedAt) return false;
      // Dismissed tours stay dismissed for 7 days
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      return Date.now() - new Date(dismissedAt).getTime() < sevenDays;
    },
    [state.dismissedTours]
  );

  const isInCooldown = useCallback(() => {
    if (!state.lastTourShownAt) return false;
    return Date.now() - new Date(state.lastTourShownAt).getTime() < COOLDOWN_MS;
  }, [state.lastTourShownAt]);

  const shouldShowTour = useCallback(
    (tourId: string) => {
      if (isTourCompleted(tourId)) return false;
      if (isTourDismissed(tourId)) return false;
      if (tourShownThisSession) return false;
      if (isInCooldown()) return false;
      return true;
    },
    [isTourCompleted, isTourDismissed, isInCooldown]
  );

  const markCompleted = useCallback((tourId: string) => {
    tourShownThisSession = true;
    writeState(persona, (prev) => ({
      ...prev,
      completedTours: prev.completedTours.includes(tourId)
        ? prev.completedTours
        : [...prev.completedTours, tourId],
      lastTourShownAt: new Date().toISOString(),
    }));
  }, [persona]);

  const markDismissed = useCallback((tourId: string) => {
    tourShownThisSession = true;
    writeState(persona, (prev) => ({
      ...prev,
      dismissedTours: { ...prev.dismissedTours, [tourId]: new Date().toISOString() },
      lastTourShownAt: new Date().toISOString(),
    }));
  }, [persona]);

  const markStarted = useCallback(() => {
    tourShownThisSession = true;
    writeState(persona, (prev) => ({
      ...prev,
      lastTourShownAt: new Date().toISOString(),
    }));
  }, [persona]);

  const resetTour = useCallback((tourId: string) => {
    tourShownThisSession = false;
    writeState(persona, (prev) => ({
      ...prev,
      completedTours: prev.completedTours.filter((id) => id !== tourId),
      dismissedTours: Object.fromEntries(
        Object.entries(prev.dismissedTours).filter(([key]) => key !== tourId)
      ),
      lastTourShownAt: null,
    }));
  }, [persona]);

  const resetAllTours = useCallback(() => {
    tourShownThisSession = false;
    // Clear all persona-scoped tour keys
    const allPersonas: Persona[] = ["contractor", "dealer", "rep", "manufacturer"];
    for (const p of allPersonas) {
      const key = storageKey(p);
      try {
        localStorage.removeItem(key);
        delete cachedSnapshots[key];
      } catch {
        // ignore
      }
    }
    emitChange();
  }, []);

  return useMemo(
    () => ({
      state,
      isTourCompleted,
      isTourDismissed,
      shouldShowTour,
      markCompleted,
      markDismissed,
      markStarted,
      resetTour,
      resetAllTours,
    }),
    [state, isTourCompleted, isTourDismissed, shouldShowTour, markCompleted, markDismissed, markStarted, resetTour, resetAllTours]
  );
}
