"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useShallow } from "zustand/shallow";
import { useUnionStore } from "@/stores/union";
import { useCharacterStore } from "@/stores/character";
import { useNickname } from "@/hooks/useNickname";
import { formatKoreanNumber } from "@/utils/formatKoreanNum";
import { CommonWrapper } from "@/components/Container/CommonWrapper";
import { CommonTitle } from "@/components/Container/CommonTitle";
import { LoadingContainer } from "@/components/Container/LoadingContainer";
import { UnionRaiderGrid } from "@/components/Union/UnionRaiderGrid";
import type { Union, UnionArtifact, UnionChampion } from "@/types/Union";
import championBadge1 from "@/images/c1.png";
import championBadge2 from "@/images/c2.png";
import championBadge3 from "@/images/c3.png";
import championBadge4 from "@/images/c4.png";
import championBadge5 from "@/images/c5.png";

const CHAMPION_BADGE_IMAGES = [championBadge1, championBadge2, championBadge3, championBadge4, championBadge5];

type TabType = "artifact" | "champion" | "raider";

// ── 등급 스타일 ──
const getUnionGradeBg = (grade: string) => {
  if (grade.includes("슈프림")) return "from-violet-700 via-gray-900 to-cyan-500";
  if (grade.includes("그랜드 마스터")) return "from-violet-800 via-gray-900 to-black";
  if (grade.includes("마스터")) return "from-yellow-500 via-amber-400 to-yellow-600";
  if (grade.includes("베테랑")) return "from-slate-300 via-gray-200 to-slate-400";
  if (grade.includes("노비스")) return "from-amber-700 via-orange-600 to-amber-800";
  return "from-slate-500 to-slate-400";
};

const getChampionGradeText = (grade: string) => {
  if (grade === "SSS") return "text-red-400";
  if (grade === "SS") return "text-yellow-400";
  if (grade === "S") return "text-violet-400";
  if (grade === "A") return "text-sky-400";
  if (grade === "B") return "text-emerald-400";
  return "text-slate-400";
};

const getChampionCardBorder = (grade: string) => {
  if (grade === "SSS") return "border-red-400/60";
  if (grade === "SS") return "border-yellow-400/60";
  if (grade === "S") return "border-violet-400/55";
  if (grade === "A") return "border-sky-400/55";
  if (grade === "B") return "border-emerald-400/55";
  return "border-slate-300/50 dark:border-slate-600/50";
};

const getChampionGradeStyle = (grade: string) => {
  if (grade === "SSS") return "bg-gradient-to-br from-red-500 to-rose-600 text-white";
  if (grade === "SS") return "bg-gradient-to-br from-yellow-400 to-amber-500 text-white";
  if (grade === "S") return "bg-gradient-to-br from-violet-400 to-purple-500 text-white";
  if (grade === "A") return "bg-gradient-to-br from-sky-400 to-blue-500 text-white";
  if (grade === "B") return "bg-gradient-to-br from-emerald-400 to-green-500 text-white";
  return "bg-slate-500 text-white";
};

const getUnionTextColor = (grade: string) => {
  if (grade.includes("베테랑")) return "text-gray-700";
  return "text-white";
};

const getUnionSubTextColor = (grade: string) => {
  if (grade.includes("베테랑")) return "text-gray-500";
  return "text-white/50";
};

// ── 우측 유니온 정보 패널 ──
const UnionInfoPanel = ({ union, artifact }: { union: Union; artifact: UnionArtifact | undefined }) => {
  const nickname = useNickname();
  const characterAttributes = useCharacterStore((state) => (nickname ? state.characterAttributes?.[nickname] : null));
  const championPower = characterAttributes?.stat?.final_stat?.find((s) => s.stat_name === "전투력")?.stat_value;

  return (
    <div className="flex flex-col gap-3 w-[300px] max-[600px]:w-full shrink-0">
      {/* 등급 엠블럼 카드 */}
      <div
        className={`flex flex-col items-center gap-3 py-7 px-5 rounded-2xl bg-gradient-to-br ${getUnionGradeBg(union.union_grade)}
          shadow-lg relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_60%)]" />
        <p className={`relative ${getUnionTextColor(union.union_grade)}/90 text-[11px] font-bold tracking-[0.2em] uppercase`}>
          {union.union_grade}
        </p>
        <div className="relative flex flex-col items-center">
          <p className={`${getUnionSubTextColor(union.union_grade)} text-[10px] font-semibold tracking-[0.15em]`}>TOTAL LEVEL</p>
          <p
            className={`${getUnionTextColor(
              union.union_grade
            )} font-extrabold text-5xl tracking-tight [text-shadow:_0_2px_8px_rgb(0_0_0/_0.3)]`}
          >
            {union.union_level.toLocaleString()}
          </p>
        </div>
        {championPower && (
          <div className="relative flex flex-col items-center">
            <p className={`${getUnionSubTextColor(union.union_grade)} text-[10px] font-semibold tracking-[0.15em]`}>CHAMPION POWER</p>
            <p className={`${getUnionTextColor(union.union_grade)} font-bold text-xl`}>{formatKoreanNumber(parseInt(championPower))}</p>
          </div>
        )}
        <div className="relative flex flex-col items-center">
          <p className={`${getUnionSubTextColor(union.union_grade)} text-[10px] font-semibold tracking-[0.15em]`}>ARTIFACT LEVEL</p>
          <p className={`${getUnionTextColor(union.union_grade)} font-bold text-3xl`}>{union.union_artifact_level}</p>
        </div>
      </div>

      {/* 상세 스탯 카드 */}
      <div
        className="flex flex-col bg-slate-50 dark:bg-color-950/50 backdrop-blur-sm rounded-2xl
          border border-slate-200/80 dark:border-white/5 overflow-hidden"
      >
        <StatRow label="아티팩트 EXP" value={union.union_artifact_exp.toLocaleString()} />
        <StatRow label="아티팩트 포인트" value={union.union_artifact_point.toLocaleString()} />
        {artifact && <StatRow label="잔여 AP" value={artifact.union_artifact_remain_ap.toLocaleString()} isLast />}
      </div>
    </div>
  );
};

const StatRow = ({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) => (
  <div className={`flex justify-between items-center px-4 py-3 ${!isLast ? "border-b border-slate-200/80 dark:border-white/5" : ""}`}>
    <span className="text-[13px] text-gray-500 dark:text-gray-400">{label}</span>
    <span className="font-bold text-[13px]">{value}</span>
  </div>
);

// ── 아티팩트 탭 ──
const ArtifactTab = ({ artifact }: { artifact: UnionArtifact }) => (
  <div className="flex flex-col gap-5">
    {/* 크리스탈 그리드 */}
    <div className="grid grid-cols-3 gap-3 max-[600px]:grid-cols-2">
      {artifact.union_artifact_crystal.map((crystal, i) => {
        const isValid = crystal.validity_flag === "0";
        return (
          <div
            key={i}
            className={`rounded-xl p-[1.5px] ${
              isValid
                ? "bg-gradient-to-b from-indigo-300/60 to-violet-400/55 dark:from-indigo-400/50 dark:to-violet-400/45"
                : "bg-slate-300 dark:bg-slate-700 opacity-45"
            }`}
          >
            <div
              className={`flex flex-col gap-2.5 p-3.5 rounded-[10px] h-full
              ${isValid ? "bg-slate-50 dark:bg-color-950/50" : "bg-slate-50 dark:bg-color-950/30"}`}
            >
              {/* 레벨(별) + 상태 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(crystal.level, 5) }).map((_, s) => (
                    <span key={s} className="text-cyan-300 text-[10px]">
                      &#9670;
                    </span>
                  ))}
                </div>
                {!isValid && (
                  <span className="text-[10px] text-red-500 font-semibold bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">만료</span>
                )}
              </div>

              {/* 크리스탈 이름 */}
              <p className="font-bold text-[13px] leading-tight">{crystal.name}</p>

              {/* 옵션 목록 */}
              <div className="flex flex-col gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="truncate">{crystal.crystal_option_name_1}</span>
                <span className="truncate">{crystal.crystal_option_name_2}</span>
                <span className="truncate">{crystal.crystal_option_name_3}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* 아티팩트 효과 목록 */}
    {artifact.union_artifact_effect.length > 0 && (
      <div
        className="flex flex-col bg-slate-50 dark:bg-color-950/50 backdrop-blur-sm rounded-2xl
          border border-slate-200/80 dark:border-white/5 overflow-hidden"
      >
        <div className="px-4 pt-3.5 pb-2">
          <p className="font-bold text-sm text-violet-600 dark:text-violet-400">아티팩트 효과</p>
        </div>
        {artifact.union_artifact_effect.map((effect, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-2.5 text-[13px]
              ${i < artifact.union_artifact_effect.length - 1 ? "border-b border-slate-100 dark:border-white/5" : ""}`}
          >
            <span className="font-medium">{effect.name}</span>
            <span className="font-bold text-violet-600 dark:text-violet-400 text-xs bg-violet-50 dark:bg-violet-950/30 px-2 py-0.5 rounded-full">
              Lv.{effect.level}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ── 챔피언 탭 ──
const ChampionTab = ({ champion }: { champion: UnionChampion }) => (
  <div className="flex flex-col gap-5">
    {/* 챔피언 그리드 */}
    <div className="grid grid-cols-3 gap-3 max-[600px]:grid-cols-2">
      {champion.union_champion.map((champ, i) => (
        <div
          key={i}
          className={`flex flex-col gap-2 px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-color-950/50 ${getChampionCardBorder(
            champ.champion_grade
          )}`}
        >
          {/* 등급 */}
          <div className="flex items-baseline justify-between">
            <span className={`text-base font-extrabold ${getChampionGradeText(champ.champion_grade)}`}>{champ.champion_grade}</span>
          </div>

          {/* 이름 + 직업 */}
          <div className="flex flex-col gap-0.5 items-center">
            <p className="font-bold text-[13px] leading-tight">{champ.champion_class}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{champ.champion_name}</p>
          </div>

          {/* 휘장 */}
          {champ.champion_badge_info.length > 0 && (
            <div className="flex flex-row items-end justify-center gap-1.5 mt-auto">
              {champ.champion_badge_info.map((badge, j) => {
                const badgeImage = CHAMPION_BADGE_IMAGES[j];
                if (!badgeImage) return null;
                return (
                  <div key={j} className="relative group">
                    <Image
                      src={badgeImage}
                      alt={badge.stat}
                      width={22}
                      height={30}
                      className="shrink-0 drop-shadow-sm transition-transform group-hover:-translate-y-0.5"
                    />
                    <div
                      className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20
                        opacity-0 group-hover:opacity-100 transition-opacity
                        whitespace-nowrap px-2 py-1 rounded-md
                        bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900
                        text-[11px] font-medium shadow-lg"
                    >
                      {badge.stat}
                      <span
                        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                          border-x-4 border-x-transparent
                          border-t-4 border-t-slate-900/95 dark:border-t-white/95"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>

    {/* 총 휘장 효과 */}
    {champion.champion_badge_total_info.length > 0 && (
      <div
        className="flex flex-col bg-slate-50 dark:bg-color-950/50 backdrop-blur-sm rounded-2xl
          border border-slate-200/80 dark:border-white/5 overflow-hidden"
      >
        <div className="px-4 pt-3.5 pb-2">
          <p className="font-bold text-sm text-amber-600 dark:text-amber-400">챔피언 휘장 효과</p>
        </div>
        {champion.champion_badge_total_info.map((badge, i) => (
          <div
            key={i}
            className={`flex items-center text-[13px] px-4 py-2.5
              ${i < champion.champion_badge_total_info.length - 1 ? "border-b border-slate-100 dark:border-white/5" : ""}`}
          >
            <span className="font-medium">{badge.stat}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ── 메인 컨텐츠 ──
const UnionPageContent = () => {
  const nickname = useNickname();
  const fetchCharacterAttributes = useCharacterStore((state) => state.fetchCharacterAttributes);
  const characterFetchStatus = useCharacterStore((state) => state.fetchStatus);
  const [activeTab, setActiveTab] = useState<TabType>("raider");

  const {
    fetchStatus: unionFetchStatus,
    unionData,
    fetchUnionInfo,
  } = useUnionStore(
    useShallow((state) => ({
      fetchStatus: state.fetchStatus,
      unionData: nickname ? state.unionAttributes?.[nickname] : null,
      fetchUnionInfo: state.fetchUnionInfo,
    }))
  );

  useEffect(() => {
    if (!nickname) return;
    const abortController = new AbortController();
    fetchCharacterAttributes(nickname, abortController.signal);
    fetchUnionInfo(nickname, abortController.signal);
    return () => abortController.abort();
  }, [nickname, fetchCharacterAttributes, fetchUnionInfo]);

  const union = unionData?.union;
  const artifact = unionData?.unionArtifact;
  const champion = unionData?.unionChampion;
  const fetchStatus = unionFetchStatus;

  if (characterFetchStatus !== "success" || fetchStatus === "loading" || fetchStatus === "idle") {
    return <LoadingContainer />;
  }

  return (
    <CommonWrapper>
      <div className="flex max-[600px]:pt-0.5 px-2 w-[1366px] flex-col max-[600px]:w-full max-[600px]:px-0.5 gap-5">
        <CommonTitle title="👑 유니온">
          <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">NEW</span>
        </CommonTitle>

        {fetchStatus === "error" && (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="font-bold text-sm text-slate-950/50 dark:text-white/60">유니온 정보를 불러올 수 없습니다.</p>
          </div>
        )}

        {fetchStatus === "success" && union && (
          <div className="flex flex-row gap-5 max-[600px]:flex-col">
            {/* 좌측: 탭 컨텐츠 */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {/* 탭 버튼 */}
              <div
                className="flex gap-1 p-1 rounded-xl bg-slate-200 dark:bg-color-950/50
                  border border-slate-200 dark:border-white/5 self-start"
              >
                <button
                  onClick={() => setActiveTab("raider")}
                  className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                    activeTab === "raider"
                      ? "bg-white dark:bg-color-800 text-black dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  공격대
                </button>
                <button
                  onClick={() => setActiveTab("artifact")}
                  className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                    activeTab === "artifact"
                      ? "bg-white dark:bg-color-800 text-black dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  아티팩트
                </button>
                <button
                  onClick={() => setActiveTab("champion")}
                  className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                    activeTab === "champion"
                      ? "bg-white dark:bg-color-800 text-black dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  챔피언 전장
                </button>
              </div>

              {activeTab === "champion" && champion && <ChampionTab champion={champion} />}
              {activeTab === "artifact" && artifact && <ArtifactTab artifact={artifact} />}
              {activeTab === "raider" && unionData?.unionRaider && <UnionRaiderGrid raider={unionData.unionRaider} />}
            </div>

            {/* 우측: 유니온 정보 패널 */}
            <UnionInfoPanel union={union} artifact={artifact} />
          </div>
        )}
      </div>
    </CommonWrapper>
  );
};

export default function UnionPage() {
  return (
    <Suspense fallback={<LoadingContainer />}>
      <UnionPageContent />
    </Suspense>
  );
}
