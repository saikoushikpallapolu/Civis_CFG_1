import React from "react";
import { motion } from "framer-motion";

/**
 * AnimatedPage wraps page contents in a smooth, subtle entrance fade-up
 * and graceful exit animation suited for a dignified government platform.
 */
export default function AnimatedPage({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
