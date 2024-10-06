import type { AllEquipmentsInfo, EquipmentInfo } from "@/types/Equipment";
import { apiFetcher } from "./apiFetcher";
import type { SymbolEquipmentInfo } from "@/types/SymbolEquipment";
import type { CashEquipmentInfo } from "@/types/CashEquipment";

/** 캐릭터가 장착한 장비 정보를 반환. date는 YYYY-MM-DD 형태여야 한다. */
export const getEquipmentInfo = async (nickname: string, date = "") => {
  const response = await apiFetcher<EquipmentInfo>(
    `/equip/normal/${nickname}?date=${date}`
  );
  return response;
};

export const getCashEquipmentInfo = async (nickname: string, date = "") => {
  const response = await apiFetcher<CashEquipmentInfo>(
    `/equip/cash/${nickname}?date=${date}`
  );
  return response;
};

export const getSymbolEquipmentInfo = async (nickname: string, date = "") => {
  const response = await apiFetcher<SymbolEquipmentInfo>(
    `/equip/symbol/${nickname}?date=${date}`
  );
  return response;
};

/** 일반 장비, 캐시 장비, 심볼 정보를 한번에 반환하는 함수 */
export const getAllEquipmentsInfo = async (nickname: string, date = "") => {
  const response = await apiFetcher<AllEquipmentsInfo>(
    `/equip/all/${nickname}?date=${date}`
  );
  return response;
};
