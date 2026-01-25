import Image from "next/image";
import { ComparisonStats } from "@/types/Equipment";
import { STAT_LABELS, STAT_DISPLAY_ORDER } from "@/consts/statLabels";

interface DetailedComparisonItemProps {
  index: number;
  itemSlot: string;
  firstPersonItemIcon: string;
  secondPersonItemIcon: string;
  score: number;
  comparison: ComparisonStats;
  variant: "positive" | "negative";
}

export const DetailedComparisonItem = ({
  index,
  itemSlot,
  firstPersonItemIcon,
  secondPersonItemIcon,
  score,
  comparison,
  variant,
}: DetailedComparisonItemProps) => {
  const gradientClass = variant === "positive" ? "from-emerald-400 to-teal-500" : "from-rose-400 to-pink-500";
  const scoreColorClass = variant === "positive" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
  const scoreDisplay = variant === "positive" ? `+${score.toFixed(1)}` : score.toFixed(1);

  return (
    <div className="group relative bg-white dark:bg-slate-700/50 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* 순위 */}
        <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-br ${gradientClass} rounded-full flex items-center justify-center`}>
          <span className="text-white font-bold text-sm">{index + 1}</span>
        </div>

        {/* 아이템 아이콘들 */}
        <div className="flex items-center gap-3 flex-1">
          <Image
            src={firstPersonItemIcon}
            alt="과거 아이템"
            width={48}
            height={48}
            unoptimized
            style={{ width: "auto", height: "auto" }}
            className="rounded-lg"
          />
          <div className="flex items-center">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <Image
            src={secondPersonItemIcon}
            alt="현재 아이템"
            width={48}
            height={48}
            unoptimized
            style={{ width: "auto", height: "auto" }}
            className="rounded-lg"
          />
        </div>

        {/* 점수 */}
        <div className="flex-shrink-0">
          <div className="text-right">
            <div className={`text-lg font-bold ${scoreColorClass}`}>{scoreDisplay}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{itemSlot}</div>
          </div>
        </div>
      </div>

      {/* 호버 시 상세 정보 */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-[90%] ${
          index < 2 ? "top-full mt-2" : "bottom-full mb-2"
        } bg-white dark:bg-slate-800 rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 w-80`}
      >
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">상세 비교 정보</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {STAT_DISPLAY_ORDER.map((key) => {
            const value = comparison[key];
            if (value === undefined) return null;

            return (
              <div key={key} className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">{STAT_LABELS[key]}</span>
                <span
                  className={`font-semibold ${
                    value > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : value < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {value > 0 ? "+" : ""}
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
