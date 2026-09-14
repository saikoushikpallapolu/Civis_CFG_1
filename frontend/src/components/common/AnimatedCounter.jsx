import React, { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

/**
 * AnimatedCounter counts smoothly up to target `value` when scrolled into view.
 * Perfect for KPI stats, response tallies, and participation counts.
 */
export default function AnimatedCounter({
  value = 0,
  duration = 1.2,
  prefix = "",
  suffix = "",
  className = "",
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  const targetNumber = typeof value === "number" ? value : parseFloat(value) || 0;
  const isDecimal = !Number.isInteger(targetNumber);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = targetNumber;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const startTime = performance.now();
    const durationMs = duration * 1000;

    let animationFrameId;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease out quart function for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = start + (end - start) * easeProgress;

      setDisplayValue(isDecimal ? parseFloat(current.toFixed(1)) : Math.round(current));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(end);
      }
    };

    animationFrameId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, targetNumber, duration, isDecimal]);

  return (
    <span ref={ref} className={`font-tabular-nums ${className}`}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
