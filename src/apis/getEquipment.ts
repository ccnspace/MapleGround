import type { EquipmentInfo } from "@/types/Equipment";
import { apiFetcher } from "./apiFetcher";
import type { SymbolEquipmentInfo } from "@/types/SymbolEquipment";
import type { CashEquipmentInfo } from "@/types/CashEquipment";

/** 캐릭터가 장착한 장비 정보를 반환. date는 YYYY-MM-DD 형태여야 한다. */
export const getEquipmentInfo = async (nickname: string, date = "") => {
  const response = await apiFetcher<EquipmentInfo>({ url: `/equip/normal/${nickname}?date=${date}` });
  return response;
};

export const getCashEquipmentInfo = async (nickname: string, date = "") => {
  const response = await apiFetcher<CashEquipmentInfo>({ url: `/equip/cash/${nickname}?date=${date}` });
  return response;
};

export const getSymbolEquipmentInfo = async (nickname: string, date = "") => {
  const response = await apiFetcher<SymbolEquipmentInfo>({ url: `/equip/symbol/${nickname}?date=${date}` });
  return response;
};
