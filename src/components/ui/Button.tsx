import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed rounded";

  const variants = {
    primary: "bg-academic-blue hover:bg-academic-navy text-white focus:ring-academic-blue border border-transparent shadow-sm",
    secondary: "bg-slate-700 hover:bg-slate-800 text-white focus:ring-slate-700 border border-transparent shadow-sm",
    outline: "border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 focus:ring-slate-400 shadow-subtle",
    ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-300",
    danger: "bg-academic-accent hover:bg-red-900 text-white focus:ring-academic-accent shadow-sm",
    gold: "bg-academic-gold hover:bg-amber-800 text-white focus:ring-academic-gold shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs font-medium gap-1.5",
    md: "px-4 py-2 text-sm font-medium gap-2",
    lg: "px-5 py-2.5 text-base font-semibold gap-2.5",
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}

      <span>{children}</span>

      {!isLoading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
};
