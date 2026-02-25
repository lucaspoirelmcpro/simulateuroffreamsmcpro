"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/config/site.config";

export function SocialProof() {
  const { stats } = siteConfig;

  // Placeholder logos
  const logos = [
    { label: "Club 1" },
    { label: "Club 2" },
    { label: "Fédération A" },
    { label: "Club 3" },
    { label: "Centre Elite" },
    { label: "Académie" },
  ];

  return (
    <section
      className="py-20 border-y border-white/[0.06] bg-white/[0.015]"
      aria-label="Ils nous font confiance"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trusted by */}
        <motion.p
          className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Adopté par des staffs exigeants, du médical au terrain
        </motion.p>

        {/* Logo strip */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-14">
          {logos.map((logo, i) => (
            <motion.div
              key={i}
              className="h-10 px-5 flex items-center justify-center rounded-xl bg-white/4 border border-white/6 hover:bg-white/7 transition-colors"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <span className="text-xs font-semibold text-slate-400 tracking-wide">
                {logo.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="text-center p-6 rounded-2xl bg-gradient-card border border-white/6 hover:border-brand-500/25 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <p className="text-4xl font-extrabold gradient-text mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
