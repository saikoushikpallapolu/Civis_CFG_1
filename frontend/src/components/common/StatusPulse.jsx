import React from "react";
import { motion } from "framer-motion";

/**
 * StatusPulse provides a dignified pulsing status indicator with label.
 * Replaces static system status text in admin & analytics cards.
 */
export default function StatusPulse({
  label = "Active",
  status = "active", // 'active' | 'standby' | 'warning' | 'offline'
  className = "",
}) {
  const statusStyles = {
    active: {
      dot: "bg-gov-teal",
      ping: "bg-gov-teal/40",
      text: "text-gov-teal",
      bg: "bg-emerald-50/70 border-emerald-200/60",
    },
    standby: {
      dot: "bg-accent-gold",
      ping: "bg-accent-gold/40",
      text: "text-accent-gold",
      bg: "bg-amber-50/70 border-amber-200/60",
    },
    warning: {
      dot: "bg-gov-red",
      ping: "bg-gov-red/40",
      text: "text-gov-red",
      bg: "bg-rose-50/70 border-rose-200/60",
    },
    offline: {
      dot: "bg-brown-400",
      ping: "bg-brown-400/30",
      text: "text-brown-500",
      bg: "bg-brown-100 border-brown-200",
    },
  };

  const current = statusStyles[status] || statusStyles.active;

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium ${current.bg} ${current.text} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <motion.span
          animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inline-flex h-full w-full rounded-full ${current.ping}`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`} />
      </span>
      <span>{label}</span>
    </div>
  );
}
