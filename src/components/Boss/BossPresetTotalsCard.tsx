"use client";

import { useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useBossIncomeStore } from "@/stores/bossIncome";
import { countThursdaysInMonth } from "@/utils/thursdayCount";
import { formatKoreanNumber } from "@/utils/formatKoreanNum";
import { computeBossIncome } from "@/utils/bossIncome";

type PresetIncome = {
  id: string;
  name: string;
  enabledCount: number;
  weekly: number;
  monthly: number;
  thisMonth: number;
};

export const BossPresetTotalsCard = () => {
  const presets = useBossIncomeStore(useShallow((s) => s.presets));
  const activePresetId = useBossIncomeStore((s) => s.activePresetId);
  const [isExpanded, setIsExpanded] = useState(false);

  const thursdays = useMemo(() => countThursdaysInMonth(), []);
  const yearMonthLabel = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}.${now.getMonth() + 1}`;
  }, []);

  const presetIncomes = useMemo<PresetIncome[]>(
    () =>
      presets.map((p) => {
        const { weekly, monthly, count } = computeBossIncome(p.selections);
        return { id: p.id, name: p.name, enabledCount: count, weekly, monthly, thisMonth: weekly * thursdays + monthly };
      }),
    [presets, thursdays]
  );

  const totals = useMemo(
    () =>
      presetIncomes.reduce(
        (acc, p) => ({
          weekly: acc.weekly + p.weekly,
          monthly: acc.monthly + p.monthly,
          thisMonth: acc.thisMonth + p.thisMonth,
        }),
        { weekly: 0, monthly: 0, thisMonth: 0 }
      ),
    [presetIncomes]
  );

  // 프리셋이 없으면 카드 자체를 숨김 (빈 상태 노이즈 방지).
  if (presets.length === 0) return null;

  return (
    <div
      className="flex flex-col rounded-xl border
        border-slate-200 dark:border-white/10
        bg-white dark:bg-color-900/60
        shadow-sm overflow-hidden"
    >
      {/* 헤더 — 클릭으로 펼침/접힘 토글 */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
        aria-controls="boss-preset-totals-body"
        className="flex items-center justify-between gap-3 px-4 py-3 text-left
          hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-[15px] font-bold text-gray-700 dark:text-gray-200">👥 전체 프리셋 합산</span>
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums
              bg-slate-100 dark:bg-white/10
              text-gray-600 dark:text-gray-300
              border border-slate-200 dark:border-white/10"
          >
            {presets.length}개
          </span>
          {!isExpanded && (
            <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
              이번 달 합계 {formatKoreanNumber(totals.thisMonth)}메소
            </span>
          )}
          {isExpanded && (
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 max-[600px]:hidden">
              저장된 프리셋(캐릭터)들의 수익을 합산해 보여드립니다
            </span>
          )}
        </div>
        <span
          className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full
            text-gray-500 dark:text-gray-300
            bg-slate-50 dark:bg-white/10
            border border-slate-200 dark:border-white/10
            transition-transform duration-200 ease-out
            ${isExpanded ? "rotate-180" : "rotate-0"}`}
          aria-hidden
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {/* 본문 */}
      {isExpanded && (
        <div id="boss-preset-totals-body" className="flex flex-col gap-2 px-3 pb-3 pt-1">
          {/* 컬럼 헤더 (≥600px 만 노출) */}
          <div
            className="hidden min-[600px]:grid grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,1fr))] gap-2 px-3 py-1.5
              text-[13px] font-bold uppercase tracking-wide
              text-gray-500 dark:text-gray-400
              border-b border-slate-200 dark:border-white/10"
          >
            <span>프리셋</span>
            <span className="text-right">주간 (1주)</span>
            <span className="text-right">월간</span>
            <span className="text-right">이번 달</span>
          </div>

          {/* 프리셋별 행 */}
          <div className="flex flex-col">
            {presetIncomes.map((p) => {
              const isActive = p.id === activePresetId;
              return (
                <div
                  key={p.id}
                  className={`grid grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,1fr))] gap-2 px-3 py-2 rounded-md
                    max-[600px]:grid-cols-1 max-[600px]:gap-1
                    border-b border-slate-100 dark:border-white/5 last:border-b-0
                    ${isActive ? "bg-sky-50/60 dark:bg-sky-900/20" : ""}`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{p.name}</span>
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
                      ({p.enabledCount}개)
                    </span>
                    {isActive && (
                      <span
                        className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none
                          bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 shrink-0"
                      >
                        활성
                      </span>
                    )}
                  </div>
                  <IncomeCell label="주간" value={p.weekly} muted={p.weekly === 0} />
                  <IncomeCell label="월간" value={p.monthly} muted={p.monthly === 0} />
                  <IncomeCell label="이번 달" value={p.thisMonth} accent muted={p.thisMonth === 0} />
                </div>
              );
            })}
          </div>

          {/* 합계 */}
          <div
            className="grid grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,1fr))] gap-2 px-3 py-2.5 mt-1 rounded-lg
              max-[600px]:grid-cols-1 max-[600px]:gap-1
              bg-emerald-500/10 dark:bg-emerald-500/15
              border border-emerald-400/40 dark:border-emerald-500/30"
          >
            <div className="flex flex-col leading-tight">
              <span className="text-[12px] font-extrabold text-emerald-700 dark:text-emerald-300">합계 ({presets.length}개)</span>
              <span className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/80 tabular-nums">
                주×{thursdays} + 월×1 ({yearMonthLabel})
              </span>
            </div>
            <IncomeCell label="주간 합계" value={totals.weekly} bold />
            <IncomeCell label="월간 합계" value={totals.monthly} bold />
            <IncomeCell label="이번 달 합계" value={totals.thisMonth} accent bold />
          </div>
        </div>
      )}
    </div>
  );
};

// 셀 한 칸 — 좁은 화면에선 라벨이 보이고, 넓으면 숫자만 우측 정렬.
const IncomeCell = ({
  label,
  value,
  accent,
  bold,
  muted,
}: {
  label: string;
  value: number;
  accent?: boolean;
  bold?: boolean;
  muted?: boolean;
}) => {
  const valueClass = muted
    ? "text-gray-400 dark:text-gray-500"
    : accent
    ? "text-emerald-700 dark:text-emerald-300"
    : "text-gray-800 dark:text-gray-100";
  const weight = bold ? "font-extrabold" : "font-bold";
  return (
    <div className="flex items-center justify-between min-[600px]:justify-end gap-2 leading-tight">
      <span className="min-[600px]:hidden text-[11px] font-semibold text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex flex-col items-end tabular-nums">
        <span className={`text-sm ${weight} ${valueClass}`}>{value.toLocaleString()}</span>
        <span className={`text-[10px] font-medium ${muted ? "text-gray-300 dark:text-gray-600" : "text-gray-500 dark:text-gray-400"}`}>
          {value > 0 ? formatKoreanNumber(value) : "0"}
        </span>
      </div>
    </div>
  );
};
