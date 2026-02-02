"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  X, 
  Landmark, 
  TrendingUp, 
  Building2, 
  FileText, 
  Key, 
  Package, 
  Box, 
  Zap, 
  Briefcase,
  PlayCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Satellite,
  Moon,
  Crown,
  Star,
  ChevronLeft,
  Radar
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

import { 
  useEconomyStore, 
  useGovernanceStore, 
  useMapStore, 
  usePropertyStore 
} from "@/store/useGameStore";
import Odometer from "@/components/hud/Odometer";

// --- Types ---

type ProductType = 'CURRENCY' | 'PERMIT' | 'KEY' | 'GACHA' | 'SUBSCRIPTION' | 'AD_REWARD';

interface ShopProduct {
  id: string;
  type: ProductType;
  name: string;
  label: string;
  amount?: number;
  price: string;
  bonus?: string;
  costInBucks?: number;
  gachaTier?: 1 | 2 | 3;
}

type TabType = 'exchange' | 'capital' | 'services';

interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  visualTheme: 'BLUEPRINT' | 'TERMINAL' | 'BLACK_CARD';
  features: string[];
  inheritedFeatures: string[];
}

// --- Data ---

const EXCHANGE_PRODUCTS: ShopProduct[] = [
  { id: "bundle_1", type: 'CURRENCY', name: "Starter Bundle", label: "Entry Position", amount: 100, price: "$4.99" },
  { id: "bundle_2", type: 'CURRENCY', name: "Growth Bundle", label: "Seed Round", amount: 220, price: "$9.99", bonus: "10% Bonus" },
  { id: "bundle_3", type: 'CURRENCY', name: "Empire Bundle", label: "Series A", amount: 1200, price: "$49.99", bonus: "20% Bonus" },
  { id: "bundle_4", type: 'CURRENCY', name: "Whale Bundle", label: "IPO Allocation", amount: 2500, price: "$99.99", bonus: "25% Bonus" },
];

const CAPITAL_PRODUCTS: ShopProduct[] = [
  { id: "gacha_1", type: 'GACHA', name: "Logistics Crate", label: "Common/Rare Assets", price: "50 IB", costInBucks: 50, gachaTier: 1 },
  { id: "gacha_2", type: 'GACHA', name: "Blueprint Tube", label: "Rare/Epic Assets", price: "150 IB", costInBucks: 150, gachaTier: 2 },
  { id: "gacha_3", type: 'GACHA', name: "Executive Vault", label: "Epic/Legendary Assets", price: "500 IB", costInBucks: 500, gachaTier: 3 },
  { id: "permit_1", type: 'PERMIT', name: "Single Filing", label: "1 Zoning Permit", amount: 1, price: "$1.99" },
  { id: "permit_3", type: 'PERMIT', name: "Developer Pack", label: "3 Zoning Permits", amount: 3, price: "$4.99", bonus: "Popular" },
  { id: "permit_10", type: 'PERMIT', name: "City Planner Bundle", label: "10 Zoning Permits", amount: 10, price: "$14.99", bonus: "Best Value" },
];

const SERVICE_TIERS: SubscriptionTier[] = [
  {
    id: 'explorer',
    name: "Explorer's Pass",
    price: "$4.99/mo",
    visualTheme: 'BLUEPRINT',
    features: ['2x Map Radius', 'Priority GPS'],
    inheritedFeatures: []
  },
  {
    id: 'trader',
    name: "Day Trader's License",
    price: "$9.99/mo",
    visualTheme: 'TERMINAL',
    features: ['5x Ad-Free Boosts', '8-Hour Escrow'],
    inheritedFeatures: ['2x Map Radius']
  },
  {
    id: 'insider',
    name: "The Insider's Club",
    price: "$49.99/mo",
    visualTheme: 'BLACK_CARD',
    features: ['90 Bucks Daily', 'Streak Bonuses', 'Gold Status'],
    inheritedFeatures: ['2x Map Radius', '5x Ad-Free Boosts', '8-Hour Escrow']
  }
];

// --- Sub-components ---

const KeyAssetCard = ({ 
  tier, 
  label, 
  subLabel, 
  price, 
  isOwned, 
  visualClass, 
  onClick 
}: { 
  tier: string; 
  label: string; 
  subLabel: string; 
  price: number; 
  isOwned: boolean; 
  visualClass: string; 
  onClick: () => void; 
}) => {
  const isLongText = label.length > 8;
  
  return (
    <button
      onClick={onClick}
      disabled={isOwned}
      className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border transition-all active:scale-[0.95] h-40 ${
        isOwned 
          ? 'bg-gradient-to-br from-[#00C805] to-[#00A804] border-[#00C805]/30 shadow-lg shadow-[#00C805]/20' 
          : `${visualClass} shadow-sm hover:shadow-md`
      }`}
    >
      {/* Top: Icon */}
      <div className={`p-2 rounded-xl ${isOwned ? 'bg-white/20' : 'bg-white/50 shadow-inner'}`}>
        {isOwned ? (
          <CheckCircle2 className="h-5 w-5 text-white" />
        ) : (
          <Key className={`h-5 w-5 ${
            tier === 'MUNICIPAL' ? 'text-amber-700' : 
            tier === 'PROVINCIAL' ? 'text-[var(--text-muted)]' : 'text-amber-500'
          }`} />
        )}
      </div>

      {/* Middle: Name */}
      <div className="flex flex-col items-center text-center px-1">
        <span className={`font-black uppercase tracking-tighter leading-none ${
          isOwned ? 'text-white' : 'text-[var(--text-primary)]'
        } ${isLongText ? 'text-[10px]' : 'text-sm'}`}>
          {label}
        </span>
        <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${
          isOwned ? 'text-white/70' : 'text-[var(--text-muted)]'
        }`}>
          {subLabel}
        </span>
      </div>

      {/* Bottom: Price/Status */}
      <div className={`w-full py-1.5 rounded-lg text-center ${
        isOwned ? 'bg-white/20' : 'bg-[var(--gray-bg)]'
      }`}>
        <span className={`text-[9px] font-black uppercase tracking-widest text-white`}>
          {isOwned ? 'Owned' : `${price} IB`}
        </span>
      </div>
    </button>
  );
};

const OpportunityBanner = ({ icon: Icon, title, cta, onClick }: { icon: React.ElementType, title: string, cta: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="relative flex-shrink-0 w-full rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white overflow-hidden group active:scale-[0.98] transition-all"
  >
    <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform">
      <Icon className="h-32 w-32" />
    </div>
    <div className="relative z-10 text-left">
      <h4 className="text-sm font-bold uppercase tracking-widest leading-tight w-2/3 mb-4">{title}</h4>
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00C805]">
        {cta} <ChevronRight className="h-3 w-3" />
      </div>
    </div>
  </button>
);

const ManufacturingReveal = ({ tier, onComplete }: { tier: 1 | 2 | 3, onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative flex flex-col items-center justify-center py-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.2, 0.1, 0.3, 0.1, 0.2] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="h-40 w-40 border border-[#00C805]/30 border-dashed rounded-lg rotate-45" />
      </motion.div>

      <div className="relative h-48 w-48 flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 2.5, ease: "linear", delay: 0.5 }}
          className="relative z-10"
        >
          {tier === 1 ? <Package className="h-24 w-24 text-slate-800" /> : 
           tier === 2 ? <Box className="h-24 w-24 text-[#00C805]" /> : 
           <Building2 className="h-24 w-24 text-amber-500 shadow-2xl" />}
        </motion.div>

        <motion.div
          initial={{ top: "100%" }}
          animate={{ top: "0%" }}
          transition={{ duration: 2.5, ease: "linear", delay: 0.5 }}
          className="absolute left-0 right-0 h-0.5 bg-[#00C805] shadow-[0_0_15px_#00C805] z-20"
        />
        
        <motion.div
           initial={{ top: "100%", height: 0 }}
           animate={{ top: "0%", height: "100%" }}
           transition={{ duration: 2.5, ease: "linear", delay: 0.5 }}
           className="absolute left-0 right-0 bg-gradient-to-t from-[#00C805]/10 to-transparent z-0"
        />
      </div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-[#00C805] animate-pulse"
      >
        Fabricating Asset...
      </motion.p>
    </div>
  );
};

const ServiceCard = ({ 
  tier, 
  containerRef, 
  onAcquire,
  isSubscribed 
}: { 
  tier: SubscriptionTier, 
  containerRef: React.RefObject<HTMLDivElement | null>,
  onAcquire: (product: ShopProduct) => void,
  isSubscribed: boolean
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    container: containerRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const themeClasses = {
    BLUEPRINT: "bg-[var(--gray-bg)] border-[var(--card-border)]",
    TERMINAL: "bg-[var(--gray-bg)] border-[#00C805]/30",
    BLACK_CARD: "bg-black border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
  }[tier.visualTheme];

  const iconColor = {
    BLUEPRINT: "text-blue-400",
    TERMINAL: "text-[#00C805]",
    BLACK_CARD: "text-amber-500"
  }[tier.visualTheme];

  const getIcon = (feature: string) => {
    if (feature.includes('Radius')) return Radar;
    if (feature.includes('GPS')) return Satellite;
    if (feature.includes('Boosts')) return Zap;
    if (feature.includes('Escrow')) return Moon;
    if (feature.includes('Daily')) return Crown;
    if (feature.includes('Status')) return Star;
    if (feature.includes('Streaks')) return TrendingUp;
    return CheckCircle2;
  };

  return (
    <div 
      ref={cardRef}
      id={`tier-${tier.id}`}
      className={`relative min-h-[400px] w-full rounded-2xl border p-8 overflow-hidden transition-all ${themeClasses}`}
    >
      {/* Parallax Background */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
      >
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: `linear-gradient(#ffffff10 1px, transparent 1px), linear-gradient(90deg, #ffffff10 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }} 
        />
        {tier.visualTheme === 'BLUEPRINT' && (
          <div className="absolute inset-0 flex items-center justify-center translate-x-1/4">
            <Radar className="h-96 w-96 text-blue-500/20 rotate-12" />
          </div>
        )}
        {tier.visualTheme === 'TERMINAL' && (
          <div className="absolute inset-0 flex items-center justify-center -translate-x-1/4">
            <TrendingUp className="h-96 w-96 text-[#00C805]/20" />
          </div>
        )}
        {tier.visualTheme === 'BLACK_CARD' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Crown className="h-96 w-96 text-amber-500/10" />
          </div>
        )}
      </motion.div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-xl font-extrabold uppercase tracking-[0.2em] ${tier.visualTheme === 'BLACK_CARD' ? 'text-amber-500' : 'text-white'}`}>
              {tier.name}
            </h3>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Institutional Membership</p>
          </div>
          <div className={`text-lg font-mono font-bold ${tier.visualTheme === 'BLACK_CARD' ? 'text-amber-500' : 'text-white'}`}>
            {tier.price}
          </div>
        </div>

        <div className="mt-8 space-y-4 flex-grow">
          {tier.features.map((feature, i) => {
            const Icon = getIcon(feature);
            return (
              <div key={i} className="flex items-center gap-4">
                <div className={`h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <span className="text-xs font-bold text-[var(--gray-text)] uppercase tracking-widest">{feature}</span>
              </div>
            );
          })}

          {tier.inheritedFeatures.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Composite Benefits</p>
              <div className="space-y-3">
                {tier.inheritedFeatures.map((feature, i) => {
                  const Icon = getIcon(feature);
                  return (
                    <div key={i} className="flex items-center gap-4 opacity-40">
                      <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{feature}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => onAcquire({ id: tier.id, type: 'SUBSCRIPTION', name: tier.name, label: 'Institutional License', price: tier.price })}
          disabled={isSubscribed}
          className={`mt-10 w-full py-4 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 ${
          isSubscribed 
            ? 'bg-[var(--gray-surface)] text-[var(--text-muted)] border border-[var(--card-border)]'
            : tier.visualTheme === 'BLACK_CARD' 
            ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
            : tier.visualTheme === 'TERMINAL'
            ? 'bg-[#00C805] text-white shadow-[0_0_20px_rgba(0,200,5,0.3)]'
            : 'bg-white text-[var(--text-primary)]'
        }`}>
          {isSubscribed ? 'Active License' : 'Acquire License'}
        </button>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onClick, icon: Icon = Landmark }: { product: ShopProduct; onClick: (p: ShopProduct) => void; icon?: React.ElementType }) => (
  <button
    onClick={() => onClick(product)}
    className="group flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-[var(--gray-surface)] p-4 transition-all hover:border-[#00C805]/30 hover:bg-[var(--card-bg)] hover:shadow-lg active:scale-[0.98]"
  >
    <div className="flex items-center gap-4 text-left">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-110">
        <Icon className="h-6 w-6 text-[var(--text-primary)]" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-[var(--text-primary)] tabular-nums">
            {product.amount ? product.amount.toLocaleString() : ""} {product.name}
          </span>
          {product.bonus && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-bold uppercase text-amber-700">
              {product.bonus}
            </span>
          )}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          {product.label}
        </p>
      </div>
    </div>
    <div className="rounded-full bg-[#00C805] px-4 py-2 text-[10px] font-bold text-white shadow-[0_4px_12px_rgba(0,200,5,0.2)] transition-transform group-hover:scale-105 uppercase tracking-widest">
      {product.price}
    </div>
  </button>
);

// --- Main Component ---

type ShopState = "idle" | "processing" | "manufacturing" | "success";

export default function ShopModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const influenceBucks = useEconomyStore((state) => state.influenceBucks);
  const addInfluenceBucks = useEconomyStore((state) => state.addInfluenceBucks);
  const zoningPermits = useEconomyStore((state) => state.zoningPermits);
  const addZoningPermits = useEconomyStore((state) => state.addZoningPermits);
  const activeSubscriptions = useGovernanceStore((state) => state.activeSubscriptions);
  const lastSponsorBriefingTime = useGovernanceStore((state) => state.lastSponsorBriefingTime);
  const watchSponsorBriefing = useGovernanceStore((state) => state.watchSponsorBriefing);
  const cityKeysOwned = useGovernanceStore((state) => state.cityKeysOwned);
  const purchaseCityKey = useGovernanceStore((state) => state.purchaseCityKey);
  const activateSubscription = useGovernanceStore((state) => state.activateSubscription);
  const userLocation = useMapStore((state) => state.userLocation);
  const ownedParcels = usePropertyStore((state) => state.ownedParcels);
  const addLandmark = usePropertyStore((state) => state.addLandmark);

  const cityId = "Austin, TX";
  const stateId = "Texas";
  const countryId = "USA";

  const isCityOwned = cityKeysOwned[cityId] > 0;
  const isStateOwned = cityKeysOwned[stateId] > 0;
  const isCountryOwned = cityKeysOwned[countryId] > 0;

  const [activeTab, setActiveTab] = useState<TabType>('exchange');
  const [shopState, setShopState] = useState<ShopState>("idle");
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; sub: string } | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const ownedParcelCount = Object.keys(ownedParcels).length;

  // Enable drag-to-scroll for desktop
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

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - lastSponsorBriefingTime;
      const remaining = Math.max(0, Math.floor((20 * 60 * 1000 - elapsed) / 1000));
      setCooldownSeconds(remaining);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastSponsorBriefingTime]);

  const scrollToTier = (tierId: string) => {
    setActiveTab('services');
    setTimeout(() => {
      const element = document.getElementById(`tier-${tierId}`);
      if (element && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: element.offsetTop - 20,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleAcquire = (product: ShopProduct) => {
    if (product.costInBucks && influenceBucks < product.costInBucks) {
      alert("Insufficient Influence Bucks");
      return;
    }

    setSelectedProduct(product);
    setShopState("processing");

    setTimeout(() => {
      if (product.type === 'GACHA') {
        setShopState("manufacturing");
      } else {
        handleFinalizePurchase(product);
      }
    }, 1500);
  };

  const handleFinalizePurchase = (product: ShopProduct) => {
    setShopState("success");
    
    // Haptic
    if ("vibrate" in navigator) {
      if (product.type === 'KEY') {
        // Sharp, metallic click for keys
        navigator.vibrate([10]);
      } else {
        navigator.vibrate([50, 50, 50]);
      }
    }

    if (product.type === 'GACHA' || product.type === 'KEY' || (product.amount && product.amount >= 1000)) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00C805", "#39FF14", "#FFFFFF"],
      });
    }

    setTimeout(() => {
      if (product.type === 'CURRENCY') {
        addInfluenceBucks(product.amount || 0);
        setShowToast({ message: "Capital Acquired", sub: "Portfolio Updated Successfully" });
      } else if (product.type === 'PERMIT') {
        addZoningPermits(product.amount || 0);
        setShowToast({ message: "Documentation Filed", sub: "Zoning Permits Received" });
      } else if (product.type === 'GACHA') {
        addInfluenceBucks(-(product.costInBucks || 0));
        addLandmark(`landmark_${Date.now()}`);
        setShowToast({ message: "Asset Manufactured", sub: "Added to Architectural Archives" });
      } else if (product.type === 'KEY') {
        purchaseCityKey(product.id, 200, 'city');
        setShowToast({ message: "Market Unlocked", sub: `${product.name} Added to Portfolio` });
      } else if (product.type === 'SUBSCRIPTION') {
        activateSubscription(product.id);
        setShowToast({ message: "License Activated", sub: `${product.name} Now Active` });
      }
      setTimeout(() => setShowToast(null), 3000);
    }, 500);
  };

  const handleSponsorBriefing = () => {
    if (cooldownSeconds > 0) return;
    setShopState("processing");
    setTimeout(() => {
      const result = watchSponsorBriefing();
      if (result.success) {
        setShopState("success");
        setShowToast({ message: "Grant Received", sub: "+5 Influence Bucks Deposited" });
        setTimeout(() => setShowToast(null), 3000);
      } else {
        setShopState("idle");
      }
    }, 2000);
  };

  const handleClose = () => {
    if (shopState === "processing" || shopState === "manufacturing") return;
    setShopState("idle");
    setSelectedProduct(null);
    onClose();
  };

  const [institutionalRef] = useState(() => Math.random().toString(36).substring(7).toUpperCase());

  return (
    <AnimatePresence>
      {(isOpen || shopState !== "idle") && (
        <motion.div
          key="shop-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[900] pointer-events-none flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            key="shop-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 bg-[var(--gray-bg)]/40 backdrop-blur-sm pointer-events-auto"
          />

          {/* Toast Container */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[1001] pointer-events-none w-full flex justify-center">
            <AnimatePresence mode="wait">
              {showToast && (
                <motion.div
                  key="shop-toast"
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 24, opacity: 1 }}
                  exit={{ y: -100, opacity: 0 }}
                  className="flex items-center gap-3 rounded-[12px] bg-[var(--card-bg)] px-6 py-3 text-[var(--text-primary)] shadow-2xl border border-[var(--card-border)] pointer-events-auto mt-6"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00C805]">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider">{showToast.message}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{showToast.sub}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modal */}
          <motion.div
            key="shop-modal"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-1/2 w-full max-w-[500px] -translate-x-1/2 flex flex-col h-[85vh] overflow-hidden rounded-t-[24px] bg-[var(--card-bg)] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl pointer-events-auto"
          >
            {/* Header - Fixed */}
            <div className="relative border-b border-[var(--card-border)] p-6 pb-4 bg-[var(--card-bg)]/80 backdrop-blur-xl z-30 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    The Asset Exchange
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gray-bg)] shadow-sm">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <Odometer value={influenceBucks} className="text-3xl font-bold text-[var(--text-primary)] tabular-nums" />
                    <div className="ml-2 flex items-center gap-1 text-[#00C805]">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Live</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gray-surface)] transition-colors hover:bg-[var(--gray-bg)]"
                >
                  <X className="h-5 w-5 text-[var(--text-muted)]" />
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-6 flex gap-1 rounded-xl bg-[var(--gray-surface)] p-1">
                {[
                  { id: 'exchange', label: 'Exchange', icon: Landmark },
                  { id: 'capital', label: 'Capital', icon: Box },
                  { id: 'services', label: 'Services', icon: Crown }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (shopState === "processing" || shopState === "manufacturing") return;
                      setActiveTab(tab.id as TabType);
                      setShopState("idle");
                      setSelectedProduct(null);
                    }}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeTab === tab.id 
                        ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <tab.icon className={`h-3 w-3 ${activeTab === tab.id ? 'text-[#00C805]' : ''}`} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Content */}
            <div 
              ref={scrollContainerRef}
              className="relative flex-1 min-h-0 overflow-y-auto pointer-events-auto"
              style={{ 
                paddingBottom: '120px',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y'
              }}
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              <AnimatePresence mode="wait">
                {shopState === "idle" ? (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col p-6 pt-4 space-y-6"
                  >
                    {activeTab === 'exchange' && (
                      <>
                        {/* Opportunity Banners */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Market Opportunities</p>
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                            <div className="snap-center w-full flex-shrink-0">
                              <OpportunityBanner 
                                icon={Radar} 
                                title="Double Your Acquisition Radius" 
                                cta="Upgrade GPS" 
                                onClick={() => scrollToTier('explorer')}
                              />
                            </div>
                            <div className="snap-center w-full flex-shrink-0">
                              <OpportunityBanner 
                                icon={ShieldCheck} 
                                title="Bypass Corporate Sponsors. 5x Daily Boosts." 
                                cta="Get License" 
                                onClick={() => scrollToTier('trader')}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Ad Grant */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Subsidized Capital</p>
                          <button 
                            onClick={handleSponsorBriefing}
                            disabled={cooldownSeconds > 0}
                            className="w-full flex items-center justify-between rounded-2xl border border-slate-100 bg-[var(--gray-surface)] p-4 transition-all hover:bg-[var(--card-bg)] group disabled:opacity-70"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gray-bg)] shadow-sm">
                                <PlayCircle className="h-6 w-6 text-[#00C805]" />
                              </div>
                              <div className="text-left">
                                <h4 className="text-sm font-bold text-[var(--text-primary)]">Sponsor Briefing</h4>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                  {cooldownSeconds > 0 ? (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-2 w-2" /> Next Briefing: {Math.floor(cooldownSeconds / 60)}:{(cooldownSeconds % 60).toString().padStart(2, '0')}
                                    </span>
                                  ) : "Watch Briefing • +5 IB Grant"}
                                </p>
                              </div>
                            </div>
                            <div className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-bold uppercase text-slate-600 group-hover:bg-[#00C805] group-hover:text-white transition-colors">
                              {cooldownSeconds > 0 ? "Locked" : "Watch"}
                            </div>
                          </button>
                        </div>

                        {/* Currency Bundles */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Capital Injections</p>
                          {EXCHANGE_PRODUCTS.map(p => <ProductCard key={p.id} product={p} onClick={handleAcquire} />)}
                        </div>
                      </>
                    )}

                    {activeTab === 'capital' && (
                      <>
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Architectural Archives</p>
                          <div className="grid grid-cols-1 gap-3">
                            {CAPITAL_PRODUCTS.filter(p => p.type === 'GACHA').map(p => (
                              <ProductCard key={p.id} product={p} onClick={handleAcquire} icon={Package} />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3 pt-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Municipal Rights</p>
                          <div className="grid grid-cols-3 gap-2">
                            <KeyAssetCard 
                              tier="MUNICIPAL" 
                              label="Austin" 
                              subLabel="City Rights"
                              price={200}
                              isOwned={isCityOwned}
                              visualClass="bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300"
                              onClick={() => handleAcquire({ id: cityId, type: 'KEY', name: 'Austin City Key', label: 'City Rights', price: '200 IB', costInBucks: 200 })}
                            />
                            <KeyAssetCard 
                              tier="PROVINCIAL" 
                              label="Texas" 
                              subLabel="State Charter"
                              price={200}
                              isOwned={isStateOwned}
                              visualClass="bg-gradient-to-br from-slate-200 to-slate-300 border-slate-400"
                              onClick={() => handleAcquire({ id: stateId, type: 'KEY', name: 'Texas State Key', label: 'State Charter', price: '200 IB', costInBucks: 200 })}
                            />
                            <KeyAssetCard 
                              tier="FEDERAL" 
                              label="USA" 
                              subLabel="Federal Access"
                              price={200}
                              isOwned={isCountryOwned}
                              visualClass="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
                              onClick={() => handleAcquire({ id: countryId, type: 'KEY', name: 'USA Federal Key', label: 'Federal Access', price: '200 IB', costInBucks: 200 })}
                            />
                          </div>
                          {CAPITAL_PRODUCTS.filter(p => p.type === 'PERMIT').map(p => (
                            <ProductCard key={p.id} product={p} onClick={handleAcquire} icon={FileText} />
                          ))}
                        </div>
                      </>
                    )}

                    {activeTab === 'services' && (
                      <div className="space-y-6">
                        {SERVICE_TIERS.map((tier) => {
                          const isLocked = tier.id === 'insider' && ownedParcelCount < 5;
                          if (isLocked) {
                            return (
                              <div key={tier.id} className="relative h-[200px] w-full rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-300">
                                <Briefcase className="h-8 w-8 text-slate-300 mb-4" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">Insider&apos;s Club Locked</h3>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-2">Ownership of 5 Parcels Required</p>
                              </div>
                            );
                          }
                          return (
                            <ServiceCard 
                              key={tier.id} 
                              tier={tier} 
                              containerRef={scrollContainerRef}
                              onAcquire={handleAcquire}
                              isSubscribed={activeSubscriptions.includes(tier.id)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                ) : shopState === "processing" ? (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center justify-center py-24 text-center p-6"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-[#00C805]/20" />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--gray-surface)] border-2 border-slate-100">
                        <Loader2 className="h-8 w-8 animate-spin text-[#00C805]" />
                      </div>
                    </div>
                    <h3 className="mt-8 text-lg font-bold text-[var(--text-primary)] uppercase tracking-widest">Authenticating...</h3>
                    <p className="mt-2 text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em]">Institutional Secure Gateway</p>
                    <div className="mt-10 flex items-center gap-2 rounded-full bg-[var(--gray-surface)] px-5 py-2">
                      <ShieldCheck className="h-3 w-3 text-[#00C805]" />
                      <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">256-Bit Encrypted Transaction</span>
                    </div>
                  </motion.div>
                ) : shopState === "manufacturing" ? (
                  <motion.div
                    key="manufacturing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-10 p-6"
                  >
                    <ManufacturingReveal 
                      tier={selectedProduct?.gachaTier || 1} 
                      onComplete={() => handleFinalizePurchase(selectedProduct!)} 
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center p-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12, stiffness: 200 }}
                      className="relative"
                    >
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#00C805] shadow-[0_12px_32px_rgba(0,200,5,0.3)]">
                        {selectedProduct ? (() => {
                          const Icon = selectedProduct.type === 'PERMIT' ? FileText : 
                                       selectedProduct.type === 'GACHA' ? Package : 
                                       selectedProduct.type === 'KEY' ? Key : 
                                       selectedProduct.type === 'SUBSCRIPTION' ? Briefcase :
                                       selectedProduct.type === 'AD_REWARD' ? Landmark : Landmark;
                          return <Icon className="h-12 w-12 text-white" />;
                        })() : <CheckCircle2 className="h-12 w-12 text-white" />}
                      </div>
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gray-bg)] border-4 border-white"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#00C805]" />
                      </motion.div>
                    </motion.div>

                    <h3 className="mt-8 text-xl font-extrabold text-[var(--text-primary)] uppercase tracking-[0.2em]">Acquisition Complete</h3>
                    
                    <div className="mt-6 space-y-4">
                      <div className="flex flex-col items-center">
                        <div className="bg-[var(--gray-surface)] px-6 py-3 rounded-2xl border border-slate-100 shadow-sm min-w-[200px]">
                          {selectedProduct?.type === 'KEY' ? (
                            <span className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-widest">
                              {userLocation ? "Austin, TX Key" : "City Key"} Secured
                            </span>
                          ) : selectedProduct?.type === 'GACHA' ? (
                            <span className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-widest">
                              {selectedProduct.name} Secured
                            </span>
                          ) : (
                            <>
                              <span className="text-2xl font-mono font-bold text-[var(--text-primary)] tabular-nums">
                                {selectedProduct?.amount ? `+${selectedProduct.amount.toLocaleString()}` : ""}
                              </span>
                              <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                {selectedProduct?.type === 'PERMIT' ? "Zoning Permits" : "Influence Bucks"}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="mt-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-60">
                          {selectedProduct?.label} • Asset Authenticated
                        </p>
                      </div>

                      <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-300">
                        Institutional Ref: {institutionalRef}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setShopState("idle")}
                      className="mt-10 min-w-[240px] rounded-xl bg-[var(--gray-bg)] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-[var(--gray-surface)] active:scale-95 shadow-xl shadow-slate-200"
                    >
                      Return to Exchange
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-[var(--gray-surface)] p-4 border-t border-slate-100 z-30 flex-shrink-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] text-center">
                Official Marketplace Infrastructure • Institutional Level Security
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
