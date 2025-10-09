export const CommonWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex mt-8 px-3 py-5 min-[600px]:min-h-[calc(100vh-240px)] rounded-lg bg-white/40 dark:bg-white/10 backdrop-blur-sm">
      {children}
    </div>
  );
};
