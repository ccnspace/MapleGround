import type { PropsWithChildren } from "react";

export const PlainBox = ({ children }: PropsWithChildren) => (
  <div className="flex bg-slate-50 px-3 pt-3 pb-3 border border-slate-300 rounded-lg">
    {children}
  </div>
);
