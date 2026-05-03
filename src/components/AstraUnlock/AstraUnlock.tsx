import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import fierceIcon from "@/images/fierce.png";
import erionIcon from "@/images/erion.png";
import {
  ASTRA_MAX_TRACE,
  astraBossList,
  astraDailyQuests,
  astraQuestStages,
  calculateAstraWeeklyTotal,
  estimateAstraLiberationDates,
  type AstraBossConfig,
  type AstraDailyQuestId,
} from "@/utils/astra";
import { AstraBossSelector } from "./AstraBossSelector";
import { AstraUnlockData } from "@/utils/localStorage";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNickname } from "@/hooks/useNickname";

const DEFAULT_BOSS_CONFIG: AstraBossConfig[] = astraBossList.map((boss) => ({
  name: boss.name,
  difficulty: boss.availableDifficulties[0],
  partySize: 1,
  isSelected: false,
  firstWeekCleared: false,
}));

const DEFAULT_DAILY_ID = astraDailyQuests[0].id;

const STAGE_LABEL: Record<1 | 2 | 3, string> = {
  1: "1단계",
  2: "2단계",
  3: "3단계",
};

export const AstraUnlock = ({ onSave }: { onSave: (params: AstraUnlockData) => void }) => {
  const nickname = useNickname() ?? "";
  const { value: astraUnlockFromLocalStorage } = useLocalStorage("astraUnlock");
  const astraUnlockInfo = astraUnlockFromLocalStorage?.[nickname];

  const [startDate, setStartDate] = useState(astraUnlockInfo?.startDate || "");
  const [baseTrace, setBaseTrace] = useState(astraUnlockInfo?.baseTrace || 0);
  const [baseFragment, setBaseFragment] = useState(astraUnlockInfo?.baseFragment || 0);
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(astraUnlockInfo?.currentStage || 1);
  const [dailyQuestId, setDailyQuestId] = useState<AstraDailyQuestId>(astraUnlockInfo?.dailyQuestId || DEFAULT_DAILY_ID);
  const [isAuctionMode, setIsAuctionMode] = useState(astraUnlockInfo?.isAuctionMode ?? false);
  const [configs, setConfigs] = useState<AstraBossConfig[]>(astraUnlockInfo?.bossConfig || DEFAULT_BOSS_CONFIG);

  const dailyQuest = astraDailyQuests.find((q) => q.id === dailyQuestId) ?? astraDailyQuests[0];
  const dailyFragmentsPerDay = dailyQuest.fragmentsPerDay;

  const isAllUnselected = configs.every((c) => !c.isSelected);
  const baseWeeklyTotal = calculateAstraWeeklyTotal(configs, astraBossList, false);

  const remainingStages = astraQuestStages.slice(currentStage - 1);
  const totalRequiredTrace = remainingStages.reduce((s, q) => s + q.requiredTrace, 0);
  const totalRequiredFragments = remainingStages.reduce((s, q) => s + q.requiredFragments, 0);

  const { questDates, records } = useMemo(() => {
    if (!startDate) return { questDates: ["정보 없음", "정보 없음", "정보 없음"], records: [] };
    if (isAllUnselected && baseTrace < totalRequiredTrace) {
      return { questDates: ["정보 없음", "정보 없음", "정보 없음"], records: [] };
    }
    return estimateAstraLiberationDates({
      startDateStr: startDate,
      bossConfigs: configs,
      bosses: astraBossList,
      baseTrace,
      baseFragment,
      dailyFragmentsPerDay,
      currentStage,
      isAuctionMode,
    });
  }, [startDate, isAllUnselected, configs, baseTrace, baseFragment, dailyFragmentsPerDay, currentStage, totalRequiredTrace, isAuctionMode]);

  const updateConfig = (updated: AstraBossConfig) => {
    setConfigs((prev) =>
      prev.map((c) => {
        if (c.name !== updated.name) return c;
        const boss = astraBossList.find((b) => b.name === updated.name);
        const cap = boss?.maxPartySize ?? 6;
        return { ...updated, partySize: Math.min(updated.partySize, cap) };
      })
    );
  };

  const toggleAllBosses = (checked: boolean) => {
    setConfigs((prev) => prev.map((c) => ({ ...c, isSelected: checked })));
  };

  const isAllSelected = configs.every((c) => c.isSelected);

  useEffect(() => {
    onSave({
      startDate,
      baseTrace,
      baseFragment,
      currentStage,
      dailyQuestId,
      isAuctionMode,
      bossConfig: configs,
    });
  }, [startDate, baseTrace, baseFragment, currentStage, dailyQuestId, isAuctionMode, configs]);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        className="flex sticky top-0 flex-col gap-2
        border-2 border-purple-400
        bg-slate-300/95 dark:bg-black/70 rounded-lg pt-2.5 pb-3 px-3 max-[600px]:px-2 z-10"
      >
        <span className="text-md max-[600px]:text-sm font-bold text-gray-700 dark:text-gray-200">🗓️ 예상 해방 날짜</span>
        <div className="grid grid-cols-3 max-[600px]:grid-cols-1 gap-2 max-[600px]:gap-1.5">
          {([1, 2, 3] as const).map((idx) => {
            const value = questDates[idx - 1];
            const isUnreachable = value === "도달 불가";
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 max-[600px]:py-1.5 rounded-md bg-white/70 dark:bg-white/10
                max-[600px]:flex-row max-[600px]:justify-between"
              >
                <span className="text-[11px] max-[600px]:text-xs font-bold tracking-wide text-purple-700 dark:text-purple-300">
                  {STAGE_LABEL[idx]}
                </span>
                <span
                  className={`text-lg max-[600px]:text-base font-extrabold tabular-nums ${
                    isUnreachable ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
                  }`}
                >
                  {value}
                </span>
              </div>
            );
          })}
        </div>
        {questDates.includes("도달 불가") && (
          <p className="text-[13px] max-[600px]:text-xs leading-snug text-rose-700 dark:text-rose-300 px-1 pt-1">
            {"⚠️ "}
            <span className="font-bold">도달 불가</span>
            {" : 10년 이내 클리어 불가. 보스/일일 퀘스트 설정을 조정해 주세요."}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="border-l-2 border-slate-500 dark:border-slate-200 pl-2 text-sm max-[600px]:text-xs font-bold text-gray-700 dark:text-gray-300">
          현재 진행 정보
        </p>
        <div className="grid grid-cols-3 max-[600px]:grid-cols-1 gap-4 max-[600px]:gap-2">
          <div className="flex flex-col items-center max-[600px]:items-start gap-2 max-[600px]:gap-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">현재 진행 단계</label>
            <select
              value={currentStage}
              onChange={(e) => setCurrentStage(Number(e.target.value) as 1 | 2 | 3)}
              className="block w-full h-[28px] max-[600px]:h-[32px] px-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100 shadow-sm text-sm max-[600px]:text-xs
              focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              {astraQuestStages.map((stage) => (
                <option key={stage.index} value={stage.index}>
                  {`${stage.index}단계 (격전 ${stage.requiredTrace} / 조각 ${stage.requiredFragments})`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col items-center max-[600px]:items-start gap-2 max-[600px]:gap-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">시작 날짜</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full h-[28px] max-[600px]:h-[32px] px-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100 shadow-sm text-sm max-[600px]:text-xs
              focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>

          <div className="flex flex-col items-center max-[600px]:items-start gap-2 max-[600px]:gap-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">일일 퀘스트</label>
            <select
              value={dailyQuestId}
              onChange={(e) => setDailyQuestId(e.target.value as AstraDailyQuestId)}
              disabled={isAuctionMode}
              className="block w-full h-[28px] max-[600px]:h-[32px] px-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100 shadow-sm text-sm max-[600px]:text-xs
              focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {astraDailyQuests.map((q) => (
                <option key={q.id} value={q.id}>
                  {`${q.name} (조각 ${q.fragmentsPerDay}/일)`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end max-[600px]:justify-center mt-1">
          <div className="relative group">
            <button
              type="button"
              onClick={() => setIsAuctionMode((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                isAuctionMode
                  ? "bg-indigo-600/80 text-white shadow"
                  : "bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              <Image src={erionIcon} alt="에리온의 조각" width={14} height={14} unoptimized style={{ imageRendering: "pixelated" }} />
              {isAuctionMode ? "에리온의 조각 직접 수급 ON" : "에리온의 조각 직접 수급"}
            </button>
            <div
              role="tooltip"
              className="pointer-events-none absolute right-0 top-full mt-2 w-80 max-[600px]:w-64
                px-3.5 py-2.5 rounded-md shadow-lg z-20
                bg-gray-900/95 text-white dark:bg-slate-100 dark:text-gray-900
                text-[13px] max-[600px]:text-xs leading-relaxed font-medium
                opacity-0 translate-y-1 transition-all duration-150
                group-hover:opacity-100 group-hover:translate-y-0"
            >
              <span
                className="absolute -top-1 right-4 w-2 h-2 rotate-45
                  bg-gray-900/95 dark:bg-slate-100"
              />
              에리온의 조각을 경매장에서 모두 수급한다고 가정하고, 격전의 흔적 누적량으로만 해방 날짜를 계산합니다.
              <br />
              <span className="opacity-70">일일 퀘스트와 보유 조각 입력은 비활성화됩니다.</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-4 max-[600px]:gap-2 mt-1">
          <div className="flex flex-col items-center max-[600px]:items-start gap-2 max-[600px]:gap-1">
            <label className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300">
              <Image src={fierceIcon} alt="격전의 흔적" width={16} height={16} unoptimized style={{ imageRendering: "pixelated" }} />
              {`보유 격전의 흔적 (최대 ${ASTRA_MAX_TRACE})`}
            </label>
            <input
              type="text"
              value={baseTrace}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d+$/.test(value)) {
                  const parsed = parseInt(value) > 0 ? parseInt(value) : 0;
                  setBaseTrace(Math.min(parsed, ASTRA_MAX_TRACE));
                }
              }}
              className="block w-full h-[28px] max-[600px]:h-[32px] px-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100 shadow-sm text-sm max-[600px]:text-xs
              focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              placeholder="0"
            />
          </div>

          <div className="flex flex-col items-center max-[600px]:items-start gap-2 max-[600px]:gap-1">
            <label className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300">
              <Image src={erionIcon} alt="에리온의 조각" width={16} height={16} unoptimized style={{ imageRendering: "pixelated" }} />
              보유 에리온의 조각
            </label>
            <input
              type="text"
              value={isAuctionMode ? "" : baseFragment}
              disabled={isAuctionMode}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d+$/.test(value)) {
                  const numValue = parseInt(value) > 0 ? parseInt(value) : 0;
                  setBaseFragment(numValue);
                }
              }}
              placeholder={isAuctionMode ? "직접 수급 모드" : "0"}
              className="block w-full h-[28px] max-[600px]:h-[32px] px-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100 shadow-sm text-sm max-[600px]:text-xs
              focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400
              disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="mt-2 border-l-2 border-slate-500 dark:border-slate-200 pl-2 text-sm max-[600px]:text-xs font-bold text-gray-700 dark:text-gray-300">
          주간 클리어 보스
        </p>
        <div className="flex font-bold items-center gap-2 px-2 text-[11px] text-gray-500 dark:text-gray-400 max-[600px]:hidden">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={(e) => toggleAllBosses(e.target.checked)}
            className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 rounded
              border-gray-300 dark:border-gray-600
              focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-1
              bg-white dark:bg-gray-700"
          />
          <div className="min-w-[64px]">보스명</div>
          <div className="w-20">난이도</div>
          <div className="w-12">인원</div>
          <div className="w-24">이번 주 클리어</div>
          <div className="ml-auto">획득량</div>
        </div>

        <div className="hidden max-[600px]:flex items-center gap-2 px-2 text-xs text-gray-500 dark:text-gray-400">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={(e) => toggleAllBosses(e.target.checked)}
            className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 rounded
              border-gray-300 dark:border-gray-600
              focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-1
              bg-white dark:bg-gray-700"
          />
          <span className="font-bold">전체 선택</span>
        </div>

        <div className="overflow-y-auto max-h-[280px] flex gap-2 flex-col">
          {astraBossList.map((boss) => {
            const config = configs.find((c) => c.name === boss.name)!;
            return <AstraBossSelector key={boss.name} boss={boss} config={config} onChange={updateConfig} />;
          })}
        </div>
      </div>

      <div className="mt-1 p-4 bg-slate-400/30 dark:bg-gray-700/50 rounded-lg">
        <div className="pt-1 space-y-2 text-xs opacity-85">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 font-bold text-gray-700 dark:text-gray-400">
              <Image src={fierceIcon} alt="격전의 흔적" width={14} height={14} unoptimized style={{ imageRendering: "pixelated" }} />
              주간 격전의 흔적 획득량
            </span>
            <span className="font-bold text-gray-700 dark:text-gray-300">{baseWeeklyTotal}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 font-bold text-gray-700 dark:text-gray-400">
              <Image src={erionIcon} alt="에리온의 조각" width={14} height={14} unoptimized style={{ imageRendering: "pixelated" }} />
              일일 에리온의 조각 획득량
            </span>
            <span className="font-bold text-gray-700 dark:text-gray-300">{isAuctionMode ? "직접 수급" : dailyFragmentsPerDay}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700 dark:text-gray-400">남은 단계 총 필요 격전의 흔적</span>
            <span className="font-bold text-gray-700 dark:text-gray-300">{totalRequiredTrace}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700 dark:text-gray-400">남은 단계 총 필요 에리온의 조각</span>
            <span className="font-bold text-gray-700 dark:text-gray-300">
              {isAuctionMode ? `${totalRequiredFragments} (직접 수급)` : totalRequiredFragments}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-1 p-4 bg-slate-400/30 dark:bg-gray-700/50 rounded-lg">
        <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 pb-3">
          <span className="text-sm font-bold text-black dark:text-gray-200">예상 클리어 기록</span>
        </div>
        <div className="flex flex-col pt-1 px-2 gap-1.5 text-xs max-h-[220px] overflow-y-auto">
          {records.map((record, idx) => (
            <div key={`${record.date.toISOString()}-${idx}`} className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center">
                <span className={record.isStageCleared ? "text-purple-700 dark:text-purple-400 font-bold" : "text-slate-500"}>
                  {record.date.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric", weekday: "short" })}
                </span>
                <span className="flex items-center gap-2 text-slate-500 dark:text-gray-300">
                  <span className="flex items-center gap-0.5">
                    <Image src={fierceIcon} alt="격전의 흔적" width={12} height={12} unoptimized style={{ imageRendering: "pixelated" }} />
                    {record.totalTrace}
                  </span>
                  {!isAuctionMode && (
                    <span className="flex items-center gap-0.5">
                      <Image
                        src={erionIcon}
                        alt="에리온의 조각"
                        width={12}
                        height={12}
                        unoptimized
                        style={{ imageRendering: "pixelated" }}
                      />
                      {record.totalFragments}
                    </span>
                  )}
                </span>
              </div>
              {record.isStageCleared && record.clearedStageIndex && (
                <div className="flex justify-between items-center">
                  <span className="font-bold text-black dark:text-gray-300">{`↪ ${record.clearedStageIndex}단계 퀘스트 클리어`}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
