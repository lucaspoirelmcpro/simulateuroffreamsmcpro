"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Pricing() {
  const [annual, setAnnual] = useState(true);
  const { plans, pricingNote } = siteConfig;

  const scrollToDemo = () => {
    const el = document.getElementById("demo");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="tarifs"
      className="py-24 relative"
      aria-labelledby="tarifs-heading"
    >
      <div className="section-divider mb-0" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-brand-600/5 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="tarifs-heading"
          badge="Tarifs"
          title="Choisissez la formule <span class='gradient-text'>adaptée à votre club</span>"
          subtitle="Engagement 1, 2 ou 3 saisons. Remises sur volume. Devis personnalisé en 24h."
        />

        {/* Toggle annuel / mensuel */}
        {siteConfig.pricingToggle && (
          <motion.div
            className="mt-8 flex items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className={cn("text-sm font-medium", !annual ? "text-white" : "text-slate-500")}>
              Mensuel
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors",
                annual ? "bg-brand-500" : "bg-slate-700"
              )}
              aria-label={annual ? "Passer au tarif mensuel" : "Passer au tarif annuel"}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                  annual ? "left-7" : "left-1"
                )}
              />
            </button>
            <span className={cn("text-sm font-medium flex items-center gap-1.5", annual ? "text-white" : "text-slate-500")}>
              Annuel
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/25">
                -10%
              </span>
            </span>
          </motion.div>
        )}

        {/* Plans */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl p-7 border transition-all duration-300",
                plan.highlight
                  ? "border-brand-500/50 bg-gradient-to-b from-brand-500/10 to-transparent shadow-glow-md"
                  : "border-white/8 bg-white/[0.02] hover:border-white/15"
              )}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              {/* Badge */}
              {plan.badge && (
                <span
                  className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap",
                    plan.highlight
                      ? "bg-gradient-btn text-white"
                      : "bg-slate-700 text-slate-300 border border-white/10"
                  )}
                >
                  {plan.badge}
                </span>
              )}

              <div className="mb-5">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-400">{plan.tagline}</p>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-white/8">
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-extrabold text-white">
                    {annual ? plan.yearlyPrice : plan.monthlyPrice}€
                  </span>
                  <span className="text-sm text-slate-400 mb-1.5">{plan.unit}</span>
                </div>
                {annual && (
                  <p className="text-xs text-green-400 mt-1">
                    Économisez {(parseInt(plan.monthlyPrice) - parseInt(plan.yearlyPrice)) * 12}€/an/licence
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={15}
                      className={cn(
                        "mt-0.5 shrink-0",
                        plan.highlight ? "text-brand-400" : "text-green-400"
                      )}
                    />
                    <span className="text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlight ? "primary" : "secondary"}
                size="md"
                onClick={scrollToDemo}
                className="w-full"
                aria-label={`Demander un devis pour le plan ${plan.name}`}
              >
                {plan.highlight && <Zap size={14} />}
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          className="mt-8 text-center text-sm text-slate-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {pricingNote}
        </motion.p>
      </div>
    </section>
  );
}
