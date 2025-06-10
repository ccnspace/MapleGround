import {
  bossList,
  calculateBossTrace,
  calculateMonthlyTotal,
  calculateWeeklyTotal,
  estimateLiberationDate,
  estimateLiberationDateWithResetDay,
  getRequiredTrace,
  missionList,
  type Boss,
  type BossConfig,
} from "@/utils/genesis";
import { ContainerWrapper } from "./ContainerWrapper";
import { useState } from "react";

type Props = {
  boss: Boss;
  config: BossConfig;
  onChange: (newConfig: BossConfig) => void;
};

const BossSelector: React.FC<Props> = ({ boss, config, onChange }) => {
  const trace = calculateBossTrace(config, boss);

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300/70 dark:hover:bg-white/10 transition-colors text-xs">
      <input
        type="checkbox"
        checked={config.isSelected}
        onChange={(e) => onChange({ ...config, isSelected: e.target.checked })}
        className="w-3 h-3 text-indigo-600 dark:text-indigo-400 rounded 
          border-gray-300 dark:border-gray-600 
          focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-1
          bg-white dark:bg-gray-700"
      />
      <p className="min-w-[64px] font-medium text-gray-900 dark:text-gray-100">{boss.name}</p>
      <select
        value={config.difficulty}
        onChange={(e) => onChange({ ...config, difficulty: e.target.value })}
        className="h-6 w-20 px-1 rounded border-gray-300 dark:border-gray-600 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
          focus:border-indigo-500 dark:focus:border-indigo-400 
          focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-1"
      >
        {boss.availableDifficulties.map((diff) => (
          <option key={diff} value={diff}>
            {diff}
          </option>
        ))}
      </select>
      <select
        value={config.partySize}
        onChange={(e) => onChange({ ...config, partySize: Number(e.target.value) })}
        className="h-6 w-12 px-1 rounded border-gray-300 dark:border-gray-600 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
          focus:border-indigo-500 dark:focus:border-indigo-400 
          focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-1"
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <option key={n} value={n}>
            {n}인
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={config.firstWeekCleared}
          onChange={(e) => onChange({ ...config, firstWeekCleared: e.target.checked })}
          className="w-3 h-3 text-indigo-600 dark:text-indigo-400 rounded 
            border-gray-300 dark:border-gray-600 
            focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-1
            bg-white dark:bg-gray-700"
        />
        <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">클리어</span>
      </div>
      <div className="ml-auto flex items-center gap-1 text-gray-900 dark:text-gray-100">
        <span className="font-medium text-indigo-600 dark:text-indigo-300">{trace.toFixed(2)}</span>
      </div>
    </div>
  );
};

export const WeaponUnlockContainer = () => {
  const [missionStep, setMissionStep] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [baseTrace, setBaseTrace] = useState(0);
  const [configs, setConfigs] = useState<BossConfig[]>(
    bossList.map((boss) => ({
      name: boss.name,
      difficulty: boss.availableDifficulties[0],
      partySize: 1,
      isSelected: false,
      isGenesisPass: false,
      firstWeekCleared: false,
    }))
  );

  const isAllUnselected = configs.every((config) => !config.isSelected);
  const baseWeeklyTotal = calculateWeeklyTotal(configs, bossList, false);
  const baseMonthlyTotal = calculateMonthlyTotal(configs, bossList, false);
  const required = getRequiredTrace(missionStep);
  const liberationDate =
    startDate && !isAllUnselected ? estimateLiberationDateWithResetDay(startDate, configs, bossList, required, baseTrace) : "정보 없음";

  const updateConfig = (updated: BossConfig) => {
    setConfigs((prev) => prev.map((c) => (c.name === updated.name ? updated : c)));
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

  return (
    <ContainerWrapper className="expContent_container h-[460px] overflow-y-auto">
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <p className="flex font-extrabold text-base mb-2 px-2 pb-0.5 pt-0.5 border-l-4 border-l-purple-400/80 text-gray-900 dark:text-gray-100">
            무기 해방 날짜 계산
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">현재 미션 단계</label>
                <select
                  value={missionStep}
                  onChange={(e) => setMissionStep(Number(e.target.value))}
                  className="block w-full h-[24px] px-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-gray-100 shadow-sm 
                    focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm"
                >
                  {missionList.map((mission, idx) => (
                    <option key={mission.name} value={idx + 1}>
                      {`${idx + 1}단계 - ${mission.name}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">시작 날짜</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full h-[24px] px-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-gray-100 shadow-sm 
                    focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm"
                />
              </div>

              <div className="flex flex-col items-center space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">보유 어둠의 흔적</label>
                <input
                  type="text"
                  value={baseTrace}
                  onChange={(e) => {
                    if (isNaN(Number(e.target.value))) return;
                    setBaseTrace(Number(e.target.value));
                  }}
                  className="block w-full h-[24px] px-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-gray-100 shadow-sm 
                    focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center px-1">
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
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">제네시스 패스 (선택된 보스에만 적용)</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex font-bold items-center gap-2 px-2 text-[11px] text-gray-500 dark:text-gray-400">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => toggleAllBosses(e.target.checked)}
                className="w-3 h-3 text-indigo-600 dark:text-indigo-400 rounded 
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

            {bossList.map((boss) => {
              const config = configs.find((c) => c.name === boss.name)!;
              return <BossSelector key={boss.name} boss={boss} config={config} onChange={updateConfig} />;
            })}
          </div>

          <div className="mt-6 p-4 bg-slate-300/50 dark:bg-gray-700/50 rounded-lg space-y-3">
            <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 pb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">예상 해방 날짜</span>
              <span className="font-bold text-slate-900 dark:text-white text-base">{liberationDate}</span>
            </div>
            <div className="pt-1 space-y-2 text-xs opacity-85">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">주간 총 획득량</span>
                <span className="text-gray-700 dark:text-gray-300">{baseWeeklyTotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">월간 총 획득량</span>
                <span className="text-gray-700 dark:text-gray-300">{baseMonthlyTotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">필요 어둠의 흔적</span>
                <span className="text-gray-700 dark:text-gray-300">{required}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContainerWrapper>
  );
};
