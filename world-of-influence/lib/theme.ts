import { create } from "zustand";

export type ThemeId = "bank-vault" | "dark-pool" | "paper-map" | "black-card" | "gamer";

export type ThemeConfig = {
  id: ThemeId;
  label: string;
  accentColor: string;
  cssVars: Record<string, string>;
};

export const themeById: Record<ThemeId, ThemeConfig> = {
  "bank-vault": {
    id: "bank-vault",
    label: "Bank Vault",
    accentColor: "#00C805",
    cssVars: {
      "--map-filter": "grayscale(100%) contrast(1.2)",
      "--bg-color": "#F3F4F6",
      "--card-bg": "#FFFFFF",
      "--text-primary": "#1F2937",
      "--text-muted": "#6B7280",
      "--accent-color": "#00C805",
      "--radius": "8px",
      "--card-border": "rgba(15, 23, 42, 0.12)",
    },
  },
  "dark-pool": {
    id: "dark-pool",
    label: "Dark Pool",
    accentColor: "#39FF14",
    cssVars: {
      "--map-filter": "invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)",
      "--bg-color": "#111827",
      "--card-bg": "#1F2937",
      "--text-primary": "#F9FAFB",
      "--text-muted": "#9CA3AF",
      "--accent-color": "#39FF14",
      "--radius": "4px",
      "--card-border": "rgba(255, 255, 255, 0.12)",
    },
  },
  "paper-map": {
    id: "paper-map",
    label: "Paper Map",
    accentColor: "#3B82F6",
    cssVars: {
      "--map-filter": "sepia(20%) brightness(105%)",
      "--bg-color": "#FAF9F6",
      "--card-bg": "rgba(255, 255, 255, 0.8)",
      "--text-primary": "#4B5563",
      "--text-muted": "#6B7280",
      "--accent-color": "#3B82F6",
      "--radius": "16px",
      "--card-border": "rgba(148, 163, 184, 0.35)",
    },
  },
  "black-card": {
    id: "black-card",
    label: "Black Card",
    accentColor: "#D4AF37",
    cssVars: {
      "--map-filter": "grayscale(100%) brightness(50%)",
      "--bg-color": "#000000",
      "--card-bg": "#1A1A1A",
      "--text-primary": "#FFFFFF",
      "--text-muted": "#A1A1AA",
      "--accent-color": "#D4AF37",
      "--radius": "8px",
      "--card-border": "#D4AF37",
    },
  },
  gamer: {
    id: "gamer",
    label: "Gamer",
    accentColor: "#F59E0B",
    cssVars: {
      "--map-filter": "none",
      "--bg-color": "#FFFFFF",
      "--card-bg": "#FFFBEB",
      "--text-primary": "#000000",
      "--text-muted": "#6B7280",
      "--accent-color": "#F59E0B",
      "--radius": "8px",
      "--card-border": "rgba(180, 83, 9, 0.35)",
    },
  },
};

export const themeList = Object.values(themeById);

type ThemeState = {
  currentThemeId: ThemeId;
  setTheme: (id: ThemeId) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  currentThemeId: "bank-vault",
  setTheme: (id) => set({ currentThemeId: id }),
}));
