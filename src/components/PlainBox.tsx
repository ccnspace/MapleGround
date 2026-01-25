import type { PropsWithChildren } from "react";

export const PlainBox = ({ children }: PropsWithChildren) => (
  <div className="flex px-1 pt-3 pb-3 border-t border-b  border-color-100 dark:border-color-700 text-gray-900 dark:text-gray-100">
    {children}
  </div>
);
