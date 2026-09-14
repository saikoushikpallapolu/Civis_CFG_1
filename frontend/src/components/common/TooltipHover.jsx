import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TooltipHover provides a sleek, micro-animated floating explanation on hover or focus.
 * Condenses long static paragraphs into clean interactive affordances.
 */
export default function TooltipHover({
  content,
  children,
  position = "top",
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: position === "top" ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: position === "top" ? 4 : -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-50 pointer-events-none px-2.5 py-1.5 text-xs text-brown-50 bg-brown-900/95 backdrop-blur-md rounded-md shadow-lg whitespace-normal max-w-xs text-center leading-snug border border-brown-700/50 ${positionStyles[position]}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
