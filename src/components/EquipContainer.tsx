"use client";

import { useCharacterInfo } from "@/hooks/useCharacterInfo";
import { useState } from "react";
import { EquipDetailCard } from "./Equip/EquiqDetailCard";
import { EquipInventory } from "./Equip/EquipInventory";

export const EquipContainer = () => {
  const [selectedEquipName, setSelectedEquipName] = useState("");
  const { characterInfo } = useCharacterInfo();

  return (
    <div
      className="flex shrink-0 flex-row bg-slate-100 dark:bg-[#1f2024] px-3 pt-3 pb-3 border
   border-slate-300 dark:border-[#1f2024] rounded-lg gap-6"
    >
      {!!characterInfo?.equipments && (
        <EquipInventory
          equipments={characterInfo.equipments}
          setSelectedEquipName={setSelectedEquipName}
        />
      )}
      <div className="flex items-center justify-center rounded-lg px-4 pt-4 pb-4 min-w-[360px] bg-slate-200 dark:bg-[#25272e]">
        {!!selectedEquipName && !!characterInfo?.equipments && (
          <EquipDetailCard
            equipData={characterInfo.equipments}
            equipName={selectedEquipName}
          />
        )}
      </div>
    </div>
  );
};
