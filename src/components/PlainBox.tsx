import type { PropsWithChildren } from "react";

export const PlainBox = ({ children }: PropsWithChildren) => (
  <div className="flex bg-slate-50 px-2 pt-2 pb-2 border border-slate-300 rounded-lg">
    {children}
  </div>
);
