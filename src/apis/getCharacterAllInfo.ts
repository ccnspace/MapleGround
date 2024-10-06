import type { CharacterBase } from "@/types/Character";
import { apiFetcher } from "./apiFetcher";
import type { Ability } from "@/types/Ability";
import type { AndroidEquipment } from "@/types/AndroidEquipment";
import type { CashEquipmentInfo } from "@/types/CashEquipment";
import type { EquipmentInfo } from "@/types/Equipment";
import type { SymbolEquipmentInfo } from "@/types/SymbolEquipment";
import type { PetEquipment } from "@/types/PetEquipment";
import type { CharacterStat } from "@/types/CharacterStat";

export type CharacterAllInfo = {
  ability: Ability;
  androidEquip: AndroidEquipment;
  basic: CharacterBase;
  cashEquip: CashEquipmentInfo;
  normalEquip: EquipmentInfo;
  symbolEquip: SymbolEquipmentInfo;
  petEquip: PetEquipment;
  stat: CharacterStat;
};

/** 캐릭터에 필요한 모든 정보를 요청하여 반환하는 함수 */
export const getCharacterAllInfo = async (nickname: string, date = "") => {
  const response = await apiFetcher<CharacterAllInfo>(
    `/user/all/${nickname}?date=${date}`
  );
  return response;
};
