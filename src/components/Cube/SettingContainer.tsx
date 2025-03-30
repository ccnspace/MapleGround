import { memo } from "react";

export const SettingContainer = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={`flex p-2 flex-col gap-1 text-white rounded-lg
     bg-black/70 border border-white/30 w-[300px]`}
    >
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
});

SettingContainer.displayName = "SettingContainer";
