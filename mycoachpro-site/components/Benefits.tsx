"use client";

import { motion } from "framer-motion";
import {
  ClipboardList, Database, PieChart, Users, ShieldCheck, Rocket,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { SectionHeading } from "@/components/SectionHeading";

const iconMap: Record<string, LucideIcon> = {
  ClipboardList, Database, PieChart, Users, ShieldCheck, Rocket,
};

export function Benefits() {
  const { benefits } = siteConfig;

  return (
    <section
      id="benefices"
      className="py-24 relative"
      aria-labelledby="benefices-heading"
    >
      {/* Gradient divider top */}
      <div className="section-divider mb-0" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/6 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="benefices-heading"
          badge="La solution"
          title={benefits.heading}
          subtitle={benefits.subheading}
        />

        {/* Cards grid */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.cards.map((card, i) => {
            const Icon = iconMap[card.icon] ?? Database;
            return (
              <motion.div
                key={i}
                className="group relative rounded-2xl p-6 bg-gradient-card border border-white/6 hover:border-brand-500/30 transition-all duration-300 hover:shadow-glow-sm"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
              >
                <div className="w-11 h-11 rounded-xl bg-brand-500/12 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <Icon size={20} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Modules chips */}
        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-5">
            Modules disponibles
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {benefits.modules.map((mod) => (
              <span
                key={mod}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-slate-300 hover:bg-brand-500/12 hover:border-brand-500/30 hover:text-brand-300 transition-colors cursor-default"
              >
                {mod}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
