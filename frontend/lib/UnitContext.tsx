"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type TempUnit = "C" | "F";

type UnitContextType = {
  unit: TempUnit;
  toggleUnit: () => void;
};

const UnitContext = createContext<UnitContextType>({
  unit: "C",
  toggleUnit: () => {},
});

const STORAGE_KEY = "station-temp-unit";

export function UnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<TempUnit>("C");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "F" || stored === "C") setUnit(stored);
  }, []);

  function toggleUnit() {
    setUnit((prev) => {
      const next: TempUnit = prev === "C" ? "F" : "C";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  return <UnitContext.Provider value={{ unit, toggleUnit }}>{children}</UnitContext.Provider>;
}

export function useUnit() {
  return useContext(UnitContext);
}

/** Convert a Celsius value to the currently selected display unit, rounded. */
export function celsiusToDisplay(c: number, unit: TempUnit): number {
  return unit === "F" ? Math.round((c * 9) / 5 + 32) : Math.round(c);
}
