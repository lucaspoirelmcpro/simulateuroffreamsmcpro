"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Play } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { Button } from "@/components/ui/Button";

interface FinalCTAProps {
  onVideoOpen: () => void;
}

export function FinalCTA({ onVideoOpen }: FinalCTAProps) {
  const { finalCta } = siteConfig;
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Honeypot check
    if (honeypotRef.current?.value) return;

    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
    } catch {
      // Silent fail — show success anyway (form data is logged)
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <section
      id="demo"
      className="py-24 relative overflow-hidden"
      aria-labelledby="demo-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/4 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-600/10 blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-3xl border border-brand-500/25 bg-gradient-to-br from-brand-500/8 via-transparent to-violet-500/5 p-10 sm:p-14 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Heading */}
          <h2
            id="demo-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight text-balance mb-4"
          >
            {finalCta.heading}
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            {finalCta.subtext}
          </p>

          {submitted ? (
            <motion.div
              className="flex flex-col items-center gap-3 py-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle2 size={48} className="text-green-400" />
              <p className="text-xl font-semibold text-white">{finalCta.successMessage}</p>
              <p className="text-slate-400 text-sm">Réponse sous 24–48h ouvrés.</p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="max-w-xl mx-auto"
              noValidate
            >
              {/* Honeypot */}
              <input
                ref={honeypotRef}
                type="text"
                name="website"
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
                autoComplete="off"
              />

              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="firstName" className="sr-only">Prénom</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Prénom"
                    className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/60 focus:bg-white/8 transition-colors"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="sr-only">Nom</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Nom"
                    className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/60 focus:bg-white/8 transition-colors"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="sr-only">Email professionnel</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email professionnel"
                  className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/60 focus:bg-white/8 transition-colors"
                  autoComplete="email"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="org" className="sr-only">Organisation</label>
                <input
                  id="org"
                  name="org"
                  type="text"
                  required
                  placeholder="Club / Fédération / Organisation"
                  className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/60 focus:bg-white/8 transition-colors"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="role" className="sr-only">Votre rôle</label>
                <select
                  id="role"
                  name="role"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-slate-400 text-sm focus:outline-none focus:border-brand-500/60 focus:bg-white/8 transition-colors appearance-none"
                  defaultValue=""
                >
                  <option value="" disabled>Votre rôle</option>
                  {finalCta.roles.map((role) => (
                    <option key={role} value={role} className="bg-slate-900 text-white">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Envoi en cours…
                  </span>
                ) : (
                  <>
                    {finalCta.submitLabel}
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>

              <p className="mt-3 text-xs text-slate-500 text-center">
                Réponse sous 24–48h. Sans engagement.
              </p>
            </form>
          )}

          {/* Video link */}
          <button
            onClick={onVideoOpen}
            className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-300 transition-colors"
            aria-label="Voir la vidéo de présentation"
          >
            <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Play size={8} fill="currentColor" className="text-brand-400 ml-0.5" />
            </span>
            {finalCta.videoLabel}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
