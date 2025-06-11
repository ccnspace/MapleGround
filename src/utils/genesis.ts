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

export type Mission = {
  name: string;
  requiredTrace: number;
};

export const missionList: Mission[] = [
  { name: "반 레온", requiredTrace: 500 },
  { name: "아카이럼", requiredTrace: 500 },
  { name: "매그너스", requiredTrace: 500 },
  { name: "스우", requiredTrace: 1000 },
  { name: "데미안", requiredTrace: 1000 },
  { name: "윌", requiredTrace: 1000 },
  { name: "루시드", requiredTrace: 1000 },
  { name: "진 힐라", requiredTrace: 1000 },
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

/**
 * 매주 목요일 기준으로 획득량을 누적하며 해방 날짜 계산
 */
export function estimateLiberationDateWithResetDay(
  startDateStr: string,
  bossConfigs: BossConfig[],
  bossList: Boss[],
  requiredTrace: number,
  baseTrace: number = 0,
  resetWeekday: number = 4 // 0=일요일, 4=목요일
): string {
  if (!startDateStr) return "계산 불가";

  const startDate = new Date(startDateStr);
  let trace = baseTrace;
  const date = new Date(startDate);
  // let monthsPassed = 0;

  // [1] 시작일에 클리어한 것으로 간주
  // if (includeStartDate) {
  //   trace += weeklyAmount;
  // }

  // [2] 다음 리셋일(목요일) 찾기
  while (date.getDay() !== resetWeekday) {
    date.setDate(date.getDate() + 1);
  }

  // const lastMonth = date.getMonth(); // 리셋 날짜 기준으로 체크
  const monthSeen = new Set<number>();
  let isFirstWeek = true;

  // [3] 반복 누적
  while (trace < requiredTrace) {
    // [3-1] 월간 보스: 그 달의 첫 번째 리셋일에만 포함
    const month = date.getMonth();
    if (!monthSeen.has(month)) {
      trace += calculateMonthlyTotal(bossConfigs, bossList, isFirstWeek);
      monthSeen.add(month);
    }

    // [3-2] 주간 보스
    if (isFirstWeek && startDate.getDay() !== 4) {
      trace += calculateWeeklyTotal(bossConfigs, bossList, isFirstWeek);
      isFirstWeek = false;
    }
    trace += calculateWeeklyTotal(bossConfigs, bossList, isFirstWeek);

    console.log(date, trace, requiredTrace);

    if (trace >= requiredTrace) break;

    // [3-3] 다음 주 리셋일로 이동
    date.setDate(date.getDate() + 7);
  }

  return date.toISOString().split("T")[0];
}
