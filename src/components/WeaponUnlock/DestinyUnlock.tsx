import { useEffect, useMemo, useState } from "react";
import {
  bossList,
  calculateWeeklyTotal,
  estimateLiberationDateWithResetDay,
  getRequiredTrace,
  getRequiredTraceRange,
  TIER1_LAST_STEP,
  TIER2_LAST_STEP,
  MissionBossConfig,
  missionList,
  type BossConfig,
} from "@/utils/destiny";
import { DestinyBossSelector } from "./DestinyBossSelector";
import { DestinyMissionBossSelector } from "./DestinyMissionBossSelector";
import { DestinyUnlockData } from "@/utils/localStorage";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNickname } from "@/hooks/useNickname";

const DEFAULT_BOSS_CONFIG = bossList.map((boss) => ({
  name: boss.name,
  difficulty: boss.availableDifficulties[0],
  partySize: 1,
  isSelected: false,
  firstWeekCleared: false,
}));

const DEFAULT_MISSION_CONFIG = missionList.map((mission) => ({
  name: mission.name,
  partySize: 1,
}));

export const DestinyUnlock = ({ onSave }: { onSave: (params: DestinyUnlockData) => void }) => {
  const nickname = useNickname() ?? "";
  const { value: destinyUnlockFromLocalStorage } = useLocalStorage("destinyUnlock");
  const destinyUnlockInfo = destinyUnlockFromLocalStorage?.[nickname];

  const [missionStep, setMissionStep] = useState(destinyUnlockInfo?.missionStep || 1);
  const [startDate, setStartDate] = useState(destinyUnlockInfo?.startDate || "");
  const [baseTrace, setBaseTrace] = useState(destinyUnlockInfo?.baseTrace || 0);
  const [configs, setConfigs] = useState<BossConfig[]>(() => {
    const persisted = destinyUnlockInfo?.bossConfig;
    if (!persisted) return DEFAULT_BOSS_CONFIG;
    return persisted.map((c) => {
      const cap = bossList.find((b) => b.name === c.name)?.maxPartySize ?? 6;
      return { ...c, partySize: Math.min(c.partySize, cap) };
    });
  });
  const [missionConfigs, setMissionConfigs] = useState<MissionBossConfig[]>(destinyUnlockInfo?.missionConfig || DEFAULT_MISSION_CONFIG);

  const isAllUnselected = configs.every((config) => !config.isSelected);
  const baseWeeklyTotal = calculateWeeklyTotal(configs, bossList, false);
  const tier1RequiredFromStep = getRequiredTraceRange(missionStep, TIER1_LAST_STEP);
  const tier2RequiredFromStep = getRequiredTrace(missionStep);
  const tier1TotalRequired = getRequiredTraceRange(1, TIER1_LAST_STEP);
  const tier2TotalRequired = getRequiredTraceRange(TIER1_LAST_STEP + 1, TIER2_LAST_STEP);
  const isTier1Done = missionStep > TIER1_LAST_STEP;

  const { tier1Date, tier2Date, liberationRecords } = useMemo(() => {
    if (!startDate || isAllUnselected) {
      return { tier1Date: "정보 없음", tier2Date: "정보 없음", liberationRecords: [] };
    }

    const tier1 = isTier1Done
      ? null
      : estimateLiberationDateWithResetDay({
          startDateStr: startDate,
          bossConfigs: configs,
          missionConfigs,
          requiredTrace: tier1RequiredFromStep,
          bossList,
          missionStep,
          baseTrace,
        });

    const tier2 = estimateLiberationDateWithResetDay({
      startDateStr: startDate,
      bossConfigs: configs,
      missionConfigs,
      requiredTrace: tier2RequiredFromStep,
      bossList,
      missionStep,
      baseTrace,
    });

    return {
      tier1Date: tier1 ? tier1.liberationDate : "이미 완료",
      tier2Date: tier2.liberationDate,
      liberationRecords: tier2.liberationRecords,
    };
  }, [
    startDate,
    isAllUnselected,
    configs,
    missionConfigs,
    tier1RequiredFromStep,
    tier2RequiredFromStep,
    missionStep,
    baseTrace,
    isTier1Done,
  ]);

  const updateConfig = (updated: BossConfig) => {
    setConfigs((prev) => prev.map((c) => (c.name === updated.name ? updated : c)));
  };

  const updateMissionConfig = (updated: MissionBossConfig) => {
    setMissionConfigs((prev) => prev.map((c) => (c.name === updated.name ? updated : c)));
  };

  const toggleAllBosses = (checked: boolean) => {
    setConfigs((prev) =>
      prev.map((config) => ({
        ...config,
        isSelected: checked,
      }))
    );
  };

  const isAllSelected = configs.every((config) => config.isSelected);

  useEffect(() => {
    onSave({
      startDate,
      baseTrace,
      missionStep,
      bossConfig: configs,
      missionConfig: missionConfigs,
    });
  }, [startDate, baseTrace, missionStep, configs, missionConfigs]);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        className="flex sticky top-0 flex-col gap-2
        border-2 border-sky-400
        bg-slate-300/95 dark:bg-black/70 rounded-lg pt-2.5 pb-3 px-3 max-[600px]:px-2 z-10"
      >
        <span className="text-md max-[600px]:text-sm font-bold text-gray-700 dark:text-gray-200">🗓️ 예상 해방 날짜</span>
        <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-2 max-[600px]:gap-1.5">
          <div
            className="flex flex-col items-center justify-center gap-1 px-2 py-2 max-[600px]:py-1.5 rounded-md bg-white/70 dark:bg-white/10
            max-[600px]:flex-row max-[600px]:justify-between"
          >
            <span className="text-[12px] max-[600px]:text-xs font-bold tracking-wide text-sky-700 dark:text-sky-300">1차 해방</span>
            <span className="text-lg max-[600px]:text-base font-extrabold tabular-nums text-slate-900 dark:text-white">{tier1Date}</span>
          </div>
          <div
            className="flex flex-col items-center justify-center gap-1 px-2 py-2 max-[600px]:py-1.5 rounded-md bg-white/70 dark:bg-white/10
            max-[600px]:flex-row max-[600px]:justify-between"
          >
            <span className="text-[12px] max-[600px]:text-xs font-bold tracking-wide text-sky-700 dark:text-sky-300">2차 해방</span>
            <span className="text-lg max-[600px]:text-base font-extrabold tabular-nums text-slate-900 dark:text-white">{tier2Date}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <p className="border-l-2 border-slate-500 dark:border-slate-200 pl-2 text-sm max-[600px]:text-xs font-bold text-gray-700 dark:text-gray-300">
            주간 클리어 보스
          </p>
          <div className="grid grid-cols-3 max-[600px]:grid-cols-1 gap-4 max-[600px]:gap-2">
            <div className="flex flex-col items-center max-[600px]:items-start gap-2 max-[600px]:gap-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">현재 미션 단계</label>
              <select
                value={missionStep}
                onChange={(e) => setMissionStep(Number(e.target.value))}
                className="block w-full h-[28px] max-[600px]:h-[32px] px-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                text-gray-900 dark:text-gray-100 shadow-sm text-sm max-[600px]:text-xs
                focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                {missionList.map((mission, idx) => (
                  <option key={mission.name} value={idx + 1}>
                    {`${idx + 1}단계 - ${mission.name}`}
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
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">보유 대적자의 결의</label>
              <input
                type="text"
                value={baseTrace}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d+$/.test(value)) {
                    const numValue = parseInt(value) > 0 ? parseInt(value) : 0;
                    setBaseTrace(numValue);
                  }
                }}
                className="block w-full h-[28px] max-[600px]:h-[32px] px-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                text-gray-900 dark:text-gray-100 shadow-sm text-sm max-[600px]:text-xs
                focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* 보스 선택 헤더 - 모바일에서 숨김 */}
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
          <div className="w-24">미션 시작 전 클리어</div>
          <div className="ml-auto">획득량</div>
        </div>

        {/* 모바일용 전체 선택 */}
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
        <div className="overflow-y-auto max-h-[240px] flex gap-2 flex-col">
          {bossList.map((boss) => {
            const config = configs.find((c) => c.name === boss.name)!;
            return <DestinyBossSelector key={boss.name} boss={boss} config={config} onChange={updateConfig} />;
          })}
        </div>
        <p className="mt-3 border-l-2 border-slate-500 dark:border-slate-200 pl-2 text-sm max-[600px]:text-xs font-bold text-gray-700 dark:text-gray-300">
          미션 클리어 당시 파티 인원
        </p>
        <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-2">
          {missionList.map((mission) => {
            const missionConfig = missionConfigs.find((c) => c.name === mission.name)!;
            return (
              <DestinyMissionBossSelector
                key={mission.name}
                bossName={`${mission.name}`}
                config={missionConfig}
                onChange={updateMissionConfig}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-1 p-4 bg-slate-400/30 dark:bg-gray-700/50 rounded-lg">
        <div className="pt-1 space-y-2 text-xs opacity-85">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700 dark:text-gray-400">주간 총 획득량</span>
            <span className="font-bold text-gray-700 dark:text-gray-300">{baseWeeklyTotal}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700 dark:text-gray-400">1차 해방 필요 대적자의 결의</span>
            <span className="font-bold text-gray-700 dark:text-gray-300">{isTier1Done ? "이미 완료" : tier1TotalRequired}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700 dark:text-gray-400">2차 해방 필요 대적자의 결의</span>
            <span className="font-bold text-gray-700 dark:text-gray-300">{tier2TotalRequired}</span>
          </div>
        </div>
      </div>

      <div className="mt-1 p-4 bg-slate-400/30 dark:bg-gray-700/50 rounded-lg">
        <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 pb-3">
          <span className="text-sm font-bold text-black dark:text-gray-200">예상 클리어 기록</span>
        </div>
        <div className="flex flex-col pt-1 px-2 gap-1.5 text-xs max-h-[200px] overflow-y-auto">
          {liberationRecords?.map((record) => (
            <div key={record.date.toISOString()} className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center">
                <span className={`${record.isClearWeek ? "text-blue-700 dark:text-blue-400 font-bold" : "text-slate-500"}`}>
                  {record.date.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric", weekday: "short" })}
                </span>
                <span className="text-slate-500 dark:text-gray-300">{record.currentTrace}</span>
              </div>
              <div className="flex justify-between items-center">
                {record.isClearWeek && (
                  <span className="font-bold text-black dark:text-gray-300">{`↪ 결전, ${record.currentMissionBoss} 미션 클리어`}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
