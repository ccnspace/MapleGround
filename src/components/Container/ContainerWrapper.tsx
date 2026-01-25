export const ContainerWrapper = ({
  children,
  className,
  innerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) => {
  return (
    <div className={`container_wrapper flex shrink-0 min-w-96 flex-col gap-1 ${className ?? ""}`}>
      <div className={`bg-slate-100 dark:bg-color-950/50 backdrop-blur-sm rounded-lg p-3 ${innerClassName ?? ""}`}>{children}</div>
    </div>
  );
};
