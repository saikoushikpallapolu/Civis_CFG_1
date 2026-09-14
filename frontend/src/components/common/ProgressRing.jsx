import React from "react";
import { motion } from "framer-motion";

/**
 * ProgressRing renders an SVG circle progress meter with smooth animated fill.
 * Used for sentiment percentages, completion rates, and metric indicators.
 */
export default function ProgressRing({
  percentage = 0,
  size = 64,
  strokeWidth = 6,
  color = "currentColor",
  trackColor = "hsl(26, 20%, 88%)",
  className = "",
  children,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 origin-center"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated fill circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}
