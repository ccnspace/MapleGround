import type { PropsWithChildren } from "react";

export const PlainBox = ({ children }: PropsWithChildren) => (
  <div
    className="flex px-3 pt-3 pb-3 bg-[#E8F5FC] dark:bg-sky-900/60
  border border-[#8FBADB]/80 dark:border-sky-800 rounded-lg"
  >
    {children}
  </div>
);
