import type { CharacterBasic } from "@/types/Character";
import { apiFetcher } from "./apiFetcher";

export const getCharacterBaseInfo = async (nickname: string, date = "") => {
  const response = await apiFetcher<CharacterBasic>(
    `/user/${nickname}?date=${date}`
  );
  return response;
};
