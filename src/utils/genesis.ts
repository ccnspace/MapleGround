export type Boss = {
  name: string;
  type: "weekly" | "monthly";
  rewards: Record<string, number>; // 난이도별 어둠의 흔적
  availableDifficulties: string[];
};

export type BossConfig = {
  name: string;
  difficulty: string;
  partySize: number;
  isSelected: boolean;
  isGenesisPass: boolean;
  firstWeekCleared: boolean;
};

export type MissionBossConfig = {
  name: string;
  partySize: number;
};

export type Mission = {
  index: number;
  name: string;
  difficulty: string;
  requiredTrace: number;
};

export const missionList: Mission[] = [
  { index: 1, name: "반 레온", difficulty: "하드", requiredTrace: 500 },
  { index: 2, name: "아카이럼", difficulty: "하드", requiredTrace: 500 },
  { index: 3, name: "매그너스", difficulty: "하드", requiredTrace: 500 },
  { index: 4, name: "스우", difficulty: "하드", requiredTrace: 1000 },
  { index: 5, name: "데미안", difficulty: "하드", requiredTrace: 1000 },
  { index: 6, name: "윌", difficulty: "하드", requiredTrace: 1000 },
  { index: 7, name: "루시드", difficulty: "하드", requiredTrace: 1000 },
  { index: 8, name: "진 힐라", difficulty: "하드", requiredTrace: 1000 },
];

export const bossList: Boss[] = [
  { name: "스우", type: "weekly", rewards: { 노멀: 10, 하드: 50 }, availableDifficulties: ["하드", "노멀"] },
  { name: "데미안", type: "weekly", rewards: { 노멀: 10, 하드: 50 }, availableDifficulties: ["하드", "노멀"] },
  { name: "루시드", type: "weekly", rewards: { 이지: 15, 노멀: 20, 하드: 65 }, availableDifficulties: ["하드", "노멀", "이지"] },
  { name: "윌", type: "weekly", rewards: { 이지: 15, 노멀: 25, 하드: 75 }, availableDifficulties: ["하드", "노멀", "이지"] },
  { name: "더스크", type: "weekly", rewards: { 노멀: 20, 카오스: 65 }, availableDifficulties: ["카오스", "노멀"] },
  { name: "듄켈", type: "weekly", rewards: { 노멀: 25, 하드: 75 }, availableDifficulties: ["하드", "노멀"] },
  { name: "진 힐라", type: "weekly", rewards: { 노멀: 45, 하드: 90 }, availableDifficulties: ["하드", "노멀"] },
  { name: "검은 마법사", type: "monthly", rewards: { 하드: 600 }, availableDifficulties: ["하드"] },
];

export function calculateBossTrace(config: BossConfig, boss: Boss): number {
  if (!config.isSelected) return 0;
  const base = boss.rewards[config.difficulty] ?? 0;
  const raw = Math.floor(base / config.partySize);
  return config.isGenesisPass ? raw * 3 : raw;
}

export function calculateWeeklyTotal(configs: BossConfig[], bossList: Boss[], isFirstWeek: boolean): number {
  return configs.reduce((sum, config) => {
    const boss = bossList.find((b) => b.name === config.name);
    if (!boss || boss.type !== "weekly") return sum;

    const base = calculateBossTrace(config, boss);

    // 첫 주일 때만 체크박스 고려
    const shouldInclude = isFirstWeek ? !config.firstWeekCleared : true;

    return shouldInclude ? sum + base : sum;
  }, 0);
}

export function calculateMonthlyTotal(configs: BossConfig[], bossList: Boss[], isFirstWeek: boolean): number {
  return configs.reduce((sum, config) => {
    const boss = bossList.find((b) => b.name === config.name);
    if (!boss || boss.type !== "monthly") return sum;

    const base = calculateBossTrace(config, boss);

    // 첫 주일 때만 체크박스 고려
    const shouldInclude = isFirstWeek ? !config.firstWeekCleared : true;
    return shouldInclude ? sum + base : sum;
  }, 0);
}

export function getRequiredTrace(missionStep: number): number {
  return missionList.slice(missionStep - 1).reduce((a, b) => a + b.requiredTrace, 0);
}

export function estimateLiberationDate(startDateStr: string, weeklyAmount: number, monthlyAmount: number, requiredTrace: number): string {
  const startDate = new Date(startDateStr);
  let currentTrace = 0;
  const currentDate = new Date(startDate);

  while (currentTrace < requiredTrace) {
    currentTrace += weeklyAmount;
    if (currentDate.getDate() === 1) {
      currentTrace += monthlyAmount;
    }
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return currentDate.toISOString().split("T")[0];
}

type LiberationRecord = {
  currentMissionBoss: string;
  currentMissionDifficulty: string;
  currentTrace: number;
  date: Date;
  isClearWeek: boolean;
  isDifficultyChanged: boolean;
  partySize?: number;
};

/**
 * 매주 목요일 기준으로 획득량을 누적하며 해방 날짜 계산
 */
export function estimateLiberationDateWithResetDay(params: {
  startDateStr: string;
  bossConfigs: BossConfig[];
  missionConfigs: MissionBossConfig[];
  bossList: Boss[];
  requiredTrace: number;
  missionStep: number;
  baseTrace: number;
  resetWeekday?: number;
}): {
  liberationDate: string;
  liberationRecords: LiberationRecord[];
} {
  const { startDateStr, bossConfigs, missionConfigs, bossList, requiredTrace, missionStep, baseTrace, resetWeekday = 4 } = params;
  if (!startDateStr) return { liberationDate: "계산 불가", liberationRecords: [] };

  const tempRecords: LiberationRecord[] = [];
  const startDate = new Date(startDateStr);
  let trace = baseTrace;
  const date = new Date(startDate);

  // [1] 현재 도전 중인 미션과 이후 미션들의 정보
  const remainingMissions = missionList.slice(missionStep - 1);
  let currentMissionIndex = 0;

  // [2] 다음 리셋일(목요일) 찾기
  while (date.getDay() !== resetWeekday) {
    date.setDate(date.getDate() + 1);
  }

  let isFirstWeek = true;
  let isClearWeek = false;
  let isDifficultyChanged = false;

  // 각 미션별 보스 설정을 복사하여 관리
  let currentBossConfigs = bossConfigs.map((config) => ({ ...config }));

  const monthSeen = new Set<number>();

  const getMissionRequiredTrace = (missionIndex: number) => {
    return remainingMissions.slice(0, missionIndex + 1).reduce((sum, mission) => sum + mission.requiredTrace, 0);
  };

  // [3] 반복 누적
  while (trace < requiredTrace) {
    const currentMission = remainingMissions[currentMissionIndex];

    // 현재 미션의 보스 설정 찾기
    const currentMissionBossConfig = currentBossConfigs.find((config) => config.name === currentMission.name);

    // // [3-2] 처음 주이고 목요일 전일 때는 클리어 처리 위함
    // [3-1] 월간 보스: 그 달의 첫 번째 리셋일에만 포함
    const month = date.getMonth();
    if (!monthSeen.has(month)) {
      trace += calculateMonthlyTotal(bossConfigs, bossList, isFirstWeek);
      monthSeen.add(month);
    }
    if (isFirstWeek && startDate.getDay() !== resetWeekday) {
      trace += calculateWeeklyTotal(currentBossConfigs, bossList, isFirstWeek);
    }
    isFirstWeek = false;

    const missionRequiredTrace = getMissionRequiredTrace(currentMissionIndex);

    // 누적된 수치만큼 미션을 여러 번 깰 수 있는지 확인한다.
    while (trace >= getMissionRequiredTrace(currentMissionIndex)) {
      // isClearWeek = true;
      tempRecords.push({
        currentMissionBoss: remainingMissions[currentMissionIndex].name,
        currentMissionDifficulty: remainingMissions[currentMissionIndex].difficulty,
        date: new Date(date),
        currentTrace: trace,
        isDifficultyChanged,
        isClearWeek: trace >= getMissionRequiredTrace(currentMissionIndex),
        partySize: missionConfigs.find((config) => config.name === remainingMissions[currentMissionIndex].name)?.partySize,
      });

      currentMissionIndex = Math.min(currentMissionIndex + 1, remainingMissions.length - 1);

      if (currentMissionIndex === remainingMissions.length - 1) {
        break;
      }
    }

    // trace += calculateWeeklyTotal(currentBossConfigs, bossList, isFirstWeek);
    const tempTrace = trace;
    // 주간 수치 누적

    // 이번 주 trace 계산 전에 이전 trace로 미션 달성 여부 확인
    if (currentMissionBossConfig?.name === currentMission.name) {
      const beforeTrace = trace;
      const missionBossConfig = missionConfigs.find((c) => c.name === currentMission.name);

      const tempCurrentConfigs = currentBossConfigs.map((config) => ({ ...config }));
      const tempCurrentMissionBossConfig = tempCurrentConfigs.find((config) => config.name === currentMission.name);
      if (tempCurrentMissionBossConfig && missionBossConfig) {
        tempCurrentMissionBossConfig.difficulty = currentMission.difficulty;
        tempCurrentMissionBossConfig.partySize = missionBossConfig.partySize;
      }
      const afterTrace = calculateWeeklyTotal(tempCurrentConfigs, bossList, isFirstWeek);

      if (beforeTrace + afterTrace >= missionRequiredTrace) {
        const boss = bossList.find((b) => b.name === currentMission.name);
        if (boss) {
          // 미션 클리어 보스로 currentBossConfig를 업데이트
          const missionBossConfig = missionConfigs.find((c) => c.name === currentMission.name);
          // console.log("missionBossConfig : ", missionBossConfig);
          if (missionBossConfig) {
            currentMissionBossConfig.isSelected = true;
            currentMissionBossConfig.difficulty = currentMission.difficulty;
            currentMissionBossConfig.partySize = missionBossConfig.partySize;
          }
        }
      }
    }
    // [3-2] 주간 보스 누적
    trace += calculateWeeklyTotal(currentBossConfigs, bossList, isFirstWeek);

    // console.log("ease : ", calculateWeeklyTotal(currentBossConfigs, bossList, isFirstWeek));

    // 한 주 기록 추가
    if (!tempRecords.find((record) => record.currentMissionBoss === remainingMissions[currentMissionIndex].name && record.isClearWeek)) {
      tempRecords.push({
        currentMissionBoss: remainingMissions[currentMissionIndex].name,
        currentMissionDifficulty: remainingMissions[currentMissionIndex].difficulty,
        date: new Date(date),
        currentTrace: trace,
        isDifficultyChanged,
        isClearWeek: trace >= getMissionRequiredTrace(currentMissionIndex),
        partySize: missionConfigs[currentMission.index - 1]?.partySize,
      });
    }
    if (trace >= getMissionRequiredTrace(currentMissionIndex)) {
      currentMissionIndex = Math.min(currentMissionIndex + 1, remainingMissions.length - 1);
    }

    // 다시 원래 보스 설정으로 복구
    currentBossConfigs = bossConfigs.map((config) => ({ ...config }));
    isDifficultyChanged = false;
    isClearWeek = false;

    // [3-3] 다음 주 리셋일로 이동
    if (trace >= requiredTrace) break;
    date.setDate(date.getDate() + 7);
  }

  return { liberationDate: date.toISOString().split("T")[0], liberationRecords: tempRecords };
}
