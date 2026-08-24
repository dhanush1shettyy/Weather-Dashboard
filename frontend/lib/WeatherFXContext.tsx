"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type WeatherMood = "clear" | "clouds" | "rain" | "storm" | "snow" | "mist";

type WeatherFXContextType = {
  mood: WeatherMood;
  setMoodFromCondition: (condition: string) => void;
};

const WeatherFXContext = createContext<WeatherFXContextType>({
  mood: "clear",
  setMoodFromCondition: () => {},
});

function moodFromCondition(condition: string): WeatherMood {
  const c = condition.toLowerCase();
  if (c.includes("thunder") || c.includes("storm")) return "storm";
  if (c.includes("snow")) return "snow";
  if (c.includes("rain") || c.includes("drizzle")) return "rain";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze") || c.includes("smoke")) return "mist";
  if (c.includes("cloud")) return "clouds";
  return "clear";
}

export function WeatherFXProvider({ children }: { children: ReactNode }) {
  const [mood, setMood] = useState<WeatherMood>("clear");

  function setMoodFromCondition(condition: string) {
    setMood(moodFromCondition(condition));
  }

  return (
    <WeatherFXContext.Provider value={{ mood, setMoodFromCondition }}>
      {children}
    </WeatherFXContext.Provider>
  );
}

export function useWeatherFX() {
  return useContext(WeatherFXContext);
}
