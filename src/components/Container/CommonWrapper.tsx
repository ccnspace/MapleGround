export const CommonWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="flex mt-8 px-4 py-6 min-[600px]:min-h-[calc(100vh-240px)] rounded-lg
     bg-white dark:bg-black/70 backdrop-blur-sm"
    >
      {children}
    </div>
  );
};
