'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Users, Zap, Search, Plus, Minus } from 'lucide-react';

/**
 * PROTOTYPE: INK PAY - ORBITAL LEDGER (v2)
 * Features:
 * - Zoom/Pan (Infinite Canvas feel)
 * - Connected Lineages (Viral -> Direct Lines)
 * - Active Pulse (Green flash on transaction)
 * - Level of Detail (Show names on zoom)
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
  label: string; // Display name
  lastActive: number; // Timestamp of last transaction
}

interface Transaction {
  id: string;
  fromNodeId: string;
  amount: number;
  timestamp: number;
  // We'll calculate path dynamically to follow the nodes
}

// --- CONFIG ---
const DIRECT_RADIUS = 300;
const VIRAL_RADIUS = 600;
const CANVAS_SIZE = 2000; // Large internal canvas for sharpness
const ZOOM_SENSITIVITY = 0.001;
const PAN_SENSITIVITY = 1;

export default function InkPayPrototype() {
  const [balance, setBalance] = useState(12450.50);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Viewport State
  const [transform, setTransform] = useState({ k: 0.6, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use a ref for nodes so the animation loop can access the latest state without dependencies
  // (We need mutable state for lastActive updates to be performant)
  const nodesRef = useRef<Node[]>([]);

  // --- DATA GENERATION ---
  useEffect(() => {
    const generated: Node[] = [];
    const names = ["Cloud", "Elon", "Satoshi", "Vibes", "Neo", "Trinity", "Morpheus", "Cipher", "Tank", "Dozer", "Switch", "Apoc"];
    
    // 1. Direct Nodes (Planets)
    const directCount = 12;
    for (let i = 0; i < directCount; i++) {
      generated.push({
        id: `d-${i}`,
        type: 'direct',
        angle: (i / directCount) * (Math.PI * 2),
        radius: DIRECT_RADIUS,
        value: Math.random() * 1000,
        label: `@${names[i % names.length]}`,
        lastActive: 0
      });
    }

    // 2. Viral Nodes (Moons)
    const viralCount = 800;
    for (let i = 0; i < viralCount; i++) {
      const parentIndex = Math.floor(Math.random() * directCount);
      const parentAngle = (parentIndex / directCount) * (Math.PI * 2);
      const offset = (Math.random() - 0.5) * 0.8; 
      
      generated.push({
        id: `v-${i}`,
        type: 'viral',
        angle: parentAngle + offset,
        radius: VIRAL_RADIUS + (Math.random() * 150 - 75),
        value: Math.random() * 100,
        parentId: `d-${parentIndex}`,
        label: `@User${Math.floor(Math.random()*9000)}`,
        lastActive: 0
      });
    }
    nodesRef.current = generated;
  }, []);

  // --- SIMULATION LOOP (Transactions) ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (nodesRef.current.length === 0) return;

      const sourceNode = nodesRef.current[Math.floor(Math.random() * nodesRef.current.length)];
      if (!sourceNode) return;

      const amount = Math.random() * 15 + 5;
      
      // Update Node "Active" State for visual flash
      sourceNode.lastActive = Date.now();
      
      // If it's viral, also flash the parent
      if (sourceNode.parentId) {
        const parent = nodesRef.current.find(n => n.id === sourceNode.parentId);
        if (parent) {
             // Delay parent flash slightly to simulate travel time
             setTimeout(() => { parent.lastActive = Date.now() + 500; }, 500);
        }
      }

      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        fromNodeId: sourceNode.id,
        amount,
        timestamp: Date.now(),
      };

      setTransactions(prev => [...prev, newTx]);
      setBalance(prev => prev + amount);

      setTimeout(() => {
        setTransactions(prev => prev.filter(t => t.id !== newTx.id));
      }, 2000);

    }, 300); // Fast transactions

    return () => clearInterval(interval);
  }, []);

  // --- CANVAS RENDERING ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    const render = () => {
      // 0. Setup
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.save();
      
      // Apply Zoom/Pan Transform
      // Center of canvas is (1000, 1000). 
      // We want transform.x/y to move the view relative to that center.
      ctx.translate(CANVAS_SIZE / 2 + transform.x, CANVAS_SIZE / 2 + transform.y);
      ctx.scale(transform.k, transform.k);

      rotation += 0.001; 

      const now = Date.now();

      // 1. Draw Connectivity Lines (Viral -> Direct)
      // We draw these first so they are behind nodes
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;

      nodesRef.current.forEach(node => {
        if (node.type === 'viral' && node.parentId) {
           const parent = nodesRef.current.find(n => n.id === node.parentId);
           if (parent) {
             // Calculate positions based on current rotation
             const nAngle = node.angle + rotation * 0.5;
             const pAngle = parent.angle + rotation; // Directs rotate faster? Or different.
             
             const nx = Math.cos(nAngle) * node.radius;
             const ny = Math.sin(nAngle) * node.radius;
             
             const px = Math.cos(pAngle) * parent.radius;
             const py = Math.sin(pAngle) * parent.radius;

             ctx.moveTo(nx, ny);
             ctx.lineTo(px, py);
           }
        }
      });
      ctx.stroke();

      // 2. Draw Direct -> Center Lines
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 200, 5, 0.1)'; // Faint green
      ctx.lineWidth = 2;
      nodesRef.current.filter(n => n.type === 'direct').forEach(node => {
         const angle = node.angle + rotation;
         const x = Math.cos(angle) * node.radius;
         const y = Math.sin(angle) * node.radius;
         ctx.moveTo(x, y);
         ctx.lineTo(0, 0);
      });
      ctx.stroke();


      // 3. Draw Nodes
      nodesRef.current.forEach(node => {
        // Position
        const angle = node.angle + rotation * (node.type === 'viral' ? 0.5 : 1);
        const x = Math.cos(angle) * node.radius;
        const y = Math.sin(angle) * node.radius;

        // Active Pulse Check
        const timeSinceActive = now - node.lastActive;
        const isActive = timeSinceActive < 1000; // Flash for 1s
        
        // Draw Glow if Active
        if (isActive) {
          const glowSize = 10 + (1 - timeSinceActive/1000) * 20;
          const alpha = 1 - timeSinceActive/1000;
          ctx.beginPath();
          ctx.fillStyle = `rgba(0, 200, 5, ${alpha * 0.5})`;
          ctx.arc(x, y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Node Body
        ctx.beginPath();
        if (node.type === 'direct') {
          ctx.fillStyle = isActive ? '#39FF14' : '#00C805';
          const size = isActive ? 8 : 6;
          ctx.arc(x, y, size, 0, Math.PI * 2);
        } else {
          ctx.fillStyle = isActive ? '#A7F3D0' : 'rgba(200, 230, 255, 0.3)';
          const size = isActive ? 4 : 2;
          ctx.arc(x, y, size, 0, Math.PI * 2);
        }
        ctx.fill();

        // LOD: Labels (Only if zoomed in)
        if (transform.k > 1.2 && (node.type === 'direct' || isActive)) {
           ctx.fillStyle = '#fff';
           ctx.font = '12px monospace';
           ctx.fillText(node.label, x + 12, y + 4);
        }
        
        // LOD: Icons (Only if very zoomed in)
        if (transform.k > 2.5 && node.type === 'direct') {
            // Draw a ring around high-detail nodes
            ctx.strokeStyle = '#00C805';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.stroke();
        }
      });

      // 4. Draw Transactions (Comets)
      transactions.forEach(tx => {
        const age = now - tx.timestamp;
        const duration = 1500;
        const progress = Math.min(age / duration, 1);
        
        const node = nodesRef.current.find(n => n.id === tx.fromNodeId);
        if (!node) return;

        // Calculate positions dynamically to follow rotation
        const nAngle = node.angle + rotation * (node.type === 'viral' ? 0.5 : 1);
        const nx = Math.cos(nAngle) * node.radius;
        const ny = Math.sin(nAngle) * node.radius;

        let targetX = 0, targetY = 0;
        let startX = nx, startY = ny;

        // Path Logic: Viral -> Parent -> Center
        if (node.type === 'viral' && node.parentId) {
           const parent = nodesRef.current.find(n => n.id === node.parentId);
           if (parent) {
              const pAngle = parent.angle + rotation;
              const px = Math.cos(pAngle) * parent.radius;
              const py = Math.sin(pAngle) * parent.radius;
              
              // 2-Stage flight
              if (progress < 0.5) {
                 // Stage 1: Viral -> Parent
                 const localProg = progress * 2;
                 startX = nx; startY = ny;
                 targetX = px; targetY = py;
                 
                 const cx = startX + (targetX - startX) * localProg;
                 const cy = startY + (targetY - startY) * localProg;
                 drawComet(ctx, cx, cy, targetX, targetY, 0.5); // Green tail
              } else {
                 // Stage 2: Parent -> Center
                 const localProg = (progress - 0.5) * 2;
                 startX = px; startY = py;
                 targetX = 0; targetY = 0;

                 const cx = startX + (targetX - startX) * localProg;
                 const cy = startY + (targetY - startY) * localProg;
                 drawComet(ctx, cx, cy, targetX, targetY, 1.0); // Bright tail
              }
              return;
           }
        } 
        
        // Direct -> Center
        targetX = 0; targetY = 0;
        const cx = startX + (targetX - startX) * progress;
        const cy = startY + (targetY - startY) * progress;
        drawComet(ctx, cx, cy, targetX, targetY, 1.0);

      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [transform, transactions]);


  // Helper: Draw Comet
  const drawComet = (ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, intensity: number) => {
     ctx.beginPath();
     ctx.fillStyle = '#fff';
     ctx.arc(x, y, 3 * intensity, 0, Math.PI * 2);
     ctx.fill();
     
     // Tail logic is complex with dynamic targets, simplified glow for now
     ctx.shadowBlur = 15;
     ctx.shadowColor = '#00C805';
  };


  // --- INTERACTION HANDLERS ---

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * ZOOM_SENSITIVITY;
    setTransform(prev => {
      const newK = Math.min(Math.max(prev.k + zoomFactor, 0.1), 5); // Clamp zoom 0.1x to 5x
      return { ...prev, k: newK };
    });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative select-none">
      
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,200,5,0.3)]">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">INK<span className="text-emerald-400">PAY</span></h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">Living Network v0.2</p>
          </div>
        </div>

        <div className="text-right pointer-events-auto bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Yield</div>
          <div className="text-3xl font-mono font-bold text-emerald-400 tabular-nums drop-shadow-[0_0_8px_rgba(0,200,5,0.5)]">
            ${balance.toFixed(2)}
          </div>
        </div>
      </header>

      {/* CANVAS CONTAINER */}
      <div 
        ref={containerRef}
        className="absolute inset-0 cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas 
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-full block"
        />
        
        {/* CENTER AVATAR (DOM Overlay for sharpness) */}
        <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-10 pointer-events-none"
            style={{ 
                x: transform.x, 
                y: transform.y,
                scale: transform.k 
            }}
        >
             <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-emerald-500 flex items-center justify-center shadow-[0_0_50px_rgba(0,200,5,0.4)]">
                <Users className="text-white w-8 h-8" />
             </div>
             {/* Name Label */}
             <div className="absolute top-24 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold font-mono">
                @YOU
             </div>
        </motion.div>
      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-20 pointer-events-auto">
        <button 
            onClick={() => setTransform(p => ({ ...p, k: p.k * 1.2 }))}
            className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center border border-white/10 shadow-lg transition-colors"
        >
            <Plus size={20} />
        </button>
        <button 
            onClick={() => setTransform(p => ({ ...p, k: p.k * 0.8 }))}
            className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center border border-white/10 shadow-lg transition-colors"
        >
            <Minus size={20} />
        </button>
      </div>

      {/* LIVE FEED (Bottom Left) */}
      <div className="absolute bottom-8 left-8 w-80 pointer-events-none">
         <div className="space-y-2">
            <AnimatePresence>
                {transactions.slice(-3).reverse().map(tx => (
                    <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-slate-900/90 backdrop-blur border border-white/10 p-3 rounded-lg flex items-center justify-between shadow-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Zap size={14} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white">New Commission</div>
                                <div className="text-[10px] text-slate-400 font-mono">Via Node {tx.fromNodeId}</div>
                            </div>
                        </div>
                        <div className="text-emerald-400 font-mono font-bold">
                            +${tx.amount.toFixed(2)}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
         </div>
      </div>

    </div>
  );
}
