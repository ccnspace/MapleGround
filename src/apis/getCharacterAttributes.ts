import type { CharacterBasic } from "@/types/Character";
import { apiFetcher } from "./apiFetcher";
import type { Ability } from "@/types/Ability";
import type { AndroidEquipment } from "@/types/AndroidEquipment";
import type { CashEquipmentInfo } from "@/types/CashEquipment";
import type { EquipmentInfo } from "@/types/Equipment";
import type { SymbolEquipmentInfo } from "@/types/SymbolEquipment";
import type { PetEquipment } from "@/types/PetEquipment";
import type { CharacterStat } from "@/types/CharacterStat";
import type { SetEffect } from "@/types/SetEffect";

/** API 응답으로 받은 캐릭터에 필요한 모든 정보 */
export type CharacterAttributes = {
  ability: Ability;
  androidEquip: AndroidEquipment;
  basic: CharacterBasic;
  cashEquip: CashEquipmentInfo;
  normalEquip: EquipmentInfo;
  symbolEquip: SymbolEquipmentInfo;
  petEquip: PetEquipment;
  stat: CharacterStat;
  fetchDate: string;
  setEffect: SetEffect;
};

/** 캐릭터에 필요한 모든 정보를 요청하여 반환하는 함수 */
export const getCharacterAttributes = async (nickname: string, date = "", signal?: AbortSignal) => {
  const response = await apiFetcher<CharacterAttributes>(`/user/all/${nickname}?date=${date}`, signal);
  return response;
};
