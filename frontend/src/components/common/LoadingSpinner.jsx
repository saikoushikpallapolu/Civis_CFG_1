import React from "react";
import { motion } from "framer-motion";

export default function LoadingSpinner({ text = "Loading records..." }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center p-12 space-y-4"
    >
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 border-3 border-brown-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-3 border-brown-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-brown-500 animate-pulse">
        {text}
      </p>
    </motion.div>
  );
}
