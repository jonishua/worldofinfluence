'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Users, Zap, Search, Plus, Minus, Volume2, VolumeX } from 'lucide-react';

/**
 * PROTOTYPE: INK PAY - ORBITAL LEDGER (v2.2)
 * Features:
 * - Zoom/Pan (Infinite Canvas feel)
 * - Connected Lineages (Viral -> Direct Lines)
 * - Active Pulse (Green flash on transaction)
 * - Level of Detail (Show names on zoom)
 * - Hover Interaction (Expand nodes on mouseover)
 * - Correct Aspect Ratio (No stretching)
 * - Audio-Reactive Pulse (Sound + Visual Sync)
 */

// --- AUDIO ENGINE ---
class AudioEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  ambientOsc: OscillatorNode | null = null;
  ambientLFO: OscillatorNode | null = null;
  isMuted: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
          this.ctx = new AudioContextClass();
          this.masterGain = this.ctx.createGain();
          this.masterGain.connect(this.ctx.destination);
          this.masterGain.gain.value = 0; // Start muted
      }
    }
  }

  toggleMute(mute: boolean) {
    this.isMuted = mute;
    if (this.ctx?.state === 'suspended') {
        this.ctx.resume();
    }
    
    if (this.masterGain) {
        // Smooth fade
        const now = this.ctx!.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(mute ? 0 : 0.5, now + 0.5);
    }

    if (!mute && !this.ambientOsc) {
        this.startAmbient();
    }
  }

  startAmbient() {
    if (!this.ctx || !this.masterGain) return;
    
    // Low Drone
    this.ambientOsc = this.ctx.createOscillator();
    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.value = 55; // A1 (Low)

    // LFO for "Thrum"
    this.ambientLFO = this.ctx.createOscillator();
    this.ambientLFO.type = 'sine';
    this.ambientLFO.frequency.value = 0.1; // Very slow pulse
    
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 500; 

    // Filter for texture
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    this.ambientOsc.connect(filter);
    filter.connect(this.masterGain);
    
    this.ambientOsc.start();
  }

  playPing() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    // Random High Pitch (Digital drop sound)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.1);

    // Envelope
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }
}

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
  const [isMuted, setIsMuted] = useState(true);
  
  // Audio Engine Ref
  const audioRef = useRef<AudioEngine | null>(null);

  // Initialize Audio Engine
  useEffect(() => {
    audioRef.current = new AudioEngine();
    return () => {
        if (audioRef.current?.ctx) {
            audioRef.current.ctx.close();
        }
    }
  }, []);

  const toggleAudio = () => {
      const newState = !isMuted;
      setIsMuted(newState);
      audioRef.current?.toggleMute(newState);
  };
  
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
  
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [settings, setSettings] = useState({
    directCount: 12,
    viralCount: 800,
    activityLevel: 50 // 0-100
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
    
    // Helper to store parent info for weighted distribution
    const directNodeInfo: { index: number, angle: number, weight: number }[] = [];

    // 1. Direct Nodes (Planets)
    for (let i = 0; i < settings.directCount; i++) {
      // Weight logic: 20% variation range (0.8 to 1.2)
      // This makes some nodes have ~50% more connections than the smallest ones
      const weight = 0.8 + Math.random() * 0.4;
      const angle = (i / settings.directCount) * (Math.PI * 2);
      
      directNodeInfo.push({ index: i, angle, weight });

      generated.push({
        id: `d-${i}`,
        type: 'direct',
        angle,
        radius: DIRECT_RADIUS,
        value: Math.random() * 1000,
        label: `@${names[i % names.length]}`,
        lastActive: 0
      });
    }

    // Calculate total weight for normalization
    const totalWeight = directNodeInfo.reduce((sum, n) => sum + n.weight, 0);

    // 2. Viral Nodes (Moons)
    for (let i = 0; i < settings.viralCount; i++) {
      // Weighted Random Parent Selection
      let randomVal = Math.random() * totalWeight;
      let selectedParent = directNodeInfo[0];
      
      for (const p of directNodeInfo) {
          randomVal -= p.weight;
          if (randomVal <= 0) {
              selectedParent = p;
              break;
          }
      }

      const parentAngle = selectedParent.angle;
      const offset = (Math.random() - 0.5) * 0.8; 
      
      generated.push({
        id: `v-${i}`,
        type: 'viral',
        angle: parentAngle + offset,
        radius: VIRAL_RADIUS + (Math.random() * 150 - 75),
        value: Math.random() * 100,
        parentId: `d-${selectedParent.index}`,
        label: `@User${Math.floor(Math.random()*9000)}`,
        lastActive: 0
      });
    }
    nodesRef.current = generated;
  }, [settings]);

  // --- SIMULATION LOOP (Transactions) ---
  useEffect(() => {
    // Map activityLevel (0-100) to interval (2000ms - 50ms)
    // Higher activity = Lower interval
    const baseInterval = 2000;
    const minInterval = 50;
    const speed = settings.activityLevel / 100; // 0 to 1
    // Logarithmic-ish scaling for feel
    const currentInterval = baseInterval - (speed * (baseInterval - minInterval));

    const interval = setInterval(() => {
      if (nodesRef.current.length === 0) return;

      const sourceNode = nodesRef.current[Math.floor(Math.random() * nodesRef.current.length)];
      if (!sourceNode) return;

      // Amount scales slightly with activity too? Or just frequency. 
      // Let's scale amount variance.
      const baseAmount = 5;
      const variance = 15 + (speed * 50); // More volatility at high speeds
      const amount = Math.random() * variance + baseAmount;
      
      // Update Node "Active" State for visual flash
      sourceNode.lastActive = Date.now();
      
      // If it's viral, also flash the parent
      if (sourceNode.parentId) {
        const parent = nodesRef.current.find(n => n.id === sourceNode.parentId);
        if (parent) {
             setTimeout(() => { parent.lastActive = Date.now() + 500; }, 500);
        }
      }

      // Play Sound
      audioRef.current?.playPing();

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
      }, 3000); 

    }, currentInterval);

    return () => clearInterval(interval);
  }, [settings.activityLevel]);

  // --- CANVAS RENDERING ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    // Removed local rotation variable to prevent reset on re-render

    const render = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      ctx.save();
      
      // Center based on dynamic dimensions
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      
      ctx.translate(centerX + transform.x, centerY + transform.y);
      ctx.scale(transform.k, transform.k);

      // Increment persistent rotation
      rotationRef.current += 0.0005; // Slower, smoother rotation
      const rotation = rotationRef.current;
      
      const now = Date.now();

      // PHYSICS: Calculate Mouse in World Coords
      const worldMouseX = (mouseRef.current.x - (centerX + transform.x)) / transform.k;
      const worldMouseY = (mouseRef.current.y - (centerY + transform.y)) / transform.k;
      const REPULSION_RADIUS = 200;
      const REPULSION_FORCE = 100;

      // 1. Draw Connectivity Lines (With Heat Map Logic)
      ctx.lineWidth = 1;
      
      // AUDIO SYNC: Pulse the background grid or connection opacity based on recent activity
      // We can use transactions length as a proxy for "Energy"
      const energy = Math.min(transactions.length / 5, 1); // 0 to 1 based on activity

      nodesRef.current.forEach(node => {
        // Calculate Base Position
        const nAngle = node.angle + rotation;
        let nx = Math.cos(nAngle) * node.radius;
        let ny = Math.sin(nAngle) * node.radius;

        // Apply Physics Offset to Node Position
        const dx = nx - worldMouseX;
        const dy = ny - worldMouseY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < REPULSION_RADIUS) {
            const force = (1 - dist / REPULSION_RADIUS) * REPULSION_FORCE;
            const angle = Math.atan2(dy, dx);
            nx += Math.cos(angle) * force;
            ny += Math.sin(angle) * force;
        }

        // Store active position for hit testing / drawing lines
        // We attach it to the node object temporarily for this frame
        (node as any)._renderX = nx;
        (node as any)._renderY = ny;

        if (node.type === 'viral' && node.parentId) {
           const parent = nodesRef.current.find(n => n.id === node.parentId);
           if (parent) {
             // Parent Position (Also apply physics if close?)
             const pAngle = parent.angle + rotation;
             let px = Math.cos(pAngle) * parent.radius;
             let py = Math.sin(pAngle) * parent.radius;
             
             // Apply Physics to Parent too (subtle)
             const pdx = px - worldMouseX;
             const pdy = py - worldMouseY;
             const pdist = Math.sqrt(pdx*pdx + pdy*pdy);
             if (pdist < REPULSION_RADIUS) {
                 const force = (1 - pdist / REPULSION_RADIUS) * (REPULSION_FORCE * 0.5); // Less force on heavy planets
                 const angle = Math.atan2(pdy, pdx);
                 px += Math.cos(angle) * force;
                 py += Math.sin(angle) * force;
             }
             (parent as any)._renderX = px;
             (parent as any)._renderY = py;

             // HEAT MAP logic
             const timeSinceActive = now - node.lastActive;
             const isActive = timeSinceActive < 2000;
             
             ctx.beginPath();
             if (isActive) {
                 const intensity = 1 - (timeSinceActive / 2000);
                 ctx.strokeStyle = `rgba(0, 200, 5, ${0.1 + intensity * 0.8})`; 
                 ctx.lineWidth = 1 + intensity;
             } else {
                 ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                 ctx.lineWidth = 1;
             }
             
             ctx.moveTo(nx, ny);
             ctx.lineTo(px, py);
             ctx.stroke();
           }
        }
      });

      // 2. Draw Direct -> Center Lines
      ctx.lineWidth = 2;
      nodesRef.current.filter(n => n.type === 'direct').forEach(node => {
         const x = (node as any)._renderX || Math.cos(node.angle + rotation) * node.radius;
         const y = (node as any)._renderY || Math.sin(node.angle + rotation) * node.radius;
         
         const timeSinceActive = now - node.lastActive;
         const isActive = timeSinceActive < 2000;
         
         ctx.beginPath();
         if (isActive) {
             const intensity = 1 - (timeSinceActive / 2000);
             ctx.strokeStyle = `rgba(0, 200, 5, ${0.2 + intensity * 0.8})`; 
             ctx.lineWidth = 2 + intensity * 2;
         } else {
             ctx.strokeStyle = 'rgba(0, 200, 5, 0.1)';
             ctx.lineWidth = 2;
         }
         
         ctx.moveTo(x, y);
         ctx.lineTo(0, 0);
         ctx.stroke();
      });

      // 3. Draw Nodes (Using cached render positions)
      nodesRef.current.forEach(node => {
        const x = (node as any)._renderX;
        const y = (node as any)._renderY;
        
        // Skip if not calculated (should have been in step 1 or 2)
        if (x === undefined) return; 

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
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Node Body
        ctx.beginPath();
        let size = node.type === 'direct' ? 6 : 2;
        if (isActive) size += 2;
        if (isHovered) size += 3;

        if (node.type === 'direct') {
          ctx.fillStyle = isActive || isHovered ? '#39FF14' : '#00C805';
          ctx.arc(x, y, size, 0, Math.PI * 2);
        } else {
          ctx.fillStyle = isActive || isHovered ? '#A7F3D0' : 'rgba(200, 230, 255, 0.3)';
          ctx.arc(x, y, size, 0, Math.PI * 2);
        }
        ctx.fill();

        // Labels
        const showLabel = (transform.k > 1.2 && (node.type === 'direct' || isActive)) || isHovered;
        if (showLabel) {
           ctx.fillStyle = '#fff';
           ctx.font = isHovered ? 'bold 14px monospace' : '12px monospace';
           const labelOffset = isHovered ? 16 : 12;
           ctx.fillText(node.label, x + labelOffset, y + 4);
        }
      });

      // 4. Draw Transactions (Update to use render positions?)
      // Since tx is interpolation, we can just use the computed positions of the nodes if we can find them.
      // But we just computed them in the loop.
      // Let's use the node's current computed render position for the start/end points to make comets follow the physics!
      transactions.forEach(tx => {
        const age = now - tx.timestamp;
        const duration = 1500;
        const progress = Math.min(age / duration, 1);
        
        const node = nodesRef.current.find(n => n.id === tx.fromNodeId);
        if (!node) return;

        // Start from Node's current physics position
        const nx = (node as any)._renderX;
        const ny = (node as any)._renderY;
        
        if (nx === undefined) return; // Should not happen

        let targetX = 0, targetY = 0;
        let startX = nx, startY = ny;

        if (node.type === 'viral' && node.parentId) {
           const parent = nodesRef.current.find(n => n.id === node.parentId);
           if (parent) {
              const px = (parent as any)._renderX;
              const py = (parent as any)._renderY;
              
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
  // const rotationRef = useRef(0); // REMOVED DUPLICATE

  // MOUSE REF FOR PHYSICS
  const mouseRef = useRef({ x: 0, y: 0 });
  
  // Updated Mouse Move with Rotation Awareness
  const handleMouseMoveWithHitTest = (e: React.MouseEvent) => {
     // Update Mouse Ref for Physics
     mouseRef.current = { x: e.clientX, y: e.clientY };

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
         // Using cached physics position from the last render if available
         // Fallback to strict orbit calc if not
         let nx, ny;
         
         if ((node as any)._renderX !== undefined) {
             nx = (node as any)._renderX;
             ny = (node as any)._renderY;
         } else {
             const angle = node.angle + currentRotation;
             nx = Math.cos(angle) * node.radius;
             ny = Math.sin(angle) * node.radius;
         }
         
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

        <div className="text-right pointer-events-auto bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4">
          
          {/* SIMULATION TOGGLE */}
          <button 
             onClick={() => setIsConfigOpen(!isConfigOpen)}
             className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all
                ${isConfigOpen 
                    ? 'bg-emerald-500 text-slate-900 border-emerald-400 shadow-[0_0_15px_rgba(0,200,5,0.4)]' 
                    : 'bg-slate-800 text-slate-400 border-white/10 hover:border-white/30 hover:text-white'
                }`}
          >
             Simulation
          </button>

          <div className="h-8 w-px bg-white/10" />

          <button 
             onClick={toggleAudio}
             className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5"
          >
             {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-emerald-400" />}
          </button>
          
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Yield</div>
            <div className="text-3xl font-mono font-bold text-emerald-400 tabular-nums drop-shadow-[0_0_8px_rgba(0,200,5,0.5)]">
                ${balance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* SETTINGS PANEL (Slide Down) */}
        <AnimatePresence>
            {isConfigOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    className="absolute top-[100%] right-8 mt-4 z-30 pointer-events-auto bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl w-80 space-y-6 overflow-hidden"
                >
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Network Config</h3>
                        </div>
                        
                        {/* Direct Connections */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-300">
                                <span>Direct Connections</span>
                                <span className="font-mono text-emerald-400">{settings.directCount}</span>
                            </div>
                            <input 
                                type="range" 
                                min="3" max="24" step="1"
                                value={settings.directCount}
                                onChange={(e) => setSettings(p => ({ ...p, directCount: parseInt(e.target.value) }))}
                                className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Viral Connections */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-300">
                                <span>Viral Connections</span>
                                <span className="font-mono text-emerald-400">{settings.viralCount}</span>
                            </div>
                            <input 
                                type="range" 
                                min="100" max="2000" step="50"
                                value={settings.viralCount}
                                onChange={(e) => setSettings(p => ({ ...p, viralCount: parseInt(e.target.value) }))}
                                className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Activity Level */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex justify-between text-xs text-slate-300">
                                <span className="text-white font-bold">Money Flow (Activity)</span>
                                <span className="font-mono text-emerald-400">{settings.activityLevel}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" max="100" step="1"
                                value={settings.activityLevel}
                                onChange={(e) => setSettings(p => ({ ...p, activityLevel: parseInt(e.target.value) }))}
                                className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
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
