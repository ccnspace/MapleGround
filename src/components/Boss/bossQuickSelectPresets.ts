import { BOSS_CRYSTAL_PRICES, type BossDifficulty } from "@/constants/bossCrystals";

const MONTHLY_BOSS = "검은 마법사";
const WEEKLY_MAX = 12;

export type QuickSelectEntry = { boss: string; difficulty: BossDifficulty };
export type QuickSelectPreset = {
  id: string;
  name: string;
  description: string;
  bosses: QuickSelectEntry[];
};

// 각 보스의 "최고 난이도" 엔트리를 가격 내림차순으로 정렬 후 상위 12개.
// 월간 보스(검은 마법사) 제외.
const computeTop12 = (): QuickSelectEntry[] => {
  const entries: Array<{ boss: string; difficulty: BossDifficulty; price: number }> = [];
  for (const [boss, priceByDiff] of Object.entries(BOSS_CRYSTAL_PRICES)) {
    if (boss === MONTHLY_BOSS) continue;
    const pairs = Object.entries(priceByDiff) as Array<[BossDifficulty, number]>;
    if (pairs.length === 0) continue;
    const [difficulty, price] = pairs.reduce((best, cur) => (cur[1] > best[1] ? cur : best));
    entries.push({ boss, difficulty, price });
  }
  entries.sort((a, b) => b.price - a.price);
  return entries.slice(0, WEEKLY_MAX).map(({ boss, difficulty }) => ({ boss, difficulty }));
};

// 사용자 명세로 고정된 빠른 선택 프리셋.
export const QUICK_SELECT_PRESETS: QuickSelectPreset[] = [
  {
    id: "top12",
    name: "최고 난이도 TOP 12",
    description: "각 보스 최고 난이도 기준 상위 12개",
    bosses: computeTop12(),
  },
  {
    id: "black-bottom",
    name: "검밑솔",
    description: "하드 진 힐라 이하 주력 12보스",
    bosses: [
      { boss: "진 힐라", difficulty: "HARD" },
      { boss: "듄켈", difficulty: "HARD" },
      { boss: "윌", difficulty: "HARD" },
      { boss: "가디언 엔젤 슬라임", difficulty: "CHAOS" },
      { boss: "더스크", difficulty: "CHAOS" },
      { boss: "루시드", difficulty: "HARD" },
      { boss: "데미안", difficulty: "HARD" },
      { boss: "스우", difficulty: "HARD" },
      { boss: "벨룸", difficulty: "CHAOS" },
      { boss: "매그너스", difficulty: "HARD" },
      { boss: "피에르", difficulty: "CHAOS" },
      { boss: "파풀라투스", difficulty: "CHAOS" },
    ],
  },
  {
    id: "noseikal",
    name: "노세이칼",
    description: "노멀 세렌 + 이지 칼로스 포함, 그 이하 12보스",
    bosses: [
      { boss: "선택받은 세렌", difficulty: "NORMAL" },
      { boss: "감시자 칼로스", difficulty: "EASY" },
      { boss: "진 힐라", difficulty: "HARD" },
      { boss: "듄켈", difficulty: "HARD" },
      { boss: "윌", difficulty: "HARD" },
      { boss: "가디언 엔젤 슬라임", difficulty: "CHAOS" },
      { boss: "더스크", difficulty: "CHAOS" },
      { boss: "루시드", difficulty: "HARD" },
      { boss: "스우", difficulty: "HARD" },
      { boss: "데미안", difficulty: "HARD" },
      { boss: "파풀라투스", difficulty: "CHAOS" },
      { boss: "벨룸", difficulty: "CHAOS" },
    ],
  },
  {
    id: "haseijeokja",
    name: "하세이적자",
    description: "하드 세렌 + 이지 대적자 포함, 그 이하 12보스",
    bosses: [
      { boss: "선택받은 세렌", difficulty: "HARD" },
      { boss: "최초의 대적자", difficulty: "EASY" },
      { boss: "감시자 칼로스", difficulty: "EASY" },
      { boss: "진 힐라", difficulty: "HARD" },
      { boss: "듄켈", difficulty: "HARD" },
      { boss: "윌", difficulty: "HARD" },
      { boss: "가디언 엔젤 슬라임", difficulty: "CHAOS" },
      { boss: "더스크", difficulty: "CHAOS" },
      { boss: "루시드", difficulty: "HARD" },
      { boss: "스우", difficulty: "HARD" },
      { boss: "데미안", difficulty: "HARD" },
      { boss: "파풀라투스", difficulty: "CHAOS" },
    ],
  },
  {
    id: "nokalika",
    name: "노칼이카",
    description: "노멀 칼로스 + 이지 카링 포함, 그 이하 12보스",
    bosses: [
      { boss: "감시자 칼로스", difficulty: "NORMAL" },
      { boss: "카링", difficulty: "EASY" },
      { boss: "선택받은 세렌", difficulty: "HARD" },
      { boss: "최초의 대적자", difficulty: "EASY" },
      { boss: "진 힐라", difficulty: "HARD" },
      { boss: "듄켈", difficulty: "HARD" },
      { boss: "윌", difficulty: "HARD" },
      { boss: "가디언 엔젤 슬라임", difficulty: "CHAOS" },
      { boss: "더스크", difficulty: "CHAOS" },
      { boss: "루시드", difficulty: "HARD" },
      { boss: "스우", difficulty: "HARD" },
      { boss: "데미안", difficulty: "HARD" },
    ],
  },
  {
    id: "nojeokja",
    name: "노적자",
    description: "노멀 대적자/칼로스 + 이지 카링 포함, 그 이하 12보스",
    bosses: [
      { boss: "최초의 대적자", difficulty: "NORMAL" },
      { boss: "감시자 칼로스", difficulty: "NORMAL" },
      { boss: "카링", difficulty: "EASY" },
      { boss: "선택받은 세렌", difficulty: "HARD" },
      { boss: "진 힐라", difficulty: "HARD" },
      { boss: "듄켈", difficulty: "HARD" },
      { boss: "윌", difficulty: "HARD" },
      { boss: "가디언 엔젤 슬라임", difficulty: "CHAOS" },
      { boss: "더스크", difficulty: "CHAOS" },
      { boss: "루시드", difficulty: "HARD" },
      { boss: "스우", difficulty: "HARD" },
      { boss: "데미안", difficulty: "HARD" },
    ],
  },
  {
    id: "exsuu",
    name: "익스우",
    description: "노적자 구성에서 스우만 익스트림",
    bosses: [
      { boss: "최초의 대적자", difficulty: "NORMAL" },
      { boss: "감시자 칼로스", difficulty: "NORMAL" },
      { boss: "카링", difficulty: "EASY" },
      { boss: "선택받은 세렌", difficulty: "HARD" },
      { boss: "진 힐라", difficulty: "HARD" },
      { boss: "듄켈", difficulty: "HARD" },
      { boss: "윌", difficulty: "HARD" },
      { boss: "가디언 엔젤 슬라임", difficulty: "CHAOS" },
      { boss: "더스크", difficulty: "CHAOS" },
      { boss: "루시드", difficulty: "HARD" },
      { boss: "스우", difficulty: "EXTREME" },
      { boss: "데미안", difficulty: "HARD" },
    ],
  },
];
