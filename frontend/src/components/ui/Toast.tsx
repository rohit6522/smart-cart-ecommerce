"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)] border border-slate-700/50 z-50 flex items-center gap-2"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}