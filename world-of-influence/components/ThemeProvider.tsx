"use client";

import { useEffect } from "react";

import { themeById, useThemeStore } from "@/lib/theme";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const currentThemeId = useThemeStore((state) => state.currentThemeId);

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
