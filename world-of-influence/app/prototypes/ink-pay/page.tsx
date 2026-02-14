'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Users, Zap, Plus, Minus, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
      const AudioContextClass = (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
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
  relativeOffset?: number; // Angle offset from parent (for sticky rotation)
  label: string; // Display name
  lastActive: number; // Timestamp of last transaction
}

type NodeWithRender = Node & { _renderX?: number; _renderY?: number };

interface Transaction {
  id: string;
  fromNodeId: string;
  amount: number;
  timestamp: number;
}

interface Comet {
  id: string;
  fromNodeId: string;
  targetNodeId?: string; // For viral -> direct
  startX: number;
  startY: number;
  timestamp: number;
}

// --- CONFIG ---
const DIRECT_RADIUS = 300;
const VIRAL_RADIUS = 600;
const ZOOM_SENSITIVITY = 0.001;

// --- SCENARIOS ---
type ScenarioId = 'micro' | 'nano' | 'macro' | 'mega' | 'titan';

interface Scenario {
    id: ScenarioId;
    name: string;
    label: string;
    followers: string;
    maxDirects: number;
    maxVirals: number;
    launchDuration: number; // Days to reach 40% of max
}

const SCENARIOS: Record<ScenarioId, Scenario> = {
    micro: {
        id: 'micro',
        name: 'The Local Hero',
        label: 'Micro',
        followers: '5k',
        maxDirects: 500,
        maxVirals: 1500,
        launchDuration: 60
    },
    nano: {
        id: 'nano',
        name: 'The Rising Star',
        label: 'Nano',
        followers: '50k',
        maxDirects: 5000,
        maxVirals: 15000,
        launchDuration: 50
    },
    macro: {
        id: 'macro',
        name: 'The Trendsetter',
        label: 'Macro',
        followers: '250k',
        maxDirects: 25000,
        maxVirals: 50000,
        launchDuration: 45
    },
    mega: {
        id: 'mega',
        name: 'The Icon (Nyjah)',
        label: 'Mega',
        followers: '1M',
        maxDirects: 100000,
        maxVirals: 150000,
        launchDuration: 45
    },
    titan: {
        id: 'titan',
        name: 'The Titan',
        label: 'Global',
        followers: '10M',
        maxDirects: 500000,
        maxVirals: 1000000,
        launchDuration: 30
    }
};

// --- GROWTH LOGIC HELPER ---
const calculateGrowth = (day: number, scenarioId: ScenarioId) => {
    const scenario = SCENARIOS[scenarioId];
    const { maxDirects, maxVirals, launchDuration } = scenario;
    
    let currentDirects = 1;
    
    // Phase 1: The Launch (Day 0-launchDuration) -> Exponential to 40% of max
    const launchTarget = Math.floor(maxDirects * 0.4);
    
    if (day <= launchDuration) {
        if (day === 0) return { currentDirects: 1, currentVirals: 0 };
        const t = day / launchDuration;
        const progress = Math.pow(t, 3.5); // Steeper Cubic ease in
        currentDirects = 1 + Math.floor(launchTarget * progress);
    } else {
        // Phase 2: The Sustain (Day 45-365) -> Linear to 100%
        const remainingTime = 365 - launchDuration;
        const progress = (day - launchDuration) / remainingTime;
        currentDirects = launchTarget + Math.floor((maxDirects - launchTarget) * progress);
    }
    
    // 2. Virals: Rapid Follow (Day 2 Start)
    let currentVirals = 0;
    const viralStartDay = 2; // Reduced from 20 to 2 for "immediate" feel
    
    if (day > viralStartDay) {
        const viralDuration = 365 - viralStartDay;
        const t = (day - viralStartDay) / viralDuration;
        // Adjusted curve: faster initial ramp up
        const progress = Math.pow(t, 1.8); 
        currentVirals = Math.floor(maxVirals * progress);
        
        // Ensure minimum virals if we have directs and passed start day
        if (currentDirects > 5 && currentVirals < currentDirects * 0.5) {
             currentVirals = Math.floor(currentDirects * 0.5);
        }
    }
    
    return { currentDirects, currentVirals };
};

export default function InkPayPrototype() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  
  // Audio Engine Ref
  const audioRef = useRef<AudioEngine | null>(null);
  
  // Comet Ref (Canvas only)
  const cometsRef = useRef<Comet[]>([]);
  // UI Throttling
  const pendingUiData = useRef({ amount: 0, count: 0 });
  const lastUiUpdate = useRef(0);

  const [settings, setSettings] = useState({
    directCount: 12,
    viralCount: 800,
    activityLevel: 50 // 0-100
  });

  const [currentScenario, setCurrentScenario] = useState<ScenarioId>('mega');

  // Refs for settings to avoid re-triggering simulation loop
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

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
  const [simMode, setSimMode] = useState<'manual' | 'dream'>('manual');
  const [timelineDay, setTimelineDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- DREAM SIMULATION LOGIC ---
  useEffect(() => {
    if (!isPlaying || simMode !== 'dream') return;

    const interval = setInterval(() => {
        setTimelineDay(prev => {
            if (prev >= 365) {
                setIsPlaying(false);
                return 365;
            }
            return prev + 1;
        });
    }, 200); // Slower simulation

    return () => clearInterval(interval);
  }, [isPlaying, simMode]);

  // Update Settings based on Timeline
  useEffect(() => {
    if (simMode !== 'dream') return;

    const { currentDirects, currentVirals } = calculateGrowth(timelineDay, currentScenario);

    // VISUAL SCALING: Super-Node Logic
    // Instead of clamping max nodes, we scale 'value' per node
    // Max visual nodes = 50 (Direct), 1500 (Viral) to keep performance high
    const maxVisualDirects = 50;
    const maxVisualVirals = 1000;

    // Use a small fixed divisor to allow rapid initial growth visualization
    const directDivisor = 1; 
    const viralDivisor = 5; // Show 1 viral node per 5 real users to avoid clutter too fast

    // Logic: 
    // 1. Calculate ideal node count based on fixed divisor
    // 2. Clamp at maxVisualDirects (so it never reduces, just ceilings)
    
    const targetDirectNodes = Math.min(Math.ceil(currentDirects / directDivisor), maxVisualDirects);
    const targetViralNodes = Math.min(Math.ceil(currentVirals / viralDivisor), maxVisualVirals);

    // FORCE MINIMUM VISUALS: If we have directs, always show connected virals for effect
    // (Even if math says 0, show 1-2 ghost virals if we have > 3 directs)
    let finalViralNodes = Math.max(0, targetViralNodes);
    if (targetDirectNodes > 2 && finalViralNodes === 0 && currentScenario !== 'micro') {
        finalViralNodes = Math.floor(targetDirectNodes * 1.5); // Fallback: 1.5x directs
    }

    // Update Visual Settings
    setSettings(prev => ({
        ...prev,
        directCount: Math.max(1, targetDirectNodes),
        viralCount: Math.max(0, finalViralNodes),
        // Activity increases with user count to spin faster
        activityLevel: Math.min(100, 10 + (currentDirects + currentVirals) / 2000)
    }));

    // Update Balance (Accumulated)
    const dailyRevenue = (currentDirects * 0.15) + (currentVirals * 0.03); 
    setBalance(prev => prev + dailyRevenue);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- currentScenario intentionally excluded to avoid regeneration loop
  }, [timelineDay, simMode]);

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
    // PRESERVE STATE: We don't want to regenerate existing nodes to avoid flashing
    const existingNodes = nodesRef.current;
    const existingDirectMap = new Map(existingNodes.filter(n => n.type === 'direct').map(n => [n.id, n]));
    const existingViralMap = new Map(existingNodes.filter(n => n.type === 'viral').map(n => [n.id, n]));

    const generated: Node[] = [];
    const names = ["Cloud", "Elon", "Satoshi", "Vibes", "Neo", "Trinity", "Morpheus", "Cipher", "Tank", "Dozer", "Switch", "Apoc"];
    
    // Helper to store parent info for weighted distribution
    const directNodeInfo: { index: number, angle: number, weight: number }[] = [];

    // 1. Direct Nodes (Planets)
    for (let i = 0; i < settings.directCount; i++) {
      const id = `d-${i}`;
      // Distribute evenly
      const angle = (i / settings.directCount) * (Math.PI * 2);
      
      // Preserve or Create
      const existing = existingDirectMap.get(id);
      const weight = 0.8 + Math.random() * 0.4; // Re-roll weight is fine for new assignments

      if (existing) {
        // Update angle to maintain even distribution as count changes
        generated.push({
            ...existing,
            angle: angle 
        });
      } else {
        generated.push({
            id,
            type: 'direct',
            angle,
            radius: DIRECT_RADIUS,
            value: Math.random() * 1000,
            label: `@${names[i % names.length]}`,
            lastActive: 0
        });
      }
      directNodeInfo.push({ index: i, angle, weight });
    }

    // Calculate total weight for normalization
    const totalWeight = directNodeInfo.reduce((sum, n) => sum + n.weight, 0);

    // Helper to pick parent
    const pickParent = () => {
        let randomVal = Math.random() * totalWeight;
        let selected = directNodeInfo[0];
        for (const p of directNodeInfo) {
            randomVal -= p.weight;
            if (randomVal <= 0) {
                selected = p;
                break;
            }
        }
        return selected;
    };

    // 2. Viral Nodes (Moons)
    for (let i = 0; i < settings.viralCount; i++) {
        const id = `v-${i}`;
        const existing = existingViralMap.get(id);

        if (existing) {
            // Check if parent still exists
            const parentIndexStr = existing.parentId?.split('-')[1];
            const parentIndex = parentIndexStr ? parseInt(parentIndexStr) : -1;
            const parentInfo = directNodeInfo.find(d => d.index === parentIndex);

            if (parentInfo) {
                // Parent exists! Update angle to follow parent using relativeOffset
                let newAngle = existing.angle;
                let relativeOffset = existing.relativeOffset;

                if (relativeOffset !== undefined) {
                    newAngle = parentInfo.angle + relativeOffset;
                } else {
                    // First run migration: Calculate offset from current state
                    relativeOffset = existing.angle - parentInfo.angle;
                    // Keep existing angle this frame to prevent jump, but store offset for next
                }

                generated.push({
                    ...existing,
                    angle: newAngle,
                    relativeOffset
                });
            } else {
                // Parent gone (rare), re-roll
                const selectedParent = pickParent();
                const offset = (Math.random() - 0.5) * 0.8;
                generated.push({
                    ...existing,
                    parentId: `d-${selectedParent.index}`,
                    angle: selectedParent.angle + offset,
                    relativeOffset: offset
                });
            }
        } else {
            // NEW NODE
            const selectedParent = pickParent();
            const offset = (Math.random() - 0.5) * 0.8;
            
            generated.push({
                id,
                type: 'viral',
                angle: selectedParent.angle + offset,
                radius: VIRAL_RADIUS + (Math.random() * 150 - 75),
                value: Math.random() * 100,
                parentId: `d-${selectedParent.index}`,
                relativeOffset: offset,
                label: `@User${Math.floor(Math.random()*9000)}`,
                lastActive: 0
            });
        }
    }
    nodesRef.current = generated;
  }, [settings]);

  // --- SIMULATION LOOP (Transactions) ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isRunning = true;

    const loop = () => {
        if (!isRunning) return;

        // Calculate dynamic interval based on current settings ref
        // This prevents the loop from resetting constantly when state changes
        const currentSettings = settingsRef.current;
        
        const baseInterval = 800; 
        const minInterval = 20;   
        const speed = currentSettings.activityLevel / 100;
        const currentInterval = baseInterval - (speed * (baseInterval - minInterval));

        // Execute Transaction
        if (nodesRef.current.length > 0) {
            const sourceNode = nodesRef.current[Math.floor(Math.random() * nodesRef.current.length)];
            
            if (sourceNode) {
                // Amount Logic
                const isWhale = Math.random() > 0.90;
                let amount = 0;
                if (isWhale) {
                    amount = 150 + Math.random() * 100;
                } else {
                    amount = 1 + Math.random() * 4;
                }
                
                // Visual Flash
                sourceNode.lastActive = Date.now();
                if (sourceNode.parentId) {
                    const parent = nodesRef.current.find(n => n.id === sourceNode.parentId);
                    if (parent) {
                         setTimeout(() => { parent.lastActive = Date.now() + 500; }, 500);
                    }
                }

                // Audio
                if (isWhale && audioRef.current?.ctx) {
                    audioRef.current.playPing(); 
                } else {
                    audioRef.current?.playPing();
                }

                // Create Comet (Visual only)
                const newComet: Comet = {
                    id: Math.random().toString(36).substr(2, 9),
                    fromNodeId: sourceNode.id,
                    startX: 0, // Will be set in render loop or here? 
                    // Note: Calculating physics position here is hard without transform context.
                    // We'll let the render loop resolve the position, we just need the IDs.
                    startY: 0,
                    timestamp: Date.now(),
                };
                cometsRef.current.push(newComet);

                // Accumulate for UI
                pendingUiData.current.amount += amount;
                pendingUiData.current.count += 1;

                // Throttle UI Updates (Every 150ms)
                const now = Date.now();
                if (now - lastUiUpdate.current > 150) {
                    const totalAmount = pendingUiData.current.amount;
                    const count = pendingUiData.current.count;
                    
                    if (totalAmount > 0) {
                        setBalance(prev => prev + totalAmount);
                        
                        const newTx: Transaction = {
                            id: Math.random().toString(36).substr(2, 9),
                            fromNodeId: count > 1 ? `Multiple (${count})` : sourceNode.id,
                            amount: totalAmount,
                            timestamp: now,
                        };
                        
                        setTransactions(prev => [...prev, newTx]);
                        
                        // Clear old transactions from list to keep DOM light
                        setTimeout(() => {
                            setTransactions(prev => prev.filter(t => t.id !== newTx.id));
                        }, 3000);
                    }
                    
                    pendingUiData.current = { amount: 0, count: 0 };
                    lastUiUpdate.current = now;
                }
            }
        }

        // Schedule next iteration
        // Randomized slightly to feel organic
        const variance = Math.random() * 200 - 100;
        timeoutId = setTimeout(loop, Math.max(50, currentInterval + variance));
    };

    // Start loop
    loop();

    return () => {
        isRunning = false;
        clearTimeout(timeoutId);
    };
  }, []); // No dependencies! Uses refs for latest state.

  const drawComet = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, intensity: number) => {
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(x, y, 3 * intensity, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00C805';
  }, []);

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
      // (Energy from cometsRef could drive grid/opacity in future)
      const _energy = Math.min(cometsRef.current.length / 5, 1); // 0 to 1 based on activity
      void _energy;

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
        (node as NodeWithRender)._renderX = nx;
        (node as NodeWithRender)._renderY = ny;

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
             (parent as NodeWithRender)._renderX = px;
             (parent as NodeWithRender)._renderY = py;

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
         const x = (node as NodeWithRender)._renderX ?? Math.cos(node.angle + rotation) * node.radius;
         const y = (node as NodeWithRender)._renderY ?? Math.sin(node.angle + rotation) * node.radius;
         
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
        const x = (node as NodeWithRender)._renderX;
        const y = (node as NodeWithRender)._renderY;
        
        // Skip if not calculated (should have been in step 1 or 2)
        if (x === undefined || y === undefined) return; 

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
        
        // SUPER-NODE SCALING (Visual Density)
        // If we are at max capacity (e.g. 50 directs), scale size based on total users
        // We infer "density" from the settings vs max
        if (node.type === 'direct' && settings.directCount >= 50) {
             // Pulse size based on activity
             size = 8 + Math.sin(now * 0.005 + node.angle) * 2; 
        }

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

      // 4. Draw Transactions (Comets from Ref)
      // Filter out old comets first
      cometsRef.current = cometsRef.current.filter(c => now - c.timestamp < 1500);

      cometsRef.current.forEach(comet => {
        const age = now - comet.timestamp;
        const duration = 1500;
        const progress = Math.min(age / duration, 1);
        
        const node = nodesRef.current.find(n => n.id === comet.fromNodeId);
        if (!node) return;

        // Start from Node's current physics position
        const nx = (node as NodeWithRender)._renderX;
        const ny = (node as NodeWithRender)._renderY;
        if (nx === undefined || ny === undefined) return;

        let targetX = 0, targetY = 0;
        let startX = nx, startY = ny;

        if (node.type === 'viral' && node.parentId) {
           const parent = nodesRef.current.find(n => n.id === node.parentId);
           if (parent) {
              const px = (parent as NodeWithRender)._renderX;
              const py = (parent as NodeWithRender)._renderY;
              if (px === undefined || py === undefined) return;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- settings.directCount read inside render loop via ref; omit to avoid loop
  }, [transform, transactions, dimensions, hoveredNodeId]);

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

  // MOUSE REF FOR PHYSICS (used by canvas render loop)
  const mouseRef = useRef({ x: 0, y: 0 });

  // Updated Mouse Move with Rotation Awareness
  const handleMouseMoveWithHitTest = (e: React.MouseEvent) => {
     // Update Mouse Ref for Physics (event handler; ref read in effect)
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
         let nx: number;
         let ny: number;
         const n = node as NodeWithRender;
         if (n._renderX !== undefined && n._renderY !== undefined) {
             nx = n._renderX;
             ny = n._renderY;
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
            <Link 
              href="/" 
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-white uppercase tracking-widest mt-2 transition-colors group"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              Back to Game
            </Link>
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
                            <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
                                <button 
                                    onClick={() => setSimMode('manual')}
                                    className={`${simMode === 'manual' ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}
                                >
                                    Manual
                                </button>
                                <button 
                                    onClick={() => setSimMode('dream')}
                                    className={`${simMode === 'dream' ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}
                                >
                                    Dream Sim
                                </button>
                            </div>
                        </div>
                        
                        {/* MANUAL MODE */}
                        {simMode === 'manual' && (
                            <>
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
                            </>
                        )}

                        {/* DREAM SIM MODE */}
                        {simMode === 'dream' && (
                            <div className="space-y-6">
                                {/* Scenario Selector */}
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">Select Tier</div>
                                    <div className="grid grid-cols-5 gap-1">
                                        {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
                                            <button
                                                key={id}
                                                onClick={() => {
                                                    setCurrentScenario(id);
                                                    setTimelineDay(0);
                                                    setBalance(0);
                                                    setIsPlaying(true);
                                                    setTransactions([]);
                                                    // Reset comets visually
                                                    cometsRef.current = [];
                                                }}
                                                className={`
                                                    h-8 rounded text-[10px] font-bold uppercase transition-all
                                                    ${currentScenario === id 
                                                        ? 'bg-emerald-500 text-slate-900 shadow-[0_0_10px_rgba(0,200,5,0.4)]' 
                                                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-white'
                                                    }
                                                `}
                                                title={SCENARIOS[id].name}
                                            >
                                                {SCENARIOS[id].label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-right text-[10px] text-emerald-400 font-mono">
                                        {SCENARIOS[currentScenario].name}
                                    </div>
                                </div>

                                {/* Timeline Control */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs text-slate-300">
                                        <span className="text-white font-bold">Timeline (Day {timelineDay})</span>
                                        <button 
                                            onClick={() => {
                                                if (timelineDay >= 365) {
                                                    setTimelineDay(0);
                                                    setBalance(0);
                                                    setTransactions([]);
                                                    cometsRef.current = [];
                                                }
                                                setIsPlaying(!isPlaying);
                                            }}
                                            className="text-emerald-400 hover:text-emerald-300 uppercase tracking-widest font-bold"
                                        >
                                            {isPlaying ? 'Pause' : (timelineDay >= 365 ? 'Replay' : 'Play')}
                                        </button>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" max="365" step="1"
                                        value={timelineDay}
                                        onChange={(e) => {
                                            setIsPlaying(false);
                                            setTimelineDay(parseInt(e.target.value));
                                        }}
                                        className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Stats Display */}
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase">Est. Directs</div>
                                        {/* Show Calculated Real Value, not Visual */}
                                        <div className="text-lg font-mono text-white">
                                            {calculateGrowth(timelineDay, currentScenario).currentDirects.toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase">Est. Virals</div>
                                        <div className="text-lg font-mono text-emerald-400">
                                            {calculateGrowth(timelineDay, currentScenario).currentVirals.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-[10px] text-slate-500 text-center italic">
                                    Scenario: {SCENARIOS[currentScenario].followers} Followers
                                </div>
                            </div>
                        )}
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
                                <div className="text-xs font-bold text-white">New Royalty</div>
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
