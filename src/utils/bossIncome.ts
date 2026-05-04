// 주간보스 정산 — Selections 단위 수익 계산 공통 유틸.
// "현재 선택" / "프리셋별 합산" 등 다양한 컨텍스트에서 동일 규칙으로 집계해야 하므로 한 곳에 모아둔다.

import { BOSS_CRYSTAL_PRICES } from "@/constants/bossCrystals";
import type { Selections } from "@/stores/bossIncome";

// 월간 보스는 한 달에 1회만 클리어 가능. 주간 합산과 분리.
export const MONTHLY_BOSS_NAME = "검은 마법사";

export type BossIncomeBreakdown = {
  weekly: number;
  monthly: number;
  count: number;
};

export const computeBossIncome = (selections: Selections): BossIncomeBreakdown => {
  let weekly = 0;
  let monthly = 0;
  let count = 0;
  for (const [boss, sel] of Object.entries(selections)) {
    if (!sel.enabled) continue;
    const price = BOSS_CRYSTAL_PRICES[boss]?.[sel.difficulty] ?? 0;
    if (boss === MONTHLY_BOSS_NAME) monthly += price;
    else weekly += price;
    count++;
  }
  return { weekly, monthly, count };
};
