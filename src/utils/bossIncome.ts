// 주간보스 정산 — Selections 단위 수익 계산 공통 유틸.
// "현재 선택" / "프리셋별 합산" 등 다양한 컨텍스트에서 동일 규칙으로 집계해야 하므로 한 곳에 모아둔다.

import { BOSS_CRYSTAL_PRICES } from "@/constants/bossCrystals";
import { effectivePartySize, type Selections } from "@/stores/bossIncome";

// 월간 보스는 한 달에 1회만 클리어 가능. 주간 합산과 분리.
export const MONTHLY_BOSS_NAME = "검은 마법사";

export type BossIncomeBreakdown = {
  weekly: number;
  monthly: number;
  count: number;
};

// 보스 1회 클리어 시 사용자가 받는 메소 (파티원 수에 따라 1/n 분배, 정수 내림).
// 보스별 인게임 파티 상한이 적용되어 partySize 가 자동 clamp 된다.
export const computeBossShare = (boss: string, sel: { difficulty: import("@/constants/bossCrystals").BossDifficulty; partySize?: number }): number => {
  const fullPrice = BOSS_CRYSTAL_PRICES[boss]?.[sel.difficulty] ?? 0;
  return Math.floor(fullPrice / effectivePartySize(sel, boss));
};

export const computeBossIncome = (selections: Selections): BossIncomeBreakdown => {
  let weekly = 0;
  let monthly = 0;
  let count = 0;
  for (const [boss, sel] of Object.entries(selections)) {
    if (!sel.enabled) continue;
    const share = computeBossShare(boss, sel);
    if (boss === MONTHLY_BOSS_NAME) monthly += share;
    else weekly += share;
    count++;
  }
  return { weekly, monthly, count };
};
