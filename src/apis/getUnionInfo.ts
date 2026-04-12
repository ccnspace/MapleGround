import type { Union, UnionArtifact, UnionChampion } from "@/types/Union";
import { apiFetcher } from "./apiFetcher";

export type UnionAttributes = {
  union: Union;
  unionArtifact: UnionArtifact;
  unionChampion: UnionChampion;
};

/** 유니온 관련 모든 정보를 요청하여 반환하는 함수 */
export const getUnionInfo = async (nickname: string, date = "", signal?: AbortSignal) => {
  const response = await apiFetcher<UnionAttributes>(`/user/union/${nickname}?date=${date}`, signal);
  return response;
};
