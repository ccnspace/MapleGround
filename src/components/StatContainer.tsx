"use client";

import { useCharacterInfo } from "@/hooks/useCharacterInfo";

export const StatContainer = () => {
  const { characterInfo } = useCharacterInfo();

  return (
    <div
      className="flex shrink-0 flex-row bg-slate-100 dark:bg-[#1f2024] px-3 pt-3 pb-3 border
   border-slate-300 dark:border-[#1f2024] rounded-lg gap-6"
    ></div>
  );
};
