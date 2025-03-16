"use client";

import { useCharacterStore } from "@/stores/character";
import { MouseEvent, useCallback, useEffect, useState } from "react";

export const EquipSetContainer = () => {
  const petEquip = useCharacterStore((state) => state.characterAttributes?.petEquip);

  return (
    <div
      className="flex shrink-0 min-w-96 flex-col bg-slate-100 dark:bg-[#1f2024] px-3 pt-3 pb-3
    rounded-lg gap-1 min-h-72"
    >
      <div className="flex items-center justify-center h-full">
        <p className="flex font-bold text-sm text-slate-950/50 dark:text-white/60">여기에 세트효과가 표시됩니다.</p>
      </div>
    </div>
  );
};
