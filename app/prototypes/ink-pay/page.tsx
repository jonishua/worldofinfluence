'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Share2, Activity, Users, Globe } from 'lucide-react';

/**
 * PROTOTYPE: INK PAY - LIVING DATA
 * 
 * 5 CONCEPTS (See README.md for full specs):
 * 1. The "Neural Treasury" (Force-Directed Graph)
 * 2. The "Orbital Ledger" (Radial Solar System)
 * 3. The "Sentinel Grid" (Isometric City/Chipset)
 * 4. The "Liquidity Stream" (Fluid/Sankey Simulation)
 * 5. The "Constellation Vault" (Star Map)
 * 
 * CURRENT SELECTION: [Awaiting User Choice]
 * Implementing: Base "Bank Vault" Shell for the prototype.
 */

export default function InkPayPrototype() {
  const [activeTab, setActiveTab] = useState<'network' | 'earnings'>('network');
  const [simulatedBalance, setSimulatedBalance] = useState(12450.50);

  // Simulated "Living" Pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedBalance(prev => prev + (Math.random() * 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden relative">
      {/* BACKGROUND: Subtle Grid (Bank Vault Aesthetic) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 200, 5, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 200, 5, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* HEADER: Glassmorphism */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,200,5,0.3)]">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">INK<span className="text-emerald-400">PAY</span></h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">Living Data Prototype</p>
          </div>
        </div>

        {/* BALANCE ODOMETER (Simulated) */}
        <div className="text-right">
          <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">Total Royalty Yield</div>
          <div className="text-3xl font-mono font-bold text-emerald-400 tabular-nums drop-shadow-[0_0_8px_rgba(0,200,5,0.5)]">
            ${simulatedBalance.toFixed(2)}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-0 w-full h-[calc(100vh-100px)] flex">
        
        {/* LEFT PANEL: Controls / Legend */}
        <aside className="w-80 h-full border-r border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 flex flex-col gap-8">
          
          {/* Concept Selector Placeholder */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Visual Mode</h3>
            <div className="flex flex-col gap-2">
              {['Neural', 'Orbital', 'Grid', 'Fluid', 'Constellation'].map((mode) => (
                <button 
                  key={mode}
                  className="px-4 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-left text-sm transition-all hover:border-emerald-500/50 hover:shadow-[0_0_10px_rgba(0,200,5,0.1)]"
                >
                  {mode} View
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
             <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Network Stats</h3>
             <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-xl bg-slate-800 border border-white/5">
                  <div className="text-xs text-slate-400 mb-1">Direct</div>
                  <div className="text-xl font-mono text-white">142</div>
               </div>
               <div className="p-4 rounded-xl bg-slate-800 border border-white/5">
                  <div className="text-xs text-slate-400 mb-1">Viral</div>
                  <div className="text-xl font-mono text-emerald-400">8,491</div>
               </div>
             </div>
          </div>

        </aside>

        {/* CENTER: The Visualization Canvas */}
        <div className="flex-1 relative flex items-center justify-center bg-slate-950 overflow-hidden group cursor-move">
          
          {/* Placeholder for the Graph */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50 pointer-events-none">
            <div className="w-[500px] h-[500px] rounded-full border border-emerald-500/20 animate-pulse flex items-center justify-center">
               <div className="w-[300px] h-[300px] rounded-full border border-emerald-500/30 animate-[spin_10s_linear_infinite]" />
            </div>
            <p className="mt-8 text-slate-500 font-mono text-sm">[ Visualization Canvas ]</p>
          </div>

          {/* Floating UI Overlay Example */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-12 right-12 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Globe size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Live Transaction</h4>
                <p className="text-xs text-slate-400 mt-1">User <span className="text-emerald-400 font-mono">@CryptoKing</span> (Viral L2) purchased a <span className="text-white">Land Deed</span>.</p>
                <div className="mt-2 flex items-center gap-2">
                   <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">+$4.20</span>
                   <span className="text-[10px] text-slate-500">Just now</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
