import type { PropsWithChildren } from "react";

export const PlainBox = ({ children }: PropsWithChildren) => <div className="flex px-3 pt-3 pb-3 bg-slate-700 rounded-lg">{children}</div>;
