"use client";

import { Landmark } from "lucide-react";

interface IBIconProps {
  className?: string;
  size?: number;
}

/** Single source of truth for Influence Bucks (IB) currency icon. Use with FormattedIB for amount + icon. */
export function IBIcon({ className = "", size = 14 }: IBIconProps) {
  return (
    <Landmark
      className={className}
      size={size}
      aria-label="Influence Bucks"
      role="img"
    />
  );
}

interface FormattedIBProps {
  amount: number;
  className?: string;
  signed?: boolean;
}

/** Renders numeric amount (monospace) + IB icon. Use for all "X IB" displays. */
export function FormattedIB({ amount, className = "", signed = false }: FormattedIBProps) {
  const display = signed
    ? amount >= 0
      ? `+${amount.toLocaleString()}`
      : amount.toLocaleString()
    : amount.toLocaleString();
  return (
    <span className={`inline-flex items-center gap-1 font-mono tabular-nums ${className}`}>
      <span>{display}</span>
      <IBIcon size={14} className="shrink-0" />
    </span>
  );
}
