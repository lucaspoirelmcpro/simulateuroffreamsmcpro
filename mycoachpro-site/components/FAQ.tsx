"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { SectionHeading } from "@/components/SectionHeading";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { faq } = siteConfig;

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      id="faq"
      className="py-24"
      aria-labelledby="faq-heading"
    >
      <div className="section-divider mb-0" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="faq-heading"
          badge="FAQ"
          title="Questions fréquentes"
          subtitle="Tout ce que vous devez savoir avant de prendre votre décision."
        />

        <div className="mt-12 space-y-2" role="list">
          {faq.map((item, i) => (
            <motion.div
              key={i}
              className={cn(
                "rounded-xl border overflow-hidden transition-colors",
                openIndex === i
                  ? "border-brand-500/30 bg-brand-500/5"
                  : "border-white/6 bg-white/[0.02] hover:border-white/12"
              )}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              role="listitem"
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span
                  className={cn(
                    "font-medium text-sm leading-relaxed",
                    openIndex === i ? "text-white" : "text-slate-300"
                  )}
                >
                  {item.question}
                </span>
                <span className="shrink-0 w-6 h-6 rounded-full border border-white/12 bg-white/4 flex items-center justify-center">
                  {openIndex === i ? (
                    <Minus size={12} className="text-brand-400" />
                  ) : (
                    <Plus size={12} className="text-slate-400" />
                  )}
                </span>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
