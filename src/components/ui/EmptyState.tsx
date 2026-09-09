import React from "react";
import { FolderOpen } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderOpen className="w-10 h-10 text-slate-400" />,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-slate-50/50 border border-dashed border-slate-300 rounded-md">
      <div className="p-3 bg-white border border-slate-200 rounded-full shadow-subtle mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-800 tracking-tight">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mt-1 mb-5">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
