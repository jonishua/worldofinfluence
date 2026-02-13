'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Users, Zap, Search, Plus, Minus } from 'lucide-react';

/**
 * PROTOTYPE: INK PAY - ORBITAL LEDGER (v2.1)
 * Features:
 * - Zoom/Pan (Infinite Canvas feel)
 * - Connected Lineages (Viral -> Direct Lines)
 * - Active Pulse (Green flash on transaction)
 * - Level of Detail (Show names on zoom)
 * - Hover Interaction (Expand nodes on mouseover)
 * - Correct Aspect Ratio (No stretching)
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
}

// --- CONFIG ---
const DIRECT_RADIUS = 300;
const VIRAL_RADIUS = 600;
const ZOOM_SENSITIVITY = 0.001;

export default function InkPayPrototype() {
  const [balance, setBalance] = useState(12450.50);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Viewport State
  const [transform, setTransform] = useState({ k: 0.6, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // PERSISTENT ROTATION STATE
  const rotationRef = useRef(0);
  
  const nodesRef = useRef<Node[]>([]);
  
  // CONFIGURABLE SETTINGS
  const [settings, setSettings] = useState({
    directCount: 12,
    viralCount: 800
  });

  // --- RESIZE OBSERVER (FIX ASPECT RATIO) ---
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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
      }, 3000); // Increased life for smoother list

    }, 300);

    return () => clearInterval(interval);
  }, []);

  // --- CANVAS RENDERING ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      ctx.save();
      
      // Center based on dynamic dimensions
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      
      ctx.translate(centerX + transform.x, centerY + transform.y);
      ctx.scale(transform.k, transform.k);

      rotation += 0.001; 
      rotationRef.current = rotation; // Sync rotation for hit testing
      const now = Date.now();

      // 1. Draw Connectivity Lines
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;

      nodesRef.current.forEach(node => {
        if (node.type === 'viral' && node.parentId) {
           const parent = nodesRef.current.find(n => n.id === node.parentId);
           if (parent) {
             const nAngle = node.angle + rotation * 0.5;
             const pAngle = parent.angle + rotation;
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
      ctx.strokeStyle = 'rgba(0, 200, 5, 0.1)';
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
        const angle = node.angle + rotation * (node.type === 'viral' ? 0.5 : 1);
        const x = Math.cos(angle) * node.radius;
        const y = Math.sin(angle) * node.radius;

        const timeSinceActive = now - node.lastActive;
        const isActive = timeSinceActive < 1000;
        const isHovered = node.id === hoveredNodeId;
        
        // Active Pulse Glow
        if (isActive) {
          const glowSize = 10 + (1 - timeSinceActive/1000) * 20;
          const alpha = 1 - timeSinceActive/1000;
          ctx.beginPath();
          ctx.fillStyle = `rgba(0, 200, 5, ${alpha * 0.5})`;
          ctx.arc(x, y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hover Glow
        if (isHovered) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
          ctx.arc(x, y, node.type === 'direct' ? 25 : 15, 0, Math.PI * 2);
          ctx.fill();
          
          // Hover Ring
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Node Body
        ctx.beginPath();
        let size = node.type === 'direct' ? 6 : 2;
        if (isActive) size += 2;
        if (isHovered) size += 3; // Pop on hover

        if (node.type === 'direct') {
          ctx.fillStyle = isActive || isHovered ? '#39FF14' : '#00C805';
          ctx.arc(x, y, size, 0, Math.PI * 2);
        } else {
          ctx.fillStyle = isActive || isHovered ? '#A7F3D0' : 'rgba(200, 230, 255, 0.3)';
          ctx.arc(x, y, size, 0, Math.PI * 2);
        }
        ctx.fill();

        // Labels (Show on zoom OR hover)
        const showLabel = (transform.k > 1.2 && (node.type === 'direct' || isActive)) || isHovered;
        
        if (showLabel) {
           ctx.fillStyle = '#fff';
           ctx.font = isHovered ? 'bold 14px monospace' : '12px monospace';
           const labelOffset = isHovered ? 16 : 12;
           ctx.fillText(node.label, x + labelOffset, y + 4);
        }
      });

      // 4. Draw Transactions (Comets)
      transactions.forEach(tx => {
        const age = now - tx.timestamp;
        const duration = 1500;
        const progress = Math.min(age / duration, 1);
        
        const node = nodesRef.current.find(n => n.id === tx.fromNodeId);
        if (!node) return;

        const nAngle = node.angle + rotation * (node.type === 'viral' ? 0.5 : 1);
        const nx = Math.cos(nAngle) * node.radius;
        const ny = Math.sin(nAngle) * node.radius;

        let targetX = 0, targetY = 0;
        let startX = nx, startY = ny;

        if (node.type === 'viral' && node.parentId) {
           const parent = nodesRef.current.find(n => n.id === node.parentId);
           if (parent) {
              const pAngle = parent.angle + rotation;
              const px = Math.cos(pAngle) * parent.radius;
              const py = Math.sin(pAngle) * parent.radius;
              
              if (progress < 0.5) {
                 const localProg = progress * 2;
                 startX = nx; startY = ny;
                 targetX = px; targetY = py;
                 const cx = startX + (targetX - startX) * localProg;
                 const cy = startY + (targetY - startY) * localProg;
                 drawComet(ctx, cx, cy, 0.5);
              } else {
                 const localProg = (progress - 0.5) * 2;
                 startX = px; startY = py;
                 targetX = 0; targetY = 0;
                 const cx = startX + (targetX - startX) * localProg;
                 const cy = startY + (targetY - startY) * localProg;
                 drawComet(ctx, cx, cy, 1.0);
              }
              return;
           }
        } 
        
        targetX = 0; targetY = 0;
        const cx = startX + (targetX - startX) * progress;
        const cy = startY + (targetY - startY) * progress;
        drawComet(ctx, cx, cy, 1.0);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [transform, transactions, dimensions, hoveredNodeId]);

  const drawComet = (ctx: CanvasRenderingContext2D, x: number, y: number, intensity: number) => {
     ctx.beginPath();
     ctx.fillStyle = '#fff';
     ctx.arc(x, y, 3 * intensity, 0, Math.PI * 2);
     ctx.fill();
     ctx.shadowBlur = 15;
     ctx.shadowColor = '#00C805';
  };

  // --- INTERACTION HANDLERS ---
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * ZOOM_SENSITIVITY;
    setTransform(prev => {
      const newK = Math.min(Math.max(prev.k + zoomFactor, 0.1), 5);
      return { ...prev, k: newK };
    });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Dragging Logic
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      }));
    }

    // 2. Hover Logic (Hit Testing)
    if (dimensions.width === 0) return;
    
    // Convert Screen Coords -> World Coords
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const worldX = (e.clientX - (centerX + transform.x)) / transform.k;
    const worldY = (e.clientY - (centerY + transform.y)) / transform.k;

    // Check distance to nodes (Optimization: Only check nearby nodes could be added, but brute force is fine for <1000 items in JS)
    // Actually, checking 800 items on every move event is fine (modern JS is fast).
    // But we need to account for Rotation if we want exact hits!
    // Since rotation happens inside render(), we need to approximate or share state.
    // For Prototype V2, let's just use the radius ranges since it's a ring system, or accept slight inaccuracy.
    // Better: We can't hit test accurately without the current rotation.
    // Solution: Let's just track radius ranges for now? No, users want specific nodes.
    // We'll let the hover be "approximate" or just ignore rotation for hit testing? No, that breaks UI.
    // We will inject the current `rotation` into a ref that we can read here? No, complicated.
    // Actually, just calculating distance from center is enough to know if we are in a ring,
    // but identifying the specific node requires angle.
    // Let's Skip complex hit testing for V2.1 and just do Radius check for "Rings" or simple distance if we assume static rotation for hit test (bad).
    // ALTERNATIVE: Just use the same loop in render to update a "Hover Map"? 
    // Let's keep it simple: We will recalculate the current rotation based on time.
    // Rotation = 0.001 per frame. Frame rate is variable.
    // Let's switch rotation to time-based for consistency.
    
    // For now, let's just flash the "User" if hovered? No the user wants nodes.
    // Let's implement a simple distance check assuming the nodes are roughly where generated, 
    // acknowledging they rotate. 
    // Actually, let's just make the nodes interact properly by passing the rotation ref.
  };
  
  // To solve the rotation sync, let's move rotation state to a ref we can access in mousemove
  const rotationRef = useRef(0);
  
  // Updated Mouse Move with Rotation Awareness
  const handleMouseMoveWithHitTest = (e: React.MouseEvent) => {
     if (isDragging) {
        setTransform(prev => ({
            ...prev,
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        }));
        return;
     }

     if (dimensions.width === 0) return;
     const centerX = dimensions.width / 2;
     const centerY = dimensions.height / 2;
     const worldX = (e.clientX - (centerX + transform.x)) / transform.k;
     const worldY = (e.clientY - (centerY + transform.y)) / transform.k;

     // Current Rotation
     const currentRotation = rotationRef.current;
     
     // Find closest node
     let closestNodeId: string | null = null;
     let minDist = 20 / transform.k; // Hit radius (20px visual)

     // Optimization: Only check if mouse is within valid radius ranges
     const mouseRadius = Math.sqrt(worldX*worldX + worldY*worldY);
     if (Math.abs(mouseRadius - DIRECT_RADIUS) > 50 && Math.abs(mouseRadius - VIRAL_RADIUS) > 100) {
        setHoveredNodeId(null);
        return;
     }

     for (const node of nodesRef.current) {
         const angle = node.angle + currentRotation * (node.type === 'viral' ? 0.5 : 1);
         const nx = Math.cos(angle) * node.radius;
         const ny = Math.sin(angle) * node.radius;
         
         const dx = worldX - nx;
         const dy = worldY - ny;
         const dist = Math.sqrt(dx*dx + dy*dy);
         
         if (dist < minDist) {
             minDist = dist;
             closestNodeId = node.id;
         }
     }
     setHoveredNodeId(closestNodeId);
  };
  
  // Need to update rotation ref in the render loop
  // I will inject `rotationRef.current = rotation` inside the render function above.

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
        onMouseMove={handleMouseMoveWithHitTest}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas 
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="block"
        />
        
        {/* CENTER AVATAR */}
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
            <AnimatePresence mode="popLayout">
                {transactions.slice(-4).reverse().map((tx, i) => (
                    <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1 - (i * 0.15), x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        layout
                        className="bg-slate-900/90 backdrop-blur border border-white/10 p-3 rounded-lg flex items-center justify-between shadow-xl"
                        style={{ zIndex: 10 - i }}
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
