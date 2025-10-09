export const ContainerWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={`container_wrapper flex shrink-0 min-w-96
       bg-white/30 flex-col dark:bg-black/10
      
       border border-white/30 dark:border-white/10
       px-2 pt-2 pb-3 rounded-lg gap-1 ${className ?? ""}`}
    >
      <div className={`bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-lg p-3 ${className ?? ""}`}>{children}</div>
    </div>
  );
};
