"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface OdometerProps {
  value: number;
  className?: string;
  prefix?: string;
}

const Digit = ({ char }: { char: string }) => {
  const isNumber = !isNaN(parseInt(char));

  if (!isNumber) {
    return <span className="inline-block">{char}</span>;
  }

  return (
    <div className="relative inline-block h-[1em] overflow-hidden tabular-nums leading-none">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={char}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
            mass: 1,
          }}
        >
          {char}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default function Odometer({ value, className = "", prefix = "" }: OdometerProps) {
  const [displayValue, setDisplayValue] = useState(value.toLocaleString());

  useEffect(() => {
    setDisplayValue(value.toLocaleString());
  }, [value]);

  const chars = (prefix + displayValue).split("");

  return (
    <div className={`flex items-center overflow-hidden font-mono ${className}`}>
      {chars.map((char, index) => (
        <Digit key={`${index}-${char}`} char={char} />
      ))}
    </div>
  );
}
