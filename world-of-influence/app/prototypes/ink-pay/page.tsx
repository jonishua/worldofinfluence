'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Share2, Activity, Users, Globe, Zap, ArrowUpRight } from 'lucide-react';

/**
 * PROTOTYPE: INK PAY - ORBITAL LEDGER
 * Concept: Solar System Metaphor.
 * - Center: You (Sun)
 * - Ring 1: Direct Connections (Planets)
 * - Ring 2: Viral Connections (Asteroid Belt / Moons)
 * - Flow: Comets (Cash) travel from Outer Ring -> Inner Ring -> Sun.
 */

// --- TYPES ---
type NodeType = 'user' | 'direct' | 'viral';

interface Node {
  id: string;
  type: NodeType;
  angle: number; // Position on the ring (0-360)
  radius: number; // Distance from center
  value: number; // Earnings magnitude
  parentId?: string; // For viral nodes
}

interface Transaction {
  id: string;
  fromNodeId: string;
  amount: number;
  timestamp: number;
  path: { x: number; y: number }[]; // Pre-calculated path
}

// --- CONFIG ---
const ORBIT_SPEED_MODIFIER = 0.05;
const DIRECT_RADIUS = 120;
const VIRAL_RADIUS = 220;
const CANVAS_SIZE = 800; // 800x800 coordinate system

export default function InkPayPrototype() {
  const [activeTab, setActiveTab] = useState<'network' | 'earnings'>('network');
  const [balance, setBalance] = useState(12450.50);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // --- MOCK DATA GENERATION ---
  const nodes = useMemo(() => {
    const generated: Node[] = [];
    
    // 1. Direct Nodes (Planets) - ~12 key players
    const directCount = 12;
    for (let i = 0; i < directCount; i++) {
      generated.push({
        id: `d-${i}`,
        type: 'direct',
        angle: (i / directCount) * (Math.PI * 2),
        radius: DIRECT_RADIUS,
        value: Math.random() * 1000,
      });
    }

    // 2. Viral Nodes (Asteroids) - ~800 visible ones (thousands implied)
    const viralCount = 800;
    for (let i = 0; i < viralCount; i++) {
      // Cluster them around directs slightly
      const parentIndex = Math.floor(Math.random() * directCount);
      const parentAngle = (parentIndex / directCount) * (Math.PI * 2);
      const offset = (Math.random() - 0.5) * 1.5; // Wider spread for more nodes
      
      generated.push({
        id: `v-${i}`,
        type: 'viral',
        angle: parentAngle + offset,
        radius: VIRAL_RADIUS + (Math.random() * 80 - 40), // Thicker band
        value: Math.random() * 100,
        parentId: `d-${parentIndex}`,
      });
    }
    return generated;
  }, []);

  // --- SIMULATION LOOP ---
  useEffect(() => {
    // Transaction Spawner
    const interval = setInterval(() => {
      const isViral = Math.random() > 0.3;
      const sourceNode = nodes[Math.floor(Math.random() * nodes.length)];
      
      if (!sourceNode) return;

      const amount = Math.random() * 15 + 5;
      
      // Calculate path: Source -> Parent (if viral) -> Center
      // For simplicity in this proto, we just do Source -> Center with a curve
      // Actually, let's do the "Orbit" path logic in the render loop for smoothness
      
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        fromNodeId: sourceNode.id,
        amount,
        timestamp: Date.now(),
        path: [] // Calculated in render
      };

      setTransactions(prev => [...prev, newTx]);
      setBalance(prev => prev + amount);

      // Cleanup old tx
      setTimeout(() => {
        setTransactions(prev => prev.filter(t => t.id !== newTx.id));
      }, 2000); // Animation duration

    }, 800); // New transaction every 800ms

    return () => clearInterval(interval);
  }, [nodes]);

  // --- CANVAS RENDERING (The "Living" System) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      const center = CANVAS_SIZE / 2;
      rotation += 0.002; // Slow orbit

      // 1. Draw Orbits (Subtle rings)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.arc(center, center, DIRECT_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 20; // Thick band
      ctx.arc(center, center, VIRAL_RADIUS, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Draw Nodes
      nodes.forEach(node => {
        const angle = node.angle + rotation * (node.type === 'viral' ? 0.5 : 1);
        const x = center + Math.cos(angle) * node.radius;
        const y = center + Math.sin(angle) * node.radius;

        // Draw Connection Line to Center (only for Directs)
        if (node.type === 'direct') {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 200, 5, ${0.1 + (node.value / 2000)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(center, center);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        // Draw Node Dot
        ctx.beginPath();
        if (node.type === 'direct') {
          ctx.fillStyle = '#00C805'; // Growth Green
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00C805';
        } else {
          ctx.fillStyle = 'rgba(200, 230, 255, 0.4)'; // Faint Blue/White
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      });

      // 3. Draw Active Transactions (Comets)
      const now = Date.now();
      transactions.forEach(tx => {
        const age = now - tx.timestamp;
        const duration = 1500; // ms
        const progress = Math.min(age / duration, 1);
        
        const node = nodes.find(n => n.id === tx.fromNodeId);
        if (!node) return;

        // Calculate current position based on progress
        // Start: Node Pos -> End: Center
        const angle = node.angle + rotation * (node.type === 'viral' ? 0.5 : 1);
        const startX = center + Math.cos(angle) * node.radius;
        const startY = center + Math.sin(angle) * node.radius;
        
        // Simple lerp for now (can add bezier later)
        const currX = startX + (center - startX) * progress;
        const currY = startY + (center - startY) * progress;

        // Comet Head
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(currX, currY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Comet Tail (Gradient)
        const tailLen = 20 * (1 - progress); // Shrink as it hits center
        const angleToCenter = Math.atan2(center - startY, center - startX);
        const tailX = currX - Math.cos(angleToCenter) * tailLen;
        const tailY = currY - Math.sin(angleToCenter) * tailLen;

        const grad = ctx.createLinearGradient(currX, currY, tailX, tailY);
        grad.addColorStop(0, 'rgba(0, 200, 5, 1)');
        grad.addColorStop(1, 'rgba(0, 200, 5, 0)');
        
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.moveTo(currX, currY);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Impact Effect (at center)
        if (progress > 0.95) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 200, 5, ${1 - (progress - 0.95) * 20})`;
          ctx.lineWidth = 2;
          ctx.arc(center, center, (progress - 0.95) * 100, 0, Math.PI * 2); // Expanding ring
          ctx.stroke();
        }
      });

      // 4. Draw Center (The User / Sun)
      ctx.beginPath();
      ctx.fillStyle = '#1F2937'; // Slate
      ctx.arc(center, center, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // Glow Ring
      ctx.beginPath();
      ctx.strokeStyle = '#00C805';
      ctx.lineWidth = 2;
      ctx.arc(center, center, 30, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner Icon (Drawn as text/emoji for simplicity in canvas)
      // Actually, we'll overlay a DOM element for the user avatar, so just leave a hole or fill
      
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [nodes, transactions]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden relative">
      {/* BACKGROUND: Subtle Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 200, 5, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 200, 5, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,200,5,0.3)]">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">INK<span className="text-emerald-400">PAY</span></h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">Orbital Ledger v0.1</p>
          </div>
        </div>

        {/* BALANCE ODOMETER */}
        <div className="text-right">
          <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">Total Royalty Yield</div>
          <div className="text-3xl font-mono font-bold text-emerald-400 tabular-nums drop-shadow-[0_0_8px_rgba(0,200,5,0.5)]">
            ${balance.toFixed(2)}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-0 w-full h-[calc(100vh-100px)] flex">
        
        {/* LEFT PANEL: Legend & Stats */}
        <aside className="w-80 h-full border-r border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 flex flex-col gap-8 z-10">
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Network Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 backdrop-blur-md">
                 <div className="text-xs text-slate-400 mb-1">Direct (Planets)</div>
                 <div className="text-xl font-mono text-emerald-400">12</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 backdrop-blur-md">
                 <div className="text-xs text-slate-400 mb-1">Viral (Moons)</div>
                 <div className="text-xl font-mono text-emerald-400/70">200+</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Live Feed</h3>
            <div className="space-y-2 h-[300px] overflow-hidden relative">
               <AnimatePresence>
                 {transactions.slice(-5).reverse().map((tx) => (
                   <motion.div 
                     key={tx.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0 }}
                     className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 text-sm"
                   >
                     <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                         <Zap size={12} />
                       </div>
                       <span className="text-slate-300 font-mono text-xs">Node {tx.fromNodeId}</span>
                     </div>
                     <span className="text-emerald-400 font-mono">+${tx.amount.toFixed(2)}</span>
                   </motion.div>
                 ))}
               </AnimatePresence>
               {/* Fade out bottom */}
               <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
            </div>
          </div>

        </aside>

        {/* CENTER: The Visualization Canvas */}
        <div className="flex-1 relative flex items-center justify-center bg-slate-950 overflow-hidden cursor-move">
          
          {/* Canvas Layer */}
          <canvas 
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="w-[800px] h-[800px] max-w-full max-h-full"
          />

          {/* User Avatar Overlay (Center) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(0,200,5,0.4)] z-20">
             <Users className="text-white w-8 h-8" />
          </div>

          {/* Floating Label Example */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute top-[20%] left-[60%] bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full border border-emerald-500/30 text-xs text-emerald-400 font-mono pointer-events-none"
          >
            Direct: @ElonMusk
          </motion.div>

        </div>
      </main>
    </div>
  );
}
