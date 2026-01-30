"use client";

import { themeList, useThemeStore } from "@/lib/theme";

type ThemeSwitcherProps = {
  variant?: "floating" | "inline";
};

export default function ThemeSwitcher({ variant = "floating" }: ThemeSwitcherProps) {
  const currentThemeId = useThemeStore((state) => state.currentThemeId);
  const setTheme = useThemeStore((state) => state.setTheme);
  const isFloating = variant === "floating";

  return (
    <div
      className={`${
        isFloating ? "fixed right-4 top-4 z-50 w-48" : "w-full"
      } rounded-[var(--radius)] border border-[var(--card-border)] bg-[var(--card-bg)]/90 p-3 shadow-[0_12px_26px_rgba(15,23,42,0.18)] backdrop-blur`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
        Theme Switcher
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {themeList.map((theme) => {
          const isActive = currentThemeId === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setTheme(theme.id)}
              className={`rounded-[calc(var(--radius)_-_2px)] px-3 py-2 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-[var(--accent-color)] text-white shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
                  : "text-[var(--text-primary)] hover:bg-black/5"
              }`}
            >
              {theme.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
