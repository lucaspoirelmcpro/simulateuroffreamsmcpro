"use client";

import Image from "next/image";
import { Twitter, Linkedin, Instagram } from "lucide-react";
import { siteConfig } from "@/config/site.config";

export function Footer() {
  const { footer, name, logo } = siteConfig;

  return (
    <footer
      className="border-t border-white/[0.06] bg-white/[0.01] py-12"
      aria-label="Pied de page"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="relative h-7 w-28 mb-3">
              <Image
                src={logo}
                alt={name}
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              AMS & data platform pour les clubs et fédérations sportives de haut niveau.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 mt-5">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Instagram, label: "Instagram" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/4 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
                  aria-label={label}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Produit
            </h3>
            <ul className="space-y-2.5">
              {footer.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Légal
            </h3>
            <ul className="space-y-2.5">
              {footer.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">{footer.copy}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Tous les systèmes opérationnels
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
