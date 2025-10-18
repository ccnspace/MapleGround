import { ReactNode } from "react";

interface ReportCardProps {
  children: ReactNode;
  className?: string;
}

export const ReportCard = ({ children, className = "" }: ReportCardProps) => {
  return (
    <div className="w-full">
      <div
        className={`bg-white/80 dark:bg-slate-800/80 rounded-2xl p-5 max-[600px]:p-2
            shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.1)]
            border border-slate-200 dark:border-slate-700 ${className}`}
      >
        {children}
      </div>
    </div>
  );
};
