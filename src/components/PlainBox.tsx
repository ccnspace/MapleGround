import type { PropsWithChildren } from "react";

export const PlainBox = ({ children }: PropsWithChildren) => (
  <div className="flex px-1 py-3 border-t border-b border-color-100 dark:border-color-700 text-gray-900 dark:text-gray-100 max-[600px]:py-2">
    {children}
  </div>
);
