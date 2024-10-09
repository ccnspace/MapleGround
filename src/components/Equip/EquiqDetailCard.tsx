import type { ItemEquipment } from "@/types/Equipment";
import type { SymbolOption } from "@/types/SymbolEquipment";
import type { AndroidEquipment } from "@/types/AndroidEquipment";
import { NormalContainer } from "./normal/Container";
import { AndroidContainer } from "./android/Container";
import { SymbolContainer } from "./symbol/Container";
import { CharacterEquipments } from "@/hooks/useCharacterInfo";

type DetailCardProps = { equipName: string; equipData: CharacterEquipments };

const DetailCardComponent = ({ equipName, equipData }: DetailCardProps) => {
  if (equipName.includes("아케인심볼")) {
    const item = equipData["arcaneSymbol"]?.[equipName] as SymbolOption;
    return <SymbolContainer item={item} />;
  }

  if (equipName.includes("어센틱심볼")) {
    const item = equipData["authenticSymbol"]?.[equipName] as SymbolOption;
    return <SymbolContainer item={item} />;
  }

  if (equipName.includes("안드로이드")) {
    const item = equipData["android"] as AndroidEquipment;
    return <AndroidContainer item={item} />;
  }

  const item = equipData["normal"]?.[equipName] as ItemEquipment;
  return <NormalContainer item={item} />;
};

export const EquipDetailCard = ({ equipName, equipData }: DetailCardProps) => {
  return (
    <div
      className="flex flex-col min-w-80 max-w-80
     bg-slate-950/80 dark:bg-[#121212]/80 
     border border-gray-700
     rounded-lg px-5 pt-3 pb-4"
    >
      <DetailCardComponent equipData={equipData} equipName={equipName} />
    </div>
  );
};
