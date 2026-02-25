"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyCTAProps {
  onVideoOpen: () => void;
}

export function StickyCTA({ onVideoOpen }: StickyCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToDemo = () => {
    const el = document.getElementById("demo");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5"
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: "spring", damping: 22, stiffness: 250 }}
        >
          {/* Video button */}
          <motion.button
            onClick={onVideoOpen}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl",
              "bg-slate-800/95 backdrop-blur-sm text-white text-sm font-medium",
              "border border-white/10 shadow-lg hover:bg-slate-700 transition-colors"
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Voir la vidéo de présentation"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-500">
              <Play size={10} fill="white" className="text-white ml-0.5" />
            </span>
            <span>Voir la vidéo (2 min)</span>
          </motion.button>

          {/* Demo button */}
          <motion.button
            onClick={scrollToDemo}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl",
              "bg-gradient-btn text-white text-sm font-semibold",
              "shadow-glow-sm hover:shadow-glow-md transition-shadow"
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Demander une démonstration"
          >
            <Calendar size={15} />
            <span>Demander une démo</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
