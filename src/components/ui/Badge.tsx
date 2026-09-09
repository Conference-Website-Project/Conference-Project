import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "navy" | "gold" | "crimson" | "slate" | "success" | "outline";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "navy",
  size = "md",
  className,
  ...props
}) => {
  const variants = {
    navy: "bg-blue-50 text-academic-blue border border-blue-200",
    gold: "bg-amber-50 text-amber-800 border border-amber-200",
    crimson: "bg-red-50 text-red-800 border border-red-200",
    slate: "bg-slate-100 text-slate-700 border border-slate-200",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    outline: "bg-transparent text-slate-700 border border-slate-300",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-medium rounded-sm",
    md: "px-2.5 py-1 text-xs font-semibold rounded",
  };

  return (
    <span
      className={twMerge(clsx("inline-flex items-center tracking-wide uppercase font-sans", variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </span>
  );
};
