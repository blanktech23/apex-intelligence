"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { PERSONA_TEMPLATES, type PersonaTemplate } from "./persona-templates";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Persona = "contractor" | "dealer" | "rep" | "manufacturer";
export type IndustryVertical =
  | "kitchen_bath"
  | "hvac"
  | "general_construction"
  | "landscaping";

export type { PersonaTemplate };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "selectedPersona";
const DEFAULT_PERSONA: Persona = "contractor";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidPersona(value: unknown): value is Persona {
  return (
    typeof value === "string" &&
    ["contractor", "dealer", "rep", "manufacturer"].includes(value)
  );
}

function readStoredPersona(): Persona {
  if (typeof window === "undefined") return DEFAULT_PERSONA;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isValidPersona(stored) ? stored : DEFAULT_PERSONA;
  } catch {
    return DEFAULT_PERSONA;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface PersonaContextType {
  persona: Persona;
  template: PersonaTemplate;
  setPersona: (p: Persona) => void;
  resetPersona: () => void;
}

const PersonaContext = createContext<PersonaContextType>({
  persona: DEFAULT_PERSONA,
  template: PERSONA_TEMPLATES[DEFAULT_PERSONA],
  setPersona: () => {},
  resetPersona: () => {},
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(DEFAULT_PERSONA);

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    setPersonaState(readStoredPersona());
  }, []);

  const setPersona = useCallback((p: Persona) => {
    if (!isValidPersona(p)) return;
    setPersonaState(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, []);

  const resetPersona = useCallback(() => {
    setPersonaState(DEFAULT_PERSONA);
    try {
      localStorage.setItem(STORAGE_KEY, DEFAULT_PERSONA);
    } catch {
      // noop
    }
  }, []);

  const template = PERSONA_TEMPLATES[persona];

  return (
    <PersonaContext.Provider
      value={{ persona, template, setPersona, resetPersona }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePersona() {
  return useContext(PersonaContext);
}

// ---------------------------------------------------------------------------
// Utility — imperative reset (e.g. demo reset button outside React tree)
// ---------------------------------------------------------------------------

export function resetPersonaState() {
  try {
    localStorage.setItem(STORAGE_KEY, DEFAULT_PERSONA);
  } catch {
    // noop
  }
}
