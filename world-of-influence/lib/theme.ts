import { create } from "zustand";

const STORAGE_KEY = "woi-theme";

export type ThemeId = "day" | "dusk" | "night";

const THEME_IDS: ThemeId[] = ["day", "dusk", "night"];

function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "day";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && THEME_IDS.includes(stored as ThemeId)) return stored as ThemeId;
  return "day";
}

/** Grid overlay colors per theme — tuned so the grid doesn’t dominate the map */
export type GridColors = {
  strokeUnowned: string;
  fillUnowned: string;
  fillUnownedOpacity: number;
  strokeOwned: string;
  fillOwned: string;
  fillOwnedOpacity: number;
  selectionStroke: string;
};

export type ThemeConfig = {
  id: ThemeId;
  label: string;
  accentColor: string;
  cssVars: Record<string, string>;
  grid: GridColors;
};

export const themeById: Record<ThemeId, ThemeConfig> = {
  day: {
    id: "day",
    label: "Day",
    accentColor: "#00C805",
    cssVars: {
      /* Waze-style: desaturated base map */
      "--map-filter": "grayscale(100%) contrast(1.2)",
      "--bg-color": "#F3F4F6",
      "--card-bg": "#FFFFFF",
      "--text-primary": "#1F2937",
      "--text-muted": "#6B7280",
      "--accent-color": "#00C805",
      "--radius": "8px",
      "--card-border": "rgba(15, 23, 42, 0.12)",
      "--gray-bg": "#E2E8F0",
      "--gray-surface": "#F1F5F9",
      "--gray-border": "rgba(15, 23, 42, 0.15)",
      "--gray-text": "#1E293B",
      "--gray-text-muted": "#64748B",
    },
    grid: {
      /* Original cbd5e1/94a3b8/white, toned down: softer stroke and fill opacity */
      strokeUnowned: "#cbd5e1",
      fillUnowned: "#94a3b8",
      fillUnownedOpacity: 0.1,
      strokeOwned: "#f1f5f9",
      fillOwned: "#00C805",
      fillOwnedOpacity: 0.5,
      selectionStroke: "#cbd5e1",
    },
  },
  dusk: {
    id: "dusk",
    label: "Dusk",
    accentColor: "#00C805",
    cssVars: {
      /* Waze-style: desaturated, slightly dimmed */
      "--map-filter": "grayscale(100%) contrast(1.1) brightness(0.92)",
      "--bg-color": "#475569",
      "--card-bg": "#64748B",
      "--text-primary": "#F8FAFC",
      "--text-muted": "#CBD5E1",
      "--accent-color": "#00C805",
      "--radius": "8px",
      "--card-border": "rgba(255, 255, 255, 0.15)",
      "--gray-bg": "#475569",
      "--gray-surface": "#64748B",
      "--gray-border": "rgba(255, 255, 255, 0.15)",
      "--gray-text": "#F8FAFC",
      "--gray-text-muted": "#CBD5E1",
    },
    grid: {
      strokeUnowned: "rgba(255, 255, 255, 0.28)",
      fillUnowned: "#64748b",
      fillUnownedOpacity: 0.1,
      strokeOwned: "rgba(255, 255, 255, 0.45)",
      fillOwned: "#00C805",
      fillOwnedOpacity: 0.4,
      selectionStroke: "rgba(255, 255, 255, 0.5)",
    },
  },
  night: {
    id: "night",
    label: "Night",
    accentColor: "#39FF14",
    cssVars: {
      /* Waze-style: desaturated, dark gray only — no invert/hue (avoids colored map) */
      "--map-filter": "grayscale(100%) brightness(0.5) contrast(1.2)",
      "--bg-color": "#111827",
      "--card-bg": "#1F2937",
      "--text-primary": "#F9FAFB",
      "--text-muted": "#9CA3AF",
      "--accent-color": "#39FF14",
      "--radius": "8px",
      "--card-border": "rgba(255, 255, 255, 0.12)",
      "--gray-bg": "#1F2937",
      "--gray-surface": "#374151",
      "--gray-border": "rgba(255, 255, 255, 0.12)",
      "--gray-text": "#F9FAFB",
      "--gray-text-muted": "#9CA3AF",
    },
    grid: {
      /* Lighter so grid doesn’t blend into dark map */
      strokeUnowned: "#9ca3af",
      fillUnowned: "#4b5563",
      fillUnownedOpacity: 0.16,
      strokeOwned: "#d1d5db",
      fillOwned: "#39FF14",
      fillOwnedOpacity: 0.35,
      selectionStroke: "#9ca3af",
    },
  },
};

export const themeList = Object.values(themeById);

export function getStoredThemeId(): ThemeId {
  return getStoredTheme();
}

type ThemeState = {
  currentThemeId: ThemeId;
  setTheme: (id: ThemeId) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  currentThemeId: "day",
  setTheme: (id) => {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
    set({ currentThemeId: id });
  },
}));
