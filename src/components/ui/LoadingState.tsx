import React from "react";

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-10 h-10 border-3 border-academic-blue border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-600 tracking-wide">{message}</p>
    </div>
  );
};
