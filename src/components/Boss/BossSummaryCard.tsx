"use client";

import { formatKoreanNumber } from "@/utils/formatKoreanNum";

type Props = {
  weeklyTotal: number;
  monthlyTotal: number;
  thisMonthEstimate: number;
  thursdays: number;
  selectedCount: number;
  totalCount: number;
};

// value 가 0 일 때도 보조 텍스트 줄을 렌더해서 high/low 전환 시 layout shift 가 없도록 한다.
const MesoNumber = ({ value, accentClass, large = false }: { value: number; accentClass: string; large?: boolean }) => {
  const sizeClass = large ? "text-2xl max-[600px]:text-base" : "text-xl max-[600px]:text-base";
  return (
    <div className="flex flex-col items-end tabular-nums leading-tight">
      <span className={`${sizeClass} font-extrabold ${accentClass}`}>{value.toLocaleString()}</span>
      <span className={`text-[12px] font-medium ${value > 0 ? "text-gray-500 dark:text-gray-400" : "text-gray-300 dark:text-gray-600"}`}>
        {formatKoreanNumber(value)}
      </span>
    </div>
  );
};

export const BossSummaryCard = ({ weeklyTotal, monthlyTotal, thisMonthEstimate, thursdays, selectedCount, totalCount }: Props) => {
  const now = new Date();
  const yearMonthLabel = `${now.getFullYear()}.${now.getMonth() + 1}`;

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-xl border
        border-emerald-300/60 dark:border-emerald-700/40
        bg-gradient-to-br from-emerald-50 via-sky-50 to-white
        dark:from-emerald-950/40 dark:via-sky-950/30 dark:to-color-900/40
        shadow-sm h-full"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-[15px] font-bold text-gray-700 dark:text-gray-200">💰 수익 요약</p>
        <span
          className="px-2 py-0.5 rounded-full text-[12px] font-semibold
            bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/10
            text-gray-600 dark:text-gray-300"
        >
          선택 <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{selectedCount}</span>
          <span className="text-gray-400 dark:text-gray-500"> / {totalCount}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
        <div
          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg
            bg-white/80 dark:bg-color-900/60 border border-slate-200 dark:border-white/10"
        >
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wide">Weekly</span>
            <span className="text-[14px] font-bold text-gray-700 dark:text-gray-200">주간 보스 (1주 당)</span>
          </div>
          <MesoNumber value={weeklyTotal} accentClass="text-sky-600 dark:text-sky-300" />
        </div>

        <div
          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg
            bg-white/80 dark:bg-color-900/60 border border-slate-200 dark:border-white/10"
        >
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Monthly</span>
            <span className="text-[14px] font-bold text-gray-700 dark:text-gray-200">월간 보스</span>
          </div>
          <MesoNumber value={monthlyTotal} accentClass="text-violet-600 dark:text-violet-300" />
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg
          bg-emerald-500/10 dark:bg-emerald-500/15
          border border-emerald-400/50 dark:border-emerald-500/40 mt-auto"
      >
        <div className="flex flex-col leading-tight gap-0.5">
          <span className="text-[15px] font-extrabold text-emerald-700 dark:text-emerald-300">
            이번 달 수익
            <span className="ml-1.5 text-[12px] font-semibold text-emerald-600/80 dark:text-emerald-400/80">({yearMonthLabel})</span>
          </span>
          <span className="text-sm max-[600px]:text-xs text-gray-600 dark:text-gray-400">
            주<span className="font-bold">×{thursdays}</span>
            <span className="mx-1 text-gray-400">+</span>월<span className="font-bold">×1</span>
          </span>
        </div>
        <MesoNumber value={thisMonthEstimate} accentClass="text-emerald-600 dark:text-emerald-300" large />
      </div>
    </div>
  );
};
