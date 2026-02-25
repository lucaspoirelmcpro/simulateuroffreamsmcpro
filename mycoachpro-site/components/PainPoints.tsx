"use client";

import { motion } from "framer-motion";
import {
  Layers, FileX, ShieldOff, BarChart2, Share2, UserX,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { SectionHeading } from "@/components/SectionHeading";

const iconMap: Record<string, LucideIcon> = {
  Layers, FileX, ShieldOff, BarChart2, Share2, UserX,
};

export function PainPoints() {
  const { pains, painIntro } = siteConfig;

  return (
    <section
      id="douleurs"
      className="py-24 relative overflow-hidden"
      aria-labelledby="douleurs-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-900/5 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="douleurs-heading"
          badge="Vous reconnaissez-vous ?"
          title="Ces problèmes vous coûtent du <span class='gradient-text'>temps et de la performance</span>"
          subtitle="La plupart des clubs gèrent leurs données athlètes avec des outils fragmentés. Voici ce qui se passe quotidiennement."
        />

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pains.map((pain, i) => {
            const Icon = iconMap[pain.icon] ?? Layers;
            return (
              <motion.div
                key={i}
                className="group relative rounded-2xl p-6 border border-white/6 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-red-500/25 transition-all duration-300 hover:bg-red-900/5"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 shrink-0 w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:bg-red-500/15 transition-colors">
                    <Icon size={18} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1.5">
                      {pain.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {pain.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Callout */}
        <motion.div
          className="mt-12 max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-xl font-semibold text-white">
            &ldquo;{painIntro}&rdquo;
          </p>
          <div className="mt-2 h-0.5 w-16 bg-gradient-to-r from-brand-500 to-violet-500 rounded mx-auto" />
        </motion.div>
      </div>
    </section>
  );
}
