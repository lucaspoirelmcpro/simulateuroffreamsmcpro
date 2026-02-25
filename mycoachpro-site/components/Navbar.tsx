"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { siteConfig } from "@/config/site.config";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onVideoOpen: () => void;
}

export function Navbar({ onVideoOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll spy
  useEffect(() => {
    const sections = siteConfig.nav.links.map((l) => l.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const el = document.getElementById(href.replace("#", ""));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#080b14]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]"
            : "bg-transparent"
        )}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-2.5 shrink-0"
              aria-label="MyCoach Pro — Accueil"
            >
              <div className="relative h-8 w-28">
                <Image
                  src={siteConfig.logo}
                  alt="MyCoach Pro"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
              {siteConfig.nav.links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeSection === link.href.replace("#", "")
                      ? "text-white bg-white/8"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={onVideoOpen}
                aria-label="Voir la vidéo de présentation"
              >
                Voir la vidéo
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleNavClick("#demo")}
                aria-label="Demander une démonstration"
              >
                Demander une démo
              </Button>
            </div>

            {/* Mobile burger */}
            <button
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              className="absolute top-0 right-0 h-full w-72 bg-[#0d1023] border-l border-white/8 flex flex-col p-6 pt-20 gap-2"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 200 }}
              aria-label="Menu mobile"
            >
              {siteConfig.nav.links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-left px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/6 transition-colors font-medium"
                >
                  {link.label}
                </button>
              ))}

              <div className="mt-4 pt-4 border-t border-white/8 flex flex-col gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => { setMobileOpen(false); onVideoOpen(); }}
                  className="w-full"
                >
                  Voir la vidéo
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleNavClick("#demo")}
                  className="w-full"
                >
                  Demander une démo
                </Button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
