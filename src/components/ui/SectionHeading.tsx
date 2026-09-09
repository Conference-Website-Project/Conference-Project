import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  subtitle,
  align = "left",
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx("mb-8 md:mb-12", align === "center" && "text-center mx-auto max-w-3xl", className)
      )}
      {...props}
    >
      {badge && (
        <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold uppercase tracking-wider text-academic-blue bg-blue-50 border border-blue-100 rounded-sm">
          {badge}
        </span>
      )}
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-academic-navy tracking-tight leading-tight">
        {title}
      </h2>
      <div className={clsx("h-1 w-12 bg-academic-gold mt-3 mb-4 rounded-full", align === "center" && "mx-auto")} />
      {subtitle && (
        <p className="text-base text-slate-600 font-sans leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
