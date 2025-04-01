import { useContext, useRef } from "react";
import type { SymbolOption } from "@/types/SymbolEquipment";
import type { AndroidEquipment } from "@/types/AndroidEquipment";
import { NormalContainer } from "./normal/Container";
import { AndroidContainer } from "./android/Container";
import { SymbolContainer } from "./symbol/Container";
import { CharacterEquipments } from "@/hooks/useCharacterInfo";

import { EquipContext } from "../Container/EquipContainer";
import { CubeSimulator } from "@/utils/CubeSimulator";

type DetailCardProps = { equipName: string; characterEquipments: CharacterEquipments };

export const DetailCardComponent = ({ equipName, characterEquipments }: DetailCardProps) => {
  if (equipName.includes("아케인심볼")) {
    const item = characterEquipments["arcaneSymbol"]?.[equipName] as SymbolOption;
    return <SymbolContainer type="arcane" item={item} />;
  }

  if (equipName.includes("어센틱심볼")) {
    const item = characterEquipments["authenticSymbol"]?.[equipName] as SymbolOption;
    return <SymbolContainer type="authentic" item={item} />;
  }

  if (equipName.includes("안드로이드")) {
    const item = characterEquipments["android"] as AndroidEquipment;
    return <AndroidContainer item={item} />;
  }

  const item = characterEquipments["normal"]?.[equipName];
  return !!item && <NormalContainer item={item} />;
};

export const EquipDetailCard = ({ equipName }: { equipName: string }) => {
  const { characterEquipments } = useContext(EquipContext);

  if (!characterEquipments) return null;

  return (
    <div
      className="flex flex-col min-w-80 max-w-80
     bg-slate-950/90 dark:bg-[#121212]/90 
     border border-gray-700
     rounded-lg px-5 pt-3 pb-4
     "
    >
      <DetailCardComponent characterEquipments={characterEquipments} equipName={equipName} />
    </div>
  );
};
