import { ReactNode } from "react";

interface ReportCardProps {
  children: ReactNode;
  className?: string;
}

export const ReportCard = ({ children, className = "" }: ReportCardProps) => {
  return (
    <div
      className={`bg-slate-100 dark:bg-color-950 rounded-xl p-5
    max-[600px]:p-2 min-w-[360px] max-[600px]:min-w-full ${className}`}
    >
      {children}
    </div>
  );
};
