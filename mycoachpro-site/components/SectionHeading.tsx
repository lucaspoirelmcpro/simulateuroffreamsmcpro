"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  id?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}

export function SectionHeading({
  id,
  badge,
  title,
  subtitle,
  align = "center",
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <motion.div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
    >
      {badge && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/25 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
          {badge}
        </span>
      )}
      <h2
        id={id}
        className={cn(
          "text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight text-balance",
          titleClassName
        )}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {subtitle && (
        <p className="mt-4 text-lg text-slate-400 leading-relaxed text-balance">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
