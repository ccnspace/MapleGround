export type AstraBoss = {
  name: string;
  rewards: Record<string, number>;
  availableDifficulties: string[];
  maxPartySize: 3 | 6;
};

export type AstraBossConfig = {
  name: string;
  difficulty: string;
  partySize: number;
  isSelected: boolean;
  firstWeekCleared: boolean;
};

export type AstraDailyQuestId =
  | "cernium"
  | "arcus"
  | "odium"
  | "shangri-la"
  | "arteria"
  | "carcion"
  | "talahart"
  | "geardrock";

export type AstraDailyQuest = {
  id: AstraDailyQuestId;
  name: string;
  fragmentsPerDay: number;
};

export type AstraQuestStage = {
  index: 1 | 2 | 3;
  requiredTrace: number;
  requiredFragments: number;
};

export const astraBossList: AstraBoss[] = [
  {
    name: "선택받은 세렌",
    rewards: { 노멀: 6, 하드: 15, 익스트림: 180 },
    availableDifficulties: ["노멀", "하드", "익스트림"],
    maxPartySize: 6,
  },
  {
    name: "감시자 칼로스",
    rewards: { 이지: 6, 노멀: 30, 카오스: 100, 익스트림: 500 },
    availableDifficulties: ["이지", "노멀", "카오스", "익스트림"],
    maxPartySize: 6,
  },
  {
    name: "최초의 대적자",
    rewards: { 이지: 10, 노멀: 40, 하드: 180, 익스트림: 540 },
    availableDifficulties: ["이지", "노멀", "하드", "익스트림"],
    maxPartySize: 3,
  },
  {
    name: "카링",
    rewards: { 이지: 20, 노멀: 80, 하드: 240, 익스트림: 1440 },
    availableDifficulties: ["이지", "노멀", "하드", "익스트림"],
    maxPartySize: 6,
  },
  {
    name: "찬란한 흉성",
    rewards: { 노멀: 60, 하드: 240 },
    availableDifficulties: ["노멀", "하드"],
    maxPartySize: 3,
  },
  {
    name: "림보",
    rewards: { 노멀: 80, 하드: 240 },
    availableDifficulties: ["노멀", "하드"],
    maxPartySize: 3,
  },
  {
    name: "발드릭스",
    rewards: { 노멀: 80, 하드: 240 },
    availableDifficulties: ["노멀", "하드"],
    maxPartySize: 3,
  },
  {
    name: "유피테르",
    rewards: { 노멀: 210, 하드: 630 },
    availableDifficulties: ["노멀", "하드"],
    maxPartySize: 3,
  },
];

export const astraDailyQuests: AstraDailyQuest[] = [
  { id: "cernium", name: "세르니움", fragmentsPerDay: 1 },
  { id: "arcus", name: "아르크스", fragmentsPerDay: 3 },
  { id: "odium", name: "오디움", fragmentsPerDay: 6 },
  { id: "shangri-la", name: "도원경", fragmentsPerDay: 10 },
  { id: "arteria", name: "아르테리아", fragmentsPerDay: 15 },
  { id: "carcion", name: "카르시온", fragmentsPerDay: 25 },
  { id: "talahart", name: "탈라하트", fragmentsPerDay: 45 },
  { id: "geardrock", name: "기어드락", fragmentsPerDay: 65 },
];

export const ASTRA_MAX_TRACE = 1000;

export const astraQuestStages: AstraQuestStage[] = [
  { index: 1, requiredTrace: 600, requiredFragments: 3000 },
  { index: 2, requiredTrace: 600, requiredFragments: 3000 },
  { index: 3, requiredTrace: 800, requiredFragments: 4000 },
];

export function calculateAstraBossTrace(config: AstraBossConfig, boss: AstraBoss): number {
  if (!config.isSelected) return 0;
  const base = boss.rewards[config.difficulty] ?? 0;
  return Math.floor(base / config.partySize);
}

export function calculateAstraWeeklyTotal(configs: AstraBossConfig[], bosses: AstraBoss[], isFirstWeek: boolean): number {
  return configs.reduce((sum, config) => {
    const boss = bosses.find((b) => b.name === config.name);
    if (!boss) return sum;
    const reward = calculateAstraBossTrace(config, boss);
    const shouldInclude = isFirstWeek ? !config.firstWeekCleared : true;
    return shouldInclude ? sum + reward : sum;
  }, 0);
}

export type AstraRecord = {
  date: Date;
  totalTrace: number;
  totalFragments: number;
  isStageCleared: boolean;
  clearedStageIndex?: 1 | 2 | 3;
};

const MAX_DAYS = 365 * 10;

export function estimateAstraLiberationDates(params: {
  startDateStr: string;
  bossConfigs: AstraBossConfig[];
  bosses: AstraBoss[];
  baseTrace: number;
  baseFragment: number;
  dailyFragmentsPerDay: number;
  currentStage: 1 | 2 | 3;
  isAuctionMode?: boolean;
  resetWeekday?: number;
}): {
  questDates: string[];
  records: AstraRecord[];
} {
  const {
    startDateStr,
    bossConfigs,
    bosses,
    baseTrace,
    baseFragment,
    dailyFragmentsPerDay,
    currentStage,
    isAuctionMode = false,
    resetWeekday = 4,
  } = params;

  const stagesCount = astraQuestStages.length;
  const questDates: string[] = ["정보 없음", "정보 없음", "정보 없음"];
  for (let i = 0; i < currentStage - 1; i += 1) {
    questDates[i] = "이미 클리어";
  }
  if (!startDateStr) return { questDates, records: [] };

  const startDate = new Date(startDateStr);
  if (Number.isNaN(startDate.getTime())) return { questDates, records: [] };

  let trace = Math.min(baseTrace, ASTRA_MAX_TRACE);
  let fragment = isAuctionMode ? Number.POSITIVE_INFINITY : baseFragment;
  let stageIdx = currentStage - 1;

  const records: AstraRecord[] = [];
  const cursor = new Date(startDate);

  const fragmentForRecord = () => (isAuctionMode ? 0 : fragment);

  const tryClear = () => {
    while (
      stageIdx < stagesCount &&
      trace >= astraQuestStages[stageIdx].requiredTrace &&
      fragment >= astraQuestStages[stageIdx].requiredFragments
    ) {
      const stage = astraQuestStages[stageIdx];
      trace -= stage.requiredTrace;
      if (!isAuctionMode) fragment -= stage.requiredFragments;
      const dateStr = cursor.toISOString().split("T")[0];
      questDates[stageIdx] = dateStr;
      records.push({
        date: new Date(cursor),
        totalTrace: trace,
        totalFragments: fragmentForRecord(),
        isStageCleared: true,
        clearedStageIndex: stage.index,
      });
      stageIdx += 1;
    }
  };

  tryClear();

  if (stageIdx < stagesCount) {
    if (!isAuctionMode) fragment += dailyFragmentsPerDay;
    const isStartReset = startDate.getDay() === resetWeekday;
    trace = Math.min(trace + calculateAstraWeeklyTotal(bossConfigs, bosses, !isStartReset), ASTRA_MAX_TRACE);
    records.push({
      date: new Date(cursor),
      totalTrace: trace,
      totalFragments: fragmentForRecord(),
      isStageCleared: false,
    });
    tryClear();
  }

  let daysElapsed = 0;
  while (stageIdx < stagesCount && daysElapsed < MAX_DAYS) {
    cursor.setDate(cursor.getDate() + 1);
    daysElapsed += 1;
    if (!isAuctionMode) fragment += dailyFragmentsPerDay;
    if (cursor.getDay() === resetWeekday) {
      trace = Math.min(trace + calculateAstraWeeklyTotal(bossConfigs, bosses, false), ASTRA_MAX_TRACE);
      records.push({
        date: new Date(cursor),
        totalTrace: trace,
        totalFragments: fragmentForRecord(),
        isStageCleared: false,
      });
    }
    tryClear();
  }

  for (let i = currentStage - 1; i < stagesCount; i += 1) {
    if (questDates[i] === "정보 없음") questDates[i] = "도달 불가";
  }

  return { questDates, records };
}
