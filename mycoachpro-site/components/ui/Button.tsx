"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  as?: "button" | "a";
  href?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  as: Tag = "button",
  href,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 cursor-pointer select-none";

  const variants = {
    primary:
      "bg-gradient-btn text-white shadow-glow-sm hover:shadow-glow-md hover:-translate-y-0.5 active:translate-y-0",
    secondary:
      "border border-brand-500/50 text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 hover:border-brand-400 hover:-translate-y-0.5",
    ghost:
      "text-slate-300 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const classes = cn(base, variants[variant], sizes[size], className);

  if (Tag === "a" && href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
