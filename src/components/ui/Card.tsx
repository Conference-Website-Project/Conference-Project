import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  bordered?: boolean;
  accentBorder?: "navy" | "gold" | "crimson" | "none";
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  bordered = true,
  accentBorder = "none",
  className,
  ...props
}) => {
  const accentStyles = {
    none: "",
    navy: "border-t-4 border-t-academic-blue",
    gold: "border-t-4 border-t-academic-gold",
    crimson: "border-t-4 border-t-academic-accent",
  };

  return (
    <div
      className={twMerge(
        clsx(
          "bg-white rounded-md p-6 shadow-subtle transition-all duration-200",
          bordered && "border border-slate-200",
          hoverable && "hover:shadow-card hover:border-slate-300",
          accentStyles[accentBorder],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge(clsx("border-b border-slate-100 pb-4 mb-4", className))} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
  <h3 className={twMerge(clsx("text-lg font-semibold text-academic-navy tracking-tight", className))} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => (
  <p className={twMerge(clsx("text-sm text-slate-600 mt-1", className))} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge(clsx("", className))} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge(clsx("border-t border-slate-100 pt-4 mt-4 flex items-center justify-between", className))} {...props}>
    {children}
  </div>
);
