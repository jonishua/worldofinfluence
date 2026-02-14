"use client";

import { AnimatePresence, motion } from "framer-motion";
import { 
  X, 
  Gamepad2, 
  Target, 
  Lock, 
  Briefcase, 
  Brain,
  ChevronRight
} from "lucide-react";
import { useEffect, useRef } from "react";

interface ArcadeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (gameId: string) => void;
}

const ARCADE_GAMES = [
  { 
    id: "terminal", 
    name: "The Terminal", 
    label: "Neon Slots", 
    icon: Gamepad2, 
    isAvailable: true,
    description: "Launder Credits into Bucks & Permits"
  },
  { 
    id: "market-sniper", 
    name: "Market Sniper", 
    label: "Reaction/Timing", 
    icon: Target, 
    isAvailable: true,
    description: "Sell at the peak of volatility"
  },
  { 
    id: "vault-cracker", 
    name: "Vault Cracker", 
    label: "Precision", 
    icon: Lock, 
    isAvailable: true,
    description: "Crack the safe for high rewards"
  },
  { 
    id: "asset-audit", 
    name: "Asset Audit", 
    label: "Speed/Sorting", 
    icon: Briefcase, 
    isAvailable: false,
    description: "Sort Assets from Liabilities fast"
  },
  { 
    id: "insider-trading", 
    name: "Insider Trading", 
    label: "Memory Match", 
    icon: Brain, 
    isAvailable: false,
    description: "Match patterns for market edge"
  },
];

export default function ArcadeDrawer({ isOpen, onClose, onSelectGame }: ArcadeDrawerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Enable drag-to-scroll for desktop (matching ShopModal UX)
  const isDownRef = useRef(false);
  const startYRef = useRef(0);
  const scrollTopRef = useRef(0);

  useEffect(() => {
    const slider = scrollContainerRef.current;
    if (!slider || !isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, a, input, [role="button"]')) return;
      isDownRef.current = true;
      slider.style.cursor = 'grabbing';
      slider.style.userSelect = 'none';
      startYRef.current = e.pageY - slider.offsetTop;
      scrollTopRef.current = slider.scrollTop;
    };

    const handleMouseLeave = () => {
      isDownRef.current = false;
      slider.style.cursor = 'grab';
      slider.style.removeProperty('user-select');
    };

    const handleMouseUp = () => {
      isDownRef.current = false;
      if (slider) {
        slider.style.cursor = 'grab';
        slider.style.removeProperty('user-select');
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDownRef.current) return;
      const y = e.pageY - slider.offsetTop;
      const walk = (y - startYRef.current) * 1.5;
      slider.scrollTop = scrollTopRef.current - walk;
    };

    slider.addEventListener('mousedown', handleMouseDown, { passive: true });
    slider.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    slider.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    
    slider.style.cursor = 'grab';

    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[700] pointer-events-none flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[500px] bg-[var(--card-bg)] rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t border-[var(--card-border)] overflow-hidden pointer-events-auto flex flex-col max-h-[70vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--card-border)] bg-[var(--card-bg)]/80 backdrop-blur-xl z-10">
              <div>
                <h2 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Arcade Hub
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gray-bg)] shadow-sm">
                    <Gamepad2 className="h-5 w-5 text-[#00C805]" />
                  </div>
                  <span className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-tight">Available Games</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gray-surface)] transition-colors hover:bg-[var(--gray-bg)]"
              >
                <X className="h-5 w-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Games List */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-3"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {ARCADE_GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => game.isAvailable && onSelectGame(game.id)}
                  disabled={!game.isAvailable}
                  className={`group relative w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    game.isAvailable 
                      ? 'bg-[var(--gray-surface)] border-[var(--card-border)] hover:border-[#00C805]/30 hover:bg-[var(--card-bg)] active:scale-[0.98]' 
                      : 'bg-slate-900/50 border-slate-800/50 opacity-60 grayscale cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform ${
                      game.isAvailable ? 'bg-white group-hover:scale-110' : 'bg-slate-800'
                    }`}>
                      <game.icon className={`h-6 w-6 ${game.isAvailable ? 'text-[var(--text-primary)]' : 'text-slate-500'}`} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)] uppercase tracking-tight">
                          {game.name}
                        </span>
                        {!game.isAvailable && (
                          <div className="flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5">
                            <Lock className="h-2 w-2 text-slate-400" />
                            <span className="text-[8px] font-bold uppercase text-slate-400">Locked</span>
                          </div>
                        )}
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${
                        game.isAvailable ? 'text-[var(--text-muted)]' : 'text-slate-600'
                      }`}>
                        {game.label} • {game.description}
                      </p>
                    </div>
                  </div>
                  
                  {game.isAvailable && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00C805]/10 text-[#00C805] group-hover:bg-[#00C805] group-hover:text-white transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </button>
              ))}
              
              <div className="pt-4 pb-8">
                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] text-center">
                  More assets being indexed for regional arcade deployment
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
