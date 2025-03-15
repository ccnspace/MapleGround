"use client";

import { useCharacterInfo } from "@/hooks/useCharacterInfo";
import { Ability } from "@/types/Ability";
import { PetEquipment } from "@/types/PetEquipment";
import { useEffect, useState } from "react";

type CurrentAbility = {
  petEquip: PetEquipment;
};

export const PetEquipContainer = () => {
  const [currentAbility, setCurrentAbility] = useState<CurrentAbility>();
  const { ability } = useCharacterInfo();
  const [preset, setPreset] = useState<number>();

  return (
    <div
      className="flex shrink-0 min-w-96 flex-col bg-slate-100 dark:bg-[#1f2024] px-3 pt-3 pb-3
    border-2 border-slate-200 dark:border-[#1f2024] rounded-lg gap-1 min-h-72"
    >
      <div className="flex items-center justify-center h-full">
        <p className="flex font-bold text-sm text-slate-950/50 dark:text-white/60">여기에 펫 정보가 표시됩니다.</p>
      </div>
    </div>
  );
};
