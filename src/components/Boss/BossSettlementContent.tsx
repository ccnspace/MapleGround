"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import { BOSS_CRYSTAL_PRICES, BOSS_DIFFICULTIES } from "@/constants/bossCrystals";
import { useBossIncomeStore } from "@/stores/bossIncome";
import { computeBossIncome, computeBossShare } from "@/utils/bossIncome";
import { countThursdaysInMonth } from "@/utils/thursdayCount";
import { BossSettlementRow } from "@/components/Boss/BossSettlementRow";
import { BossSummaryCard } from "@/components/Boss/BossSummaryCard";
import { BossPresetManager } from "@/components/Boss/BossPresetManager";
import { BossPresetTotalsCard } from "@/components/Boss/BossPresetTotalsCard";
import { BossItemTargetCard } from "@/components/Boss/BossItemTargetCard";
import { QUICK_SELECT_PRESETS, type QuickSelectPreset } from "@/components/Boss/bossQuickSelectPresets";

// 월간 보스는 별도 섹션으로 분리
const MONTHLY_BOSS = "검은 마법사";
// 주간 보스 최대 선택 개수 (인게임 제약)
const WEEKLY_MAX = 12;

type SortOrder = "none" | "desc" | "asc";

export const BossSettlementContent = () => {
  const selections = useBossIncomeStore(useShallow((state) => state.current));
  const presets = useBossIncomeStore(useShallow((state) => state.presets));
  const clearCurrent = useBossIncomeStore((s) => s.clearCurrent);
  const setBossesEnabled = useBossIncomeStore((s) => s.setBossesEnabled);

  const bossNames = useMemo(() => Object.keys(BOSS_CRYSTAL_PRICES), []);
  const weeklyBosses = useMemo(() => bossNames.filter((b) => b !== MONTHLY_BOSS), [bossNames]);
  const monthlyBosses = useMemo(() => bossNames.filter((b) => b === MONTHLY_BOSS), [bossNames]);

  const { weeklyTotal, monthlyTotal, selectedCount, weeklySelectedCount } = useMemo(() => {
    let weekly = 0;
    let monthly = 0;
    let count = 0;
    let weeklyCount = 0;
    for (const [boss, sel] of Object.entries(selections)) {
      if (!sel.enabled) continue;
      // 파티원 수에 따라 1/n 분배된 실수령액 사용.
      const share = computeBossShare(boss, sel);
      if (boss === MONTHLY_BOSS) monthly += share;
      else {
        weekly += share;
        weeklyCount++;
      }
      count++;
    }
    return { weeklyTotal: weekly, monthlyTotal: monthly, selectedCount: count, weeklySelectedCount: weeklyCount };
  }, [selections]);

  const thursdays = useMemo(() => countThursdaysInMonth(), []);
  const thisMonthEstimate = weeklyTotal * thursdays + monthlyTotal;

  // 저장된 프리셋들의 주간/월간 수익 합산 — 목표 가격 계산기의 "프리셋 합산" 모드용.
  const presetTotals = useMemo(() => {
    let weekly = 0;
    let monthly = 0;
    for (const p of presets) {
      const inc = computeBossIncome(p.selections);
      weekly += inc.weekly;
      monthly += inc.monthly;
    }
    return { weekly, monthly };
  }, [presets]);

  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const cycleSort = () => setSortOrder((p) => (p === "none" ? "desc" : p === "desc" ? "asc" : "none"));

  // 정렬용 effective 가격 — 선택된 난이도가 있으면 그 가격(파티원 수 1/n 분배 적용), 없으면
  // Row 가 기본으로 노출하는 "제공 난이도 중 가장 높은 등급" 의 가격(파티 1명 기준)으로 계산.
  const sortedWeeklyBosses = useMemo(() => {
    if (sortOrder === "none") return weeklyBosses;
    const getPrice = (boss: string): number => {
      const sel = selections[boss];
      if (sel) return computeBossShare(boss, sel);
      const available = BOSS_DIFFICULTIES.filter((d) => BOSS_CRYSTAL_PRICES[boss]?.[d] !== undefined);
      const last = available[available.length - 1];
      return last ? BOSS_CRYSTAL_PRICES[boss]?.[last] ?? 0 : 0;
    };
    return [...weeklyBosses].sort((a, b) => {
      const diff = getPrice(a) - getPrice(b);
      return sortOrder === "asc" ? diff : -diff;
    });
  }, [weeklyBosses, selections, sortOrder]);

  const weeklyAtLimit = weeklySelectedCount >= WEEKLY_MAX;
  const handleReset = () => clearCurrent();

  // 일괄 선택/해제 — 정렬된 순서 기준 상위 12개를 체크. 이미 체크된 게 있으면 전체 해제.
  const bulkCheckboxRef = useRef<HTMLInputElement>(null);
  const bulkChecked = weeklySelectedCount >= WEEKLY_MAX;
  const bulkIndeterminate = weeklySelectedCount > 0 && weeklySelectedCount < WEEKLY_MAX;
  useEffect(() => {
    if (bulkCheckboxRef.current) bulkCheckboxRef.current.indeterminate = bulkIndeterminate;
  }, [bulkIndeterminate]);

  const handleBulkToggle = () => {
    if (weeklySelectedCount > 0) {
      // 하나라도 선택돼 있으면 주간 전체 해제
      setBossesEnabled(weeklyBosses.map((boss) => ({ boss, enabled: false })));
    } else {
      // 하나도 없으면 정렬된 순서 기준 상위 12개 선택
      const top = sortedWeeklyBosses.slice(0, WEEKLY_MAX);
      setBossesEnabled(top.map((boss) => ({ boss, enabled: true })));
    }
  };

  const bulkTooltip =
    weeklySelectedCount > 0 ? `주간 보스 선택 전체 해제 (${weeklySelectedCount}개 해제)` : `현재 정렬 기준 상위 ${WEEKLY_MAX}개 일괄 선택`;

  const handleApplyQuickSelect = (preset: QuickSelectPreset) => {
    // 주간 보스 전체를 먼저 비활성 → 프리셋의 보스/난이도로 덮어쓰기. 월간(검은 마법사) 은 건드리지 않음.
    const disableWeekly = weeklyBosses.map((boss) => ({ boss, enabled: false }));
    const enablePreset = preset.bosses.map((e) => ({ boss: e.boss, enabled: true, difficulty: e.difficulty }));
    setBossesEnabled([...disableWeekly, ...enablePreset]);
  };

  // 현재 선택이 특정 빠른 선택 프리셋과 정확히 일치하는지 검사 (UI 하이라이트용).
  const activeQuickId = useMemo(() => {
    const enabled = Object.entries(selections).filter(([boss, sel]) => sel.enabled && boss !== MONTHLY_BOSS);
    for (const preset of QUICK_SELECT_PRESETS) {
      if (enabled.length !== preset.bosses.length) continue;
      const map = new Map(preset.bosses.map((e) => [e.boss, e.difficulty]));
      const match = enabled.every(([boss, sel]) => map.get(boss) === sel.difficulty);
      if (match) return preset.id;
    }
    return null;
  }, [selections]);

  const sortLabel = sortOrder === "desc" ? "높은 순" : sortOrder === "asc" ? "낮은 순" : "정렬";
  const sortIcon = sortOrder === "desc" ? "↓" : sortOrder === "asc" ? "↑" : "↕";
  const isSortActive = sortOrder !== "none";

  return (
    <div className="flex flex-col gap-5">
      {/* 요약 + 프리셋 — 넓은 화면에선 좌/우로 나란히, 좁은 화면에선 세로 스택. */}
      <div className="grid grid-cols-1 min-[960px]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3 items-stretch">
        <BossSummaryCard
          weeklyTotal={weeklyTotal}
          monthlyTotal={monthlyTotal}
          thisMonthEstimate={thisMonthEstimate}
          thursdays={thursdays}
          selectedCount={selectedCount}
          totalCount={bossNames.length}
        />
        <BossPresetManager />
      </div>

      {/* 저장된 프리셋(캐릭터)별 수익 합산 — 프리셋이 1개 이상일 때만 노출 */}
      <BossPresetTotalsCard />

      {/* 목표 아이템 가격 → 도달 시점 계산기 */}
      <BossItemTargetCard
        weeklyTotal={weeklyTotal}
        monthlyTotal={monthlyTotal}
        presetWeeklyTotal={presetTotals.weekly}
        presetMonthlyTotal={presetTotals.monthly}
        presetCount={presets.length}
      />

      {/* 월간 보스 섹션 */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[15px] font-bold text-gray-700 dark:text-gray-200">
          🌙 월간 보스 <span className="text-[12px] font-semibold text-gray-400">({monthlyBosses.length})</span>
          <span className="ml-2 text-[11px] font-medium text-violet-600 dark:text-violet-400">한 달에 1회만 클리어 가능</span>
        </h2>
        <div className="flex flex-col gap-1.5">
          {monthlyBosses.map((boss) => (
            <BossSettlementRow key={boss} boss={boss} selection={selections[boss]} />
          ))}
        </div>
      </section>
      {/* 주간 보스 섹션 */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1 flex-wrap gap-2">
          <h2 className="text-[15px] font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <span>📅 주간 보스</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums border
                ${
                  weeklyAtLimit
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800/60"
                    : weeklySelectedCount >= WEEKLY_MAX - 2
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                    : "bg-slate-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-slate-200 dark:border-white/10"
                }`}
              title={`최대 ${WEEKLY_MAX}개까지 선택 가능`}
            >
              {weeklySelectedCount}
              <span className="mx-0.5 opacity-60">/</span>
              {WEEKLY_MAX}
            </span>
            {weeklyAtLimit && <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">⚠ 최대 선택 개수 도달</span>}
          </h2>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="px-2 py-0.5 rounded-md text-[12px] font-semibold
                bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10
                text-gray-600 dark:text-gray-300"
              title="현재 선택 전체 해제"
            >
              전체 해제
            </button>
          )}
        </div>

        {/* 빠른 선택 메뉴 — 흔히 쓰는 12보스 조합을 버튼 하나로 적용. 월간(검은 마법사) 은 변경하지 않음. */}
        <div
          className="flex items-center flex-wrap gap-2 px-2.5 py-2 rounded-lg
            bg-gradient-to-r from-sky-50 to-violet-50
            dark:from-sky-950/30 dark:to-violet-950/30
            border border-sky-200/70 dark:border-sky-800/40"
        >
          <span className="text-[12px] font-bold text-sky-700 dark:text-sky-300 shrink-0">빠른 선택</span>
          {QUICK_SELECT_PRESETS.map((preset) => {
            const isActive = activeQuickId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyQuickSelect(preset)}
                title={preset.description}
                className={`px-2.5 py-1 rounded-md text-[12px] font-bold whitespace-nowrap transition-colors border
                  ${
                    isActive
                      ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                      : "bg-white dark:bg-color-900 text-sky-700 dark:text-sky-300 border-slate-200 dark:border-white/10 hover:bg-sky-50 dark:hover:bg-sky-900/30"
                  }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        {/* 헤더 row (일괄 선택 + 컬럼 라벨 + 메소 정렬 토글) */}
        <div
          className="flex items-center gap-3 max-[600px]:gap-2 px-3 max-[600px]:px-2 py-1.5
            text-[11px] font-bold uppercase tracking-wide
            text-gray-500 dark:text-gray-400
            bg-slate-50 dark:bg-color-950/40
            border border-slate-200/80 dark:border-white/10 rounded-lg"
        >
          <label className="flex items-center justify-center w-5 shrink-0 cursor-pointer select-none" title={bulkTooltip}>
            <input
              ref={bulkCheckboxRef}
              type="checkbox"
              checked={bulkChecked}
              onChange={handleBulkToggle}
              className="w-5 h-5 accent-emerald-500 cursor-pointer"
              aria-label={bulkTooltip}
            />
          </label>
          <div className="w-10 max-[600px]:w-8 shrink-0" aria-hidden />
          <span className="flex-1 min-w-0">보스</span>
          <span className="shrink-0">난이도</span>
          <span
            className="shrink-0 w-[60px] max-[600px]:w-[52px] text-right"
            title="파티원 수 — 메소가 1/n 로 분배됩니다"
          >
            파티
          </span>
          <button
            type="button"
            onClick={cycleSort}
            aria-label={`메소 ${sortLabel}`}
            title={`메소 ${sortLabel} (클릭으로 전환)`}
            className={`flex items-center justify-end gap-1 min-w-[96px] max-[600px]:min-w-[76px] shrink-0
              rounded px-1 py-0.5 transition-colors
              ${
                isSortActive
                  ? "text-sky-600 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-900/30"
                  : "hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
          >
            <span>메소</span>
            <span className="text-[13px] font-black leading-none">{sortIcon}</span>
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {sortedWeeklyBosses.map((boss) => {
            const isEnabled = selections[boss]?.enabled ?? false;
            // 이미 선택된 row 는 해제 가능하므로 disabled 하지 않는다.
            const lockedByLimit = weeklyAtLimit && !isEnabled;
            return (
              <BossSettlementRow
                key={boss}
                boss={boss}
                selection={selections[boss]}
                disabled={lockedByLimit}
                disabledReason={`주간 보스는 최대 ${WEEKLY_MAX}개까지 선택 가능합니다`}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};
