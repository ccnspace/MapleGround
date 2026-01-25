import { ReactNode } from "react";

interface ReportCardProps {
  children: ReactNode;
  className?: string;
}

export const ReportCard = ({ children, className = "" }: ReportCardProps) => {
  return (
    <div className="w-full">
      <div className={`bg-slate-100 dark:bg-color-950 rounded-xl p-5 max-[600px]:p-2 ${className}`}>{children}</div>
    </div>
  );
};
