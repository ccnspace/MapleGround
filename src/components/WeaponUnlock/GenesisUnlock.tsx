import { useEffect, useMemo, useState } from "react";
import {
  bossList,
  calculateMonthlyTotal,
  calculateWeeklyTotal,
  estimateLiberationDateWithResetDay,
  getRequiredTrace,
  MissionBossConfig,
  missionList,
  type BossConfig,
} from "@/utils/genesis";
import { GenesisBossSelector } from "./GenesisBossSelector";
import { GenesisMissionBossSelector } from "./GenesisMissionBossSelector";
import { GenesisUnlockData } from "@/utils/localStorage";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNickname } from "@/hooks/useNickname";

const DEFAULT_BOSS_CONFIG = bossList.map((boss) => ({
  name: boss.name,
  difficulty: boss.availableDifficulties[0],
  partySize: 1,
  isSelected: false,
  isGenesisPass: false,
  firstWeekCleared: false,
}));

const DEFAULT_MISSION_CONFIG = missionList.map((mission) => ({
  name: mission.name,
  partySize: 1,
}));

export const GenesisUnlock = ({ onSave }: { onSave: (params: GenesisUnlockData) => void }) => {
  const nickname = useNickname() ?? "";
  const { value: genesisUnlockFromLocalStorage } = useLocalStorage("genesisUnlock");
  const genesisUnlockInfo = genesisUnlockFromLocalStorage?.[nickname];

  const [missionStep, setMissionStep] = useState(genesisUnlockInfo?.missionStep || 1);
  const [startDate, setStartDate] = useState(genesisUnlockInfo?.startDate || "");
  const [baseTrace, setBaseTrace] = useState(genesisUnlockInfo?.baseTrace || 0);
  const [configs, setConfigs] = useState<BossConfig[]>(genesisUnlockInfo?.bossConfig || DEFAULT_BOSS_CONFIG);
  const [missionConfigs, setMissionConfigs] = useState<MissionBossConfig[]>(genesisUnlockInfo?.missionConfig || DEFAULT_MISSION_CONFIG);

  const isAllUnselected = configs.every((config) => !config.isSelected);
  const baseWeeklyTotal = calculateWeeklyTotal(configs, bossList, false);
  const baseMonthlyTotal = calculateMonthlyTotal(configs, bossList, false);
  const required = getRequiredTrace(missionStep);
  const { liberationDate, liberationRecords } = useMemo(() => {
    if (!startDate || isAllUnselected) return { liberationDate: "정보 없음", records: [] };

    const { liberationDate, liberationRecords } = estimateLiberationDateWithResetDay({
      startDateStr: startDate,
      bossConfigs: configs,
      missionConfigs: missionConfigs,
      requiredTrace: required,
      bossList,
      missionStep,
      baseTrace,
    });

    return { liberationDate, liberationRecords };
  }, [startDate, isAllUnselected, configs, required, missionStep, baseTrace, missionConfigs]);

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

  const toggleGenesisPass = (checked: boolean) => {
    setConfigs((prev) =>
      prev.map((config) => ({
        ...config,
        isGenesisPass: config.isSelected ? checked : false,
      }))
    );
  };

  const isAllSelected = configs.every((config) => config.isSelected);
  const isAllSelectedGenesisPass = configs.filter((c) => c.isSelected).every((config) => config.isGenesisPass);

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
        className="flex sticky top-0 justify-between items-center
        border-2 border-rose-400
        bg-slate-300/95 dark:bg-black/70 rounded-lg pt-2 pb-2 px-3 max-[600px]:px-2 z-10"
      >
        <span className="text-md max-[600px]:text-sm font-bold text-gray-700 dark:text-gray-200">🗓️ 예상 해방 날짜</span>
        <span className="font-bold text-slate-900 dark:text-white text-base max-[600px]:text-sm">{liberationDate}</span>
      </div>
      <div className="flex flex-col gap-2">
        <p className="border-l-2 border-slate-500 dark:border-slate-200 pl-2 text-sm max-[600px]:text-xs font-bold text-gray-700 dark:text-gray-300">
          주간 클리어 보스
        </p>
        <div className="grid grid-cols-3 max-[600px]:grid-cols-1 gap-4 max-[600px]:gap-2">
          <div className="flex flex-col items-center max-[600px]:items-start space-y-2 max-[600px]:space-y-1">
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

          <div className="flex flex-col items-center max-[600px]:items-start space-y-2 max-[600px]:space-y-1">
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

          <div className="flex flex-col items-center max-[600px]:items-start space-y-2 max-[600px]:space-y-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">보유 어둠의 흔적</label>
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

        <div className="flex items-center px-2 pt-1 pb-2 rounded-md">
          <label className="relative flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAllSelectedGenesisPass}
              onChange={(e) => toggleGenesisPass(e.target.checked)}
              disabled={isAllUnselected}
              className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 rounded 
                border-gray-300 dark:border-gray-600 
                focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-1 
                disabled:opacity-50 
                bg-white dark:bg-gray-700"
            />
            <span className="ml-2 text-sm max-[600px]:text-xs text-gray-900 dark:text-gray-400">제네시스 패스 (선택된 보스에만 적용)</span>
          </label>
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
            return <GenesisBossSelector key={boss.name} boss={boss} config={config} onChange={updateConfig} />;
          })}
        </div>

        <p className="mt-3 border-l-2 border-slate-500 dark:border-slate-200 pl-2 text-sm max-[600px]:text-xs font-bold text-gray-700 dark:text-gray-300">
          미션 클리어 당시 파티 인원
        </p>
        <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-2 overflow-y-auto max-h-[120px]">
          {missionList.map((mission) => {
            const missionConfig = missionConfigs.find((c) => c.name === mission.name)!;
            return (
              <GenesisMissionBossSelector
                key={mission.name}
                bossName={`${mission.name} (${mission.difficulty})`}
                config={missionConfig}
                onChange={updateMissionConfig}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-3 p-4 bg-slate-400/30 dark:bg-gray-700/50 rounded-lg space-y-3">
        <div className="pt-1 space-y-2 text-xs opacity-85">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700 dark:text-gray-400">주간 총 획득량</span>
            <span className="font-bold text-gray-700 dark:text-gray-300">{baseWeeklyTotal}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700 dark:text-gray-400">월간 총 획득량</span>
            <span className="font-bold text-gray-700 dark:text-gray-300">{baseMonthlyTotal}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700 dark:text-gray-400">총 필요 어둠의 흔적</span>
            <span className="font-bold text-gray-700 dark:text-gray-300">{required}</span>
          </div>
        </div>
      </div>

      <div className="mt-1 p-4 bg-slate-400/30 dark:bg-gray-700/50 rounded-lg">
        <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 pb-3">
          <span className="text-sm font-bold text-black dark:text-gray-200">예상 클리어 기록</span>
        </div>
        <div className="flex flex-col pt-1 px-2 gap-1.5 text-xs max-h-[200px] overflow-y-auto">
          {liberationRecords?.map((record, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center">
                <span className={`${record.isClearWeek ? "text-blue-700 dark:text-blue-400 font-bold" : "text-slate-500"}`}>
                  {record.date.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric", weekday: "short" })}
                </span>
                <span className="text-slate-500 dark:text-gray-300">{record.currentTrace}</span>
              </div>
              <div className="flex justify-between items-center">
                {record.isClearWeek && (
                  <span className="font-bold text-black dark:text-gray-300">
                    {`↪ ${record.currentMissionBoss} ${record.currentMissionDifficulty} 미션 ${record.partySize}인 클리어`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
