import type { PropsWithChildren } from "react";

export const PlainBox = ({ children }: PropsWithChildren) => (
  <div className="flex bg-slate-100 dark:bg-slate-500/10 px-3 pt-3 pb-3  dark:border-[#1f2024] rounded-lg">{children}</div>
);
