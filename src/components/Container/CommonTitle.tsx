export const CommonTitle = ({ title, children }: { title: string; children?: React.ReactNode }) => {
  return (
    <p className="text-3xl font-bold flex items-center gap-2 flex-wrap max-[600px]:hidden text-white">
      {title}
      {children}
    </p>
  );
};
