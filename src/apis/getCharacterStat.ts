import { apiFetcher } from "./apiFetcher";
import type { CharacterStat } from "@/types/CharacterStat";

/** 캐릭터 스탯 정보를 반환하는 함수. date는 YYYY-MM-DD 형태여야 한다. */
export const getCharacterStat = async (nickname: string, date = "") => {
  const response = await apiFetcher<CharacterStat>(
    `/detail/${nickname}?date=${date}`
  );
  return response;
};
