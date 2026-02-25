"use client";

import { motion, type Transition } from "framer-motion";
import { CheckCircle2, Play, ArrowRight, Zap } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { Button } from "@/components/ui/Button";

interface HeroProps {
  onVideoOpen: () => void;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.55,
    delay,
    ease: [0.22, 1, 0.36, 1] as Transition["ease"],
  },
});

export function Hero({ onVideoOpen }: HeroProps) {
  const { hero } = siteConfig;

  const scrollToDemo = () => {
    const el = document.getElementById("demo");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToProcess = () => {
    const el = document.getElementById("process");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center pt-20 pb-16 overflow-hidden"
      aria-label="Section principale"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-brand-600/8 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/6 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-pink-600/5 blur-[80px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left col — copy */}
          <div>
            {/* Badge */}
            <motion.div {...fadeUp(0.05)}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/12 text-brand-300 border border-brand-500/20 mb-6">
                <Zap size={11} className="text-brand-400" />
                {hero.badge}
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-[1.08] tracking-tight text-balance"
              {...fadeUp(0.12)}
            >
              {hero.h1.split("\n").map((line, i) =>
                i === 0 ? (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ) : (
                  <span key={i} className="gradient-text">
                    {line}
                  </span>
                )
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mt-6 text-lg text-slate-400 leading-relaxed max-w-xl"
              {...fadeUp(0.2)}
            >
              {hero.subtitle}
            </motion.p>

            {/* Bullets */}
            <motion.ul
              className="mt-6 space-y-2.5"
              {...fadeUp(0.28)}
            >
              {hero.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-300 text-sm">
                  <CheckCircle2
                    size={16}
                    className="text-brand-400 mt-0.5 shrink-0"
                  />
                  {b}
                </li>
              ))}
            </motion.ul>

            {/* CTAs */}
            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              {...fadeUp(0.36)}
            >
              <Button variant="primary" size="lg" onClick={scrollToDemo}>
                Demander une démo
                <ArrowRight size={16} />
              </Button>
              <Button variant="secondary" size="lg" onClick={scrollToProcess}>
                Voir comment ça marche
              </Button>
            </motion.div>

            {/* Trusted by */}
            <motion.p
              className="mt-6 text-xs text-slate-500 font-medium tracking-wide uppercase"
              {...fadeUp(0.44)}
            >
              {hero.trustedBy}
            </motion.p>
          </div>

          {/* Right col — video card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Video thumbnail card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-br from-slate-800/60 to-slate-900/80 shadow-glow-md">
              {/* Fake screenshot / placeholder */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-brand-950/80 to-slate-900 flex items-center justify-center group cursor-pointer" onClick={onVideoOpen}>
                {/* Dashboard mockup */}
                <div className="absolute inset-0 p-5 opacity-60">
                  <div className="flex gap-3 mb-3">
                    {["Wellness", "Charge", "Blessures"].map((t) => (
                      <div key={t} className="flex-1 bg-brand-500/20 rounded-lg h-8 flex items-center justify-center">
                        <span className="text-[9px] text-brand-300 font-medium">{t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[72, 88, 64, 91, 78, 85].map((v, i) => (
                      <div key={i} className="bg-white/4 rounded-lg p-2">
                        <div className="text-[8px] text-slate-500 mb-1">KPI {i + 1}</div>
                        <div className="text-sm font-bold text-brand-300">{v}</div>
                        <div className="h-1 bg-slate-700 rounded mt-1">
                          <div className="h-1 bg-brand-500 rounded" style={{ width: `${v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/3 rounded-lg h-16 flex items-end px-2 pb-1 gap-1">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 68].map((h, i) => (
                      <div key={i} className="flex-1 bg-brand-500/50 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                {/* Play button overlay */}
                <div className="relative flex flex-col items-center gap-3 z-10">
                  <motion.button
                    className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-glow-md group-hover:scale-110 transition-transform"
                    whileHover={{ scale: 1.1 }}
                    aria-label="Lancer la vidéo de présentation"
                  >
                    <Play size={22} fill="#6366f1" className="text-brand-500 ml-1" />
                  </motion.button>
                  <span className="text-sm text-white/80 font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                    {hero.videoLabel}
                  </span>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="px-4 py-3 border-t border-white/6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-slate-400">Dashboard en temps réel</span>
                </div>
                <span className="text-xs text-slate-500">MyCoach Pro AMS</span>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              className="absolute -top-4 -right-4 bg-gradient-btn px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-glow-sm"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              +200 clubs
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
