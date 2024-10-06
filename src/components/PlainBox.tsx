import type { PropsWithChildren } from "react";

export const PlainBox = ({ children }: PropsWithChildren) => (
  <div
    className="flex bg-slate-50 dark:bg-[#1f2024] px-3 pt-3 pb-3 border
   border-slate-300 dark:border-[#1f2024] rounded-lg"
  >
    {children}
  </div>
);
