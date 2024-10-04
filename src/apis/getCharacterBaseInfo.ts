import type { CharacterBase } from "@/types/Character";
import { apiFetcher } from "./apiFetcher";

export const getCharacterBaseInfo = async (nickname: string) => {
  const response = await apiFetcher<CharacterBase>(`/user/${nickname}`);
  return response;
};
