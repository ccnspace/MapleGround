export const CommonWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex mt-2 px-4 py-6 max-[600px]:py-1 min-[600px]:min-h-[calc(100vh-240px)] max-w-[1366px] max-[600px]:px-1 rounded-lg">
      {children}
    </div>
  );
};
