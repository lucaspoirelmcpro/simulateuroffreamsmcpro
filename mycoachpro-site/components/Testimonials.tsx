"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { SectionHeading } from "@/components/SectionHeading";
import { cn } from "@/lib/utils";

export function Testimonials() {
  const { testimonials, caseStudies } = siteConfig;
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  return (
    <section
      id="temoignages"
      className="py-24 relative overflow-hidden"
      aria-labelledby="temoignages-heading"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet-600/6 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="temoignages-heading"
          badge="Témoignages"
          title="Ce que disent les <span class='gradient-text'>staffs qui utilisent MyCoach Pro</span>"
        />

        {/* Carousel */}
        <div className="mt-14 relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className="rounded-2xl p-8 border border-white/8 bg-gradient-card"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <Quote size={32} className="text-brand-500/40 mb-4" />
              <p className="text-xl text-white leading-relaxed font-medium mb-6">
                &ldquo;{testimonials[current].quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                <div className="w-10 h-10 rounded-xl bg-gradient-btn flex items-center justify-center text-white text-sm font-bold">
                  {testimonials[current].avatar}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{testimonials[current].author}</p>
                  <p className="text-xs text-slate-500">{testimonials[current].org}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-5">
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === current ? "bg-brand-400 w-5" : "bg-slate-600 hover:bg-slate-500"
                  )}
                  aria-label={`Témoignage ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/4 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
                aria-label="Témoignage précédent"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/4 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
                aria-label="Témoignage suivant"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Case studies */}
        <div className="mt-16">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-8">
            Cas clients
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {caseStudies.map((cs, i) => (
              <motion.div
                key={cs.slug}
                className="group rounded-2xl p-7 border border-white/8 bg-gradient-card hover:border-brand-500/25 transition-all hover:shadow-glow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
              >
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/20 mb-3">
                  {cs.label}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{cs.title}</h3>
                <p className="text-sm text-slate-500 mb-3 leading-relaxed">{cs.context}</p>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{cs.result}</p>
                <div className="flex flex-wrap gap-2">
                  {cs.metrics.map((m) => (
                    <span
                      key={m}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
