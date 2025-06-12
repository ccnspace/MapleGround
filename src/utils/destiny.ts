export type Boss = {
  name: string;
  type: "weekly";
  rewards: Record<string, number>; // 난이도별 대적자의 결의
  availableDifficulties: string[];
};

export type BossConfig = {
  name: string;
  difficulty: string;
  partySize: number;
  isSelected: boolean;
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
  { index: 1, name: "선택받은 세렌", difficulty: "하드", requiredTrace: 2000 },
  { index: 2, name: "감시자 칼로스", difficulty: "카오스", requiredTrace: 2500 },
  { index: 3, name: "사도 카링", difficulty: "하드", requiredTrace: 3000 },
];

export const bossList: Boss[] = [
  { name: "선택받은 세렌", type: "weekly", rewards: { 하드: 6, 익스트림: 80 }, availableDifficulties: ["하드", "익스트림"] },
  {
    name: "감시자 칼로스",
    type: "weekly",
    rewards: { 노멀: 10, 카오스: 70, 익스트림: 400 },
    availableDifficulties: ["노멀", "카오스", "익스트림"],
  },
  {
    name: "사도 카링",
    type: "weekly",
    rewards: { 노멀: 20, 하드: 160, 익스트림: 1200 },
    availableDifficulties: ["노멀", "하드", "익스트림"],
  },
  { name: "림보", type: "weekly", rewards: { 노멀: 120, 하드: 360 }, availableDifficulties: ["노멀", "하드"] },
  { name: "발드릭스", type: "weekly", rewards: { 노멀: 150, 하드: 450 }, availableDifficulties: ["노멀", "하드"] },
];

export function calculateBossTrace(config: BossConfig, boss: Boss): number {
  if (!config.isSelected) return 0;
  const base = boss.rewards[config.difficulty] ?? 0;
  const raw = Math.floor(base / config.partySize);
  return raw;
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

  // [3] 반복 누적
  while (trace < requiredTrace) {
    const currentMission = remainingMissions[currentMissionIndex];

    // 현재 미션의 보스 설정 찾기
    const currentBossConfig = currentBossConfigs.find((config) => config.name === currentMission.name);

    // 이번 주 trace 계산 전에 이전 trace로 미션 달성 여부 확인
    if (currentBossConfig) {
      const missionRequiredTrace = remainingMissions
        .slice(0, currentMissionIndex + 1)
        .reduce((sum, mission) => sum + mission.requiredTrace, 0);

      // 이전 주까지의 누적으로 미션 달성이 가능한 경우
      if (trace >= missionRequiredTrace) {
        const boss = bossList.find((b) => b.name === currentMission.name);
        if (boss) {
          // 미션 클리어 보스로 currentBossConfig를 업데이트
          const missionBossConfig = missionConfigs.find((c) => c.name === currentMission.name);
          if (missionBossConfig) {
            currentBossConfig.isSelected = true;
            currentBossConfig.difficulty = currentMission.difficulty;
            currentBossConfig.partySize = missionBossConfig.partySize;
          }
        }

        isClearWeek = true;
        // 다음 미션으로 이동
        currentMissionIndex = Math.min(currentMissionIndex + 1, remainingMissions.length - 1);
      }
    }

    // [3-2] 주간 보스
    if (isFirstWeek && startDate.getDay() !== resetWeekday) {
      trace += calculateWeeklyTotal(currentBossConfigs, bossList, isFirstWeek);
      tempRecords.push({
        currentMissionBoss: currentMission.name,
        currentMissionDifficulty: currentMission.difficulty,
        date: new Date(startDate),
        currentTrace: trace,
        isDifficultyChanged,
        isClearWeek,
      });
    }
    isFirstWeek = false;
    trace += calculateWeeklyTotal(currentBossConfigs, bossList, isFirstWeek);

    // 모든 필요 대적자의 결의 달성 시 마지막 미션 클리어 보스 설정 적용
    if (trace >= requiredTrace) {
      tempRecords.push({
        currentMissionBoss: currentMission.name,
        currentMissionDifficulty: currentMission.difficulty,
        date: new Date(date),
        currentTrace: trace,
        isDifficultyChanged,
        isClearWeek: true,
        partySize: currentBossConfig?.partySize,
      });
      break;
    }

    // 한 주 기록 추가
    tempRecords.push({
      currentMissionBoss: currentMission.name,
      currentMissionDifficulty: currentMission.difficulty,
      date: new Date(date),
      currentTrace: trace,
      isDifficultyChanged,
      isClearWeek,
      partySize: currentBossConfig?.partySize,
    });

    // 다시 원래 보스 설정으로 복구
    currentBossConfigs = bossConfigs.map((config) => ({ ...config }));
    isDifficultyChanged = false;
    isClearWeek = false;

    // [3-3] 다음 주 리셋일로 이동
    date.setDate(date.getDate() + 7);
  }

  return { liberationDate: date.toISOString().split("T")[0], liberationRecords: tempRecords };
}
