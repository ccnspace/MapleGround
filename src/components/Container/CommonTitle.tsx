export const CommonTitle = ({ title, children }: { title: string; children?: React.ReactNode }) => {
  return (
    <p className="text-2xl font-bold flex items-center gap-2 flex-wrap max-[600px]:text-sm">
      {title}
      {children}
    </p>
  );
};
