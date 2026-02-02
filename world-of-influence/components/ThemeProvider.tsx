"use client";

import { useEffect } from "react";

import { getStoredThemeId, themeById, useThemeStore } from "@/lib/theme";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const currentThemeId = useThemeStore((state) => state.currentThemeId);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    const stored = getStoredThemeId();
    setTheme(stored);
    // Run once on mount to hydrate from localStorage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const theme = themeById[currentThemeId];
    const root = document.documentElement;

    Object.entries(theme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.setAttribute("data-theme", theme.id);
  }, [currentThemeId]);

  return <>{children}</>;
}
