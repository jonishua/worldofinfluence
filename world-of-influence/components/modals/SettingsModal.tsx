"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { themeList, useThemeStore } from "@/lib/theme";
import type { ThemeId } from "@/lib/theme";

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const currentThemeId = useThemeStore((state) => state.currentThemeId);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[750] flex items-end justify-center bg-black/40 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Settings"
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-[520px] rounded-t-[24px] border-t border-x border-[var(--card-border)] bg-[var(--card-bg)] px-6 py-7 text-left shadow-[0_-10px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Preferences
                </p>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Settings
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-[10px] text-[var(--text-muted)] hover:bg-[var(--gray-surface)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Appearance */}
            <section className="mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
                Appearance
              </h3>
              <div className="flex gap-1 p-1 rounded-[14px] bg-[var(--gray-surface)]/30 border border-[var(--card-border)]">
                {themeList.map((theme) => {
                  const isActive = currentThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setTheme(theme.id as ThemeId)}
                      className={`flex-1 py-2.5 rounded-[10px] text-xs font-bold uppercase tracking-widest transition-all ${
                        isActive
                          ? "bg-[var(--accent-color)] text-white shadow-md"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--gray-surface)]/50"
                      }`}
                    >
                      {theme.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Sound (stub) */}
            <section className="mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
                Sound
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Coming soon.
              </p>
            </section>

            {/* Notifications (stub) */}
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
                Notifications
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Coming soon.
              </p>
            </section>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
