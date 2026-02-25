"use client";

import { motion } from "framer-motion";
import { Settings2, Download, BarChart2, Share2, Lightbulb } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { SectionHeading } from "@/components/SectionHeading";

const stepIcons = [Settings2, Download, BarChart2, Share2];

export function HowItWorks() {
  const { steps, onboarding } = siteConfig;

  return (
    <section
      id="process"
      className="py-24 relative overflow-hidden"
      aria-labelledby="process-heading"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/5 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="process-heading"
          badge="Déploiement simple"
          title="Opérationnel en <span class='gradient-text'>moins de 2 semaines</span>"
          subtitle="Quatre étapes claires, un onboarding accompagné. Vos équipes sont prises en main dès le départ."
        />

        {/* Steps */}
        <div className="mt-16 relative">
          {/* Connecting line — desktop */}
          <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = stepIcons[i];
              return (
                <motion.div
                  key={i}
                  className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  {/* Number circle */}
                  <div className="relative mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/12 border border-brand-500/25 flex items-center justify-center">
                      <Icon size={22} className="text-brand-400" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-btn text-white text-[10px] font-bold flex items-center justify-center">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">{step.desc}</p>
                  <p className="text-xs text-slate-500 italic">{step.detail}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Onboarding encart */}
        <motion.div
          className="mt-14 rounded-2xl p-7 border border-brand-500/20 bg-gradient-to-r from-brand-500/8 to-violet-500/5 flex gap-5 items-start"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mt-0.5">
            <Lightbulb size={18} className="text-brand-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1.5">{onboarding.title}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{onboarding.desc}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
