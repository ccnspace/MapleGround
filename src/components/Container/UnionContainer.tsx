"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useTheme } from "next-themes";
import { useUnionStore } from "@/stores/union";
import { useNickname } from "@/hooks/useNickname";
import { Spinner } from "../svg/Spinner";
import { ContainerWrapper } from "./ContainerWrapper";

const getChampionGradeColor = (grade: string) => {
  if (grade === "마스터") return "text-yellow-500 bg-yellow-400/15";
  if (grade === "그랜드마스터") return "text-red-500 bg-red-400/15";
  return "text-gray-500 bg-gray-400/15";
};

const getUnionGradeColor = (grade: string) => {
  if (grade.includes("그랜드 마스터")) return "bg-gradient-to-r from-yellow-500/80 to-red-500/80 text-white";
  if (grade.includes("마스터")) return "bg-yellow-500/80 text-white";
  if (grade.includes("베테랑")) return "bg-purple-500/80 text-white";
  if (grade.includes("노비스")) return "bg-sky-500/80 text-white";
  return "bg-slate-400/80 text-white";
};

export const UnionContainer = () => {
  const nickname = useNickname();
  const { theme } = useTheme();
  const spinnerColor = theme === "dark" ? "white" : "#616161";

  const { fetchStatus, unionData, fetchUnionInfo } = useUnionStore(
    useShallow((state) => ({
      fetchStatus: state.fetchStatus,
      unionData: nickname ? state.unionAttributes?.[nickname] : null,
      fetchUnionInfo: state.fetchUnionInfo,
    }))
  );

  useEffect(() => {
    if (!nickname) return;
    const abortController = new AbortController();
    fetchUnionInfo(nickname, abortController.signal);
    return () => abortController.abort();
  }, [nickname, fetchUnionInfo]);

  const union = unionData?.union;
  const artifact = unionData?.unionArtifact;
  const champion = unionData?.unionChampion;
  const isLoading = fetchStatus === "loading" || fetchStatus === "idle";

  return (
    <ContainerWrapper className="!min-w-0" innerClassName="h-[410px] overflow-y-auto">
      <div className="flex justify-between mb-2">
        <p className="flex font-extrabold text-base px-2 pb-0.5 pt-0.5 border-l-4 border-l-purple-400/80">
          유니온 정보
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <Spinner width="2.5em" height="2.5em" color={spinnerColor} />
        </div>
      )}

      {fetchStatus === "success" && union && (
        <div className="flex flex-col gap-3">
          {/* 유니온 기본 정보 */}
          <div className="flex items-center gap-2 px-2 py-2 rounded-md bg-slate-300/40 dark:bg-white/5">
            <span className="font-extrabold text-lg">Lv.{union.union_level}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getUnionGradeColor(union.union_grade)}`}>
              {union.union_grade}
            </span>
          </div>

          {/* 아티팩트 섹션 */}
          {artifact && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 px-2">
                <p className="font-bold text-sm border-l-4 border-l-cyan-400/80 pl-2">아티팩트</p>
                <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                  Lv.{union.union_artifact_level}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  잔여 AP: {artifact.union_artifact_remain_ap}
                </span>
              </div>

              {/* 아티팩트 효과 */}
              {artifact.union_artifact_effect.length > 0 && (
                <div className="flex flex-col gap-1 px-2">
                  {artifact.union_artifact_effect.map((effect, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs px-2 py-1 rounded
                        bg-slate-200/60 dark:bg-white/5"
                    >
                      <span className="font-medium">{effect.name}</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">Lv.{effect.level}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 아티팩트 크리스탈 */}
              {artifact.union_artifact_crystal.length > 0 && (
                <div className="flex flex-col gap-1 px-2 mt-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">크리스탈</p>
                  {artifact.union_artifact_crystal.map((crystal, i) => (
                    <div
                      key={i}
                      className={`flex flex-col gap-0.5 text-xs px-2 py-1.5 rounded
                        ${crystal.validity_flag === "0" ? "bg-slate-200/60 dark:bg-white/5" : "bg-slate-200/30 dark:bg-white/3 opacity-50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{crystal.name}</span>
                        <span className="text-gray-500">Lv.{crystal.level}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 text-[11px] text-gray-600 dark:text-gray-400">
                        <span>{crystal.crystal_option_name_1}</span>
                        <span>·</span>
                        <span>{crystal.crystal_option_name_2}</span>
                        <span>·</span>
                        <span>{crystal.crystal_option_name_3}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 챔피언 섹션 */}
          {champion && champion.union_champion.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="font-bold text-sm border-l-4 border-l-amber-400/80 pl-2 px-2">챔피언</p>
              <div className="flex flex-col gap-1 px-2">
                {champion.union_champion.map((champ, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs px-2 py-1.5 rounded
                      bg-slate-200/60 dark:bg-white/5"
                  >
                    <span className="font-semibold">{champ.champion_name}</span>
                    <span className="text-gray-500">{champ.champion_class}</span>
                    <span className={`ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded ${getChampionGradeColor(champ.champion_grade)}`}>
                      {champ.champion_grade}
                    </span>
                  </div>
                ))}
              </div>

              {/* 총 휘장 효과 */}
              {champion.champion_badge_total_info.length > 0 && (
                <div className="flex flex-col gap-0.5 px-3 mt-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">휘장 효과</p>
                  <div className="flex flex-wrap gap-1">
                    {champion.champion_badge_total_info.map((badge, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium px-1.5 py-0.5 rounded
                          bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      >
                        {badge.stat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {fetchStatus === "error" && (
        <div className="flex items-center justify-center h-full">
          <p className="font-bold text-sm text-slate-950/50 dark:text-white/60">유니온 정보를 불러올 수 없습니다.</p>
        </div>
      )}
    </ContainerWrapper>
  );
};
