import type { PropsWithChildren } from "react";

export const PlainBox = ({ children }: PropsWithChildren) => (
  <div className="flex bg-black/15 dark:bg-white/20 px-3 pt-3 pb-3  dark:border-[#1f2024] rounded-lg">{children}</div>
);
