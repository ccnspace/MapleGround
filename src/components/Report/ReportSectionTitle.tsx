interface ReportSectionTitleProps {
  title: string;
  gradientFrom: string;
  gradientTo: string;
}

export const ReportSectionTitle = ({ title, gradientFrom, gradientTo }: ReportSectionTitleProps) => {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-3 h-8 bg-gradient-to-b from-${gradientFrom} to-${gradientTo} rounded-full`}></div>
      <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200">{title}</h4>
    </div>
  );
};
