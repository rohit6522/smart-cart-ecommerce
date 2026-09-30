"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-red-600 text-white text-sm overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2 py-2 px-4">
            <WifiOff size={15} />
            No internet connection. Some features may not work.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}