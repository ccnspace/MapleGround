import { apiFetcher } from "./apiFetcher";
import type { CharacterStat } from "@/types/CharacterStat";

/** 캐릭터 전투력을 오래된 날짜부터 최근까지 반환하는 함수. date는 YYYY-MM-DD 형태여야 한다. */
export const getCharacterCombatPower = async (nickname: string, signal?: AbortSignal) => {
  const response = await apiFetcher<Record<string, CharacterStat>>(`/user/stat/${nickname}`, signal);

  let resultObject: Record<string, number> = {};
  for (const [key, value] of Object.entries(response)) {
    if (!value.final_stat.length) continue;

    const combatPower = value.final_stat.find((item) => item.stat_name === "전투력")?.stat_value;
    if (combatPower) {
      resultObject = { ...resultObject, [key]: parseInt(combatPower) };
    }
  }
  return resultObject;
};
