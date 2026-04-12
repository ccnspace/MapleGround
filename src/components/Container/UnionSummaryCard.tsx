"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useUnionStore } from "@/stores/union";
import { useNickname } from "@/hooks/useNickname";
import { ContainerWrapper } from "./ContainerWrapper";
import Link from "next/link";

const getChampionGradeStyle = (grade: string) => {
  if (grade === "SSS") return "bg-gradient-to-br from-red-500 to-rose-600 text-white";
  if (grade === "SS") return "bg-gradient-to-br from-yellow-400 to-amber-500 text-white";
  if (grade === "S") return "bg-gradient-to-br from-violet-400 to-purple-500 text-white";
  if (grade === "A") return "bg-gradient-to-br from-sky-400 to-blue-500 text-white";
  if (grade === "B") return "bg-gradient-to-br from-emerald-400 to-green-500 text-white";
  return "bg-slate-500 text-white";
};

const getGradeBg = (grade: string) => {
  if (grade.includes("슈프림")) return "bg-gradient-to-r from-violet-700 via-gray-900 to-cyan-500 text-white";
  if (grade.includes("그랜드 마스터")) return "bg-gradient-to-r from-violet-800 via-gray-900 to-black text-white";
  if (grade.includes("마스터")) return "bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-white";
  if (grade.includes("베테랑")) return "bg-gradient-to-r from-slate-300 via-gray-200 to-slate-400 text-gray-700";
  if (grade.includes("노비스")) return "bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 text-white";
  return "bg-slate-400 text-white";
};

export const UnionSummaryCard = () => {
  const nickname = useNickname();

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
  const champion = unionData?.unionChampion;

  return (
    <ContainerWrapper className="!min-w-0" innerClassName="h-[410px] overflow-y-auto">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="flex font-extrabold text-base px-2 pb-0.5 pt-0.5 border-l-4 border-l-purple-400/80 max-[600px]:text-sm">
            유니온 정보
          </p>
          {nickname && (
            <Link
              href={`/main/union?name=${encodeURIComponent(nickname)}`}
              className="text-xs font-semibold text-purple-500 dark:text-purple-400 hover:underline underline-offset-2"
            >
              상세보기
            </Link>
          )}
        </div>

        {fetchStatus === "success" && union ? (
          <div className="flex flex-col gap-3">
            {/* 등급 + 레벨 */}
            <div className="flex items-center gap-3 px-3 py-4 rounded-lg bg-slate-200/50 dark:bg-white/5">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-md ${getGradeBg(union.union_grade)}`}>
                {union.union_grade}
              </span>
              <span className="font-extrabold text-2xl">Lv.{union.union_level.toLocaleString()}</span>
            </div>

            {/* 스탯 행들 */}
            <div className="flex flex-col text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-300 dark:border-white/10">
                <span className="text-gray-500 dark:text-gray-400">아티팩트 레벨</span>
                <span className="font-bold">{union.union_artifact_level}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-300 dark:border-white/10">
                <span className="text-gray-500 dark:text-gray-400">아티팩트 EXP</span>
                <span className="font-bold">{union.union_artifact_exp.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-300 dark:border-white/10">
                <span className="text-gray-500 dark:text-gray-400">아티팩트 포인트</span>
                <span className="font-bold">{union.union_artifact_point.toLocaleString()}</span>
              </div>
            </div>

            {/* 챔피언 목록 */}
            {champion && champion.union_champion.length > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                <p className="font-bold text-sm px-1 text-gray-600 dark:text-gray-300">챔피언</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {champion.union_champion.map((champ, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg
                        bg-slate-200/60 dark:bg-white/5"
                    >
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${getChampionGradeStyle(champ.champion_grade)}`}>
                        {champ.champion_grade}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm truncate">{champ.champion_name}</span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{champ.champion_class}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-6">
            <p className="font-bold text-sm text-slate-950/50 dark:text-white/60">
              {fetchStatus === "error" ? "유니온 정보를 불러올 수 없습니다." : "불러오는 중..."}
            </p>
          </div>
        )}
      </div>
    </ContainerWrapper>
  );
};
