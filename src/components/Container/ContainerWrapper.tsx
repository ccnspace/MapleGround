export const ContainerWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={`container_wrapper flex shrink-0 min-w-96
       bg-slate-100 flex-col dark:bg-[#1f2024]
       px-3 pt-3 pb-3 rounded-lg gap-1 ${className}`}
    >
      {children}
    </div>
  );
};
