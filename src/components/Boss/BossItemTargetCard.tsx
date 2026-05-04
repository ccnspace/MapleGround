"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { formatKoreanNumber } from "@/utils/formatKoreanNum";
import { parseKoreanPrice } from "@/utils/parseKoreanPrice";

type Props = {
  weeklyTotal: number;
  monthlyTotal: number;
  presetWeeklyTotal: number;
  presetMonthlyTotal: number;
  presetCount: number;
};

type CalcMode = "current" | "presets";

const MODE_LABEL: Record<CalcMode, string> = {
  current: "현재 선택",
  presets: "프리셋 합산",
};

// 시뮬레이션 상한 — 무한 루프 방지 + UI 상 "장기간 소요" 처리.
const MAX_SIMULATION_WEEKS = 520; // 약 10년

type SimulationResult =
  | { kind: "reached"; weeks: number; months: number; targetDate: Date; accumulated: number }
  | { kind: "tooLong" }
  | { kind: "noIncome" };

// 이번 주 또는 그 이후의 가장 가까운 목요일을 반환. (이미 목요일이면 오늘 자정 기준)
const getThisOrNextThursday = (from: Date): Date => {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const offset = (4 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + offset);
  return d;
};

// 이번 주부터 매주 목요일에 weeklyIncome 을 받고, 매 새로운 달의 첫 목요일에 monthlyIncome 을 추가로 받는다고 가정.
// 누적 메소가 target 이상이 되는 주차 수를 계산.
const simulateWeeksUntilTarget = (
  target: number,
  weeklyIncome: number,
  monthlyIncome: number,
  now: Date = new Date()
): SimulationResult => {
  if (weeklyIncome === 0 && monthlyIncome === 0) return { kind: "noIncome" };

  let accumulated = 0;
  let weeks = 0;
  const cursor = getThisOrNextThursday(now);
  const claimedMonths = new Set<string>();

  while (accumulated < target && weeks < MAX_SIMULATION_WEEKS) {
    weeks++;
    accumulated += weeklyIncome;
    const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    if (!claimedMonths.has(monthKey)) {
      accumulated += monthlyIncome;
      claimedMonths.add(monthKey);
    }
    if (accumulated >= target) {
      return {
        kind: "reached",
        weeks,
        months: Math.round((weeks / 4.345) * 10) / 10,
        targetDate: new Date(cursor),
        accumulated,
      };
    }
    cursor.setDate(cursor.getDate() + 7);
  }

  return { kind: "tooLong" };
};

export const BossItemTargetCard = ({ weeklyTotal, monthlyTotal, presetWeeklyTotal, presetMonthlyTotal, presetCount }: Props) => {
  const [rawInput, setRawInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<CalcMode>("current");

  // 프리셋이 모두 삭제되면 "프리셋 합산" 모드를 유지할 수 없으므로 현재 선택으로 폴백.
  useEffect(() => {
    if (mode === "presets" && presetCount === 0) setMode("current");
  }, [mode, presetCount]);

  const activeWeekly = mode === "current" ? weeklyTotal : presetWeeklyTotal;
  const activeMonthly = mode === "current" ? monthlyTotal : presetMonthlyTotal;

  const parsedPrice = useMemo(() => parseKoreanPrice(rawInput), [rawInput]);

  // 입력값 옆 보조 문자열: "= 1억 5000만"
  const parsedHint = useMemo(() => {
    if (parsedPrice === null) return null;
    if (parsedPrice === 0) return "= 0";
    return `= ${formatKoreanNumber(parsedPrice)}메소`;
  }, [parsedPrice]);

  const result = useMemo<SimulationResult | null>(() => {
    if (parsedPrice === null || parsedPrice <= 0) return null;
    return simulateWeeksUntilTarget(parsedPrice, activeWeekly, activeMonthly);
  }, [parsedPrice, activeWeekly, activeMonthly]);

  const showInputError = rawInput.length > 0 && parsedPrice === null;

  // 접힌 상태일 때 헤더에 보여줄 짧은 요약. 결과가 있으면 결과를, 입력 중이면 입력 금액을, 아니면 안내.
  const collapsedSummary = useMemo(() => {
    if (result?.kind === "reached") return `${result.weeks}주 (약 ${result.months}개월) 뒤`;
    if (result?.kind === "tooLong") return "10년 이상 소요";
    if (result?.kind === "noIncome") return "보스 미선택";
    if (parsedPrice && parsedPrice > 0) return `${formatKoreanNumber(parsedPrice)}메소 입력 중`;
    return null;
  }, [result, parsedPrice]);

  return (
    <div
      className="flex flex-col rounded-xl border
        border-amber-300/60 dark:border-white/10
        bg-amber-50 dark:bg-color-900/60
        shadow-sm overflow-hidden"
    >
      {/* 헤더 — 클릭으로 펼침/접힘 토글 */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
        aria-controls="boss-target-body"
        className="flex items-center justify-between gap-3 px-4 py-3 text-left
          hover:bg-amber-100/40 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-[15px] font-bold text-gray-700 dark:text-gray-200">🎯 목표 아이템 가격 계산기</span>
          {!isExpanded && collapsedSummary && (
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums
                bg-amber-100 dark:bg-white/10
                text-amber-700 dark:text-amber-300
                border border-amber-200 dark:border-white/10 truncate max-w-[60vw]"
            >
              {collapsedSummary}
            </span>
          )}
          {!isExpanded && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold
                bg-slate-100 dark:bg-white/10
                text-gray-600 dark:text-gray-300
                border border-slate-200 dark:border-white/10"
            >
              {MODE_LABEL[mode]} 기준
            </span>
          )}
          {isExpanded && (
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 max-[600px]:hidden">
              이번 주부터 누적 시 도달 시점을 계산해드립니다
            </span>
          )}
        </div>
        <span
          className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full
            text-gray-500 dark:text-gray-300
            bg-white/70 dark:bg-white/10
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
        <div id="boss-target-body" className="flex flex-col gap-3 px-4 pb-4 pt-1">
          {/* 계산 기준 토글 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-bold text-gray-600 dark:text-gray-300 px-1">계산 기준</span>
            <div
              role="tablist"
              aria-label="계산 기준 선택"
              className="inline-flex items-center gap-0.5 p-0.5 rounded-lg
                bg-slate-100 dark:bg-color-950/60
                border border-slate-200 dark:border-white/10"
            >
              <ModeButton active={mode === "current"} onClick={() => setMode("current")} title="현재 화면에서 선택한 보스 기준으로 계산">
                현재 선택
              </ModeButton>
              <ModeButton
                active={mode === "presets"}
                disabled={presetCount === 0}
                onClick={() => setMode("presets")}
                title={presetCount === 0 ? "저장된 프리셋이 없습니다" : `저장된 ${presetCount}개 프리셋의 합산 수익으로 계산`}
              >
                프리셋 합산
                <span className="ml-1 text-[10px] font-bold opacity-70 tabular-nums">{presetCount}개</span>
              </ModeButton>
            </div>
          </div>

          {/* 입력 영역 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="boss-target-price-input" className="text-[12px] font-bold text-gray-600 dark:text-gray-300 px-1">
              원하는 아이템 가격
            </label>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg
                bg-white/90 dark:bg-color-950/60 border transition-colors
                ${
                  showInputError
                    ? "border-rose-400 dark:border-rose-500/70 focus-within:ring-2 focus-within:ring-rose-300 dark:focus-within:ring-rose-600"
                    : "border-slate-300 dark:border-white/10 focus-within:ring-2 focus-within:ring-amber-300 dark:focus-within:ring-color-500"
                }`}
            >
              <input
                id="boss-target-price-input"
                type="text"
                inputMode="decimal"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="예) 1억 5000만, 1.5억, 150000000"
                className="flex-1 min-w-0 bg-transparent text-base font-semibold tabular-nums
                  text-gray-800 dark:text-gray-100
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  focus:outline-none"
              />
              {rawInput && (
                <button
                  type="button"
                  onClick={() => setRawInput("")}
                  className="px-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
                  aria-label="입력 초기화"
                  title="입력 초기화"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 px-1 min-h-[16px]">
              {showInputError ? (
                <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400">숫자를 인식하지 못했어요. 예) 1억 5000만</span>
              ) : (
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 tabular-nums">{parsedHint ?? " "}</span>
              )}
            </div>
          </div>

          {/* 결과 영역 — 입력/선택 상태에 따라 분기 */}
          <ResultPanel
            result={result}
            hasInput={parsedPrice !== null && parsedPrice > 0}
            weeklyTotal={activeWeekly}
            monthlyTotal={activeMonthly}
            mode={mode}
            presetCount={presetCount}
          />
        </div>
      )}
    </div>
  );
};

const ModeButton = ({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`px-3 py-1 rounded-md text-[12px] font-bold transition-colors whitespace-nowrap
      ${
        active
          ? "bg-white dark:bg-color-900 shadow-sm text-gray-800 dark:text-gray-100 border border-slate-200 dark:border-white/10"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      }
      disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-500 dark:disabled:hover:text-gray-400`}
  >
    {children}
  </button>
);

const ResultPanel = ({
  result,
  hasInput,
  weeklyTotal,
  monthlyTotal,
  mode,
  presetCount,
}: {
  result: SimulationResult | null;
  hasInput: boolean;
  weeklyTotal: number;
  monthlyTotal: number;
  mode: CalcMode;
  presetCount: number;
}) => {
  const modeBadge =
    mode === "presets"
      ? `프리셋 ${presetCount}개 합산 기준`
      : "현재 선택 기준";

  // 입력 전 — 안내 문구
  if (!hasInput || !result) {
    const hasIncome = weeklyTotal > 0 || monthlyTotal > 0;
    const emptyMessage = hasIncome
      ? "원하는 아이템 가격을 입력하면 도달 예상 시점을 보여드려요."
      : mode === "presets"
      ? "선택된 보스가 있는 프리셋이 없어요. 보스를 선택해 프리셋을 저장해주세요."
      : "보스를 선택하면 누적 수익을 기준으로 도달 시점을 계산할 수 있어요.";
    return (
      <div
        className="flex items-center justify-center px-4 py-4 rounded-lg
          bg-white/60 dark:bg-color-950/40 border border-dashed border-amber-300/70 dark:border-white/10
          text-[13px] font-medium text-gray-500 dark:text-gray-400 text-center"
      >
        {emptyMessage}
      </div>
    );
  }

  if (result.kind === "noIncome") {
    return (
      <div
        className="flex items-center justify-center px-4 py-4 rounded-lg
          bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50
          text-[13px] font-semibold text-rose-600 dark:text-rose-300 text-center"
      >
        {mode === "presets"
          ? "프리셋들에 선택된 보스가 없어요. 보스를 선택한 프리셋을 저장해주세요."
          : "선택된 보스가 없어요. 먼저 주간/월간 보스를 선택해주세요."}
      </div>
    );
  }

  if (result.kind === "tooLong") {
    return (
      <div
        className="flex items-center justify-center px-4 py-4 rounded-lg
          bg-amber-50 dark:bg-color-900/60 border border-amber-200 dark:border-white/10
          text-[13px] font-semibold text-amber-700 dark:text-amber-300 text-center"
      >
        이 수익으로는 10년 이상 걸려요. 보스를 더 추가하거나 목표 금액을 낮춰보세요.
      </div>
    );
  }

  const { weeks, months, targetDate, accumulated } = result;
  const dateLabel = dayjs(targetDate).format("YYYY년 M월 D일 (목)");

  return (
    <div
      className="flex flex-col gap-2 px-4 py-3 rounded-lg
        bg-amber-500/10 dark:bg-color-950/60
        border border-amber-400/50 dark:border-white/10"
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[13px] font-bold text-amber-700 dark:text-amber-300">예상 도달 시점</span>
          <span
            className="px-1.5 py-0.5 rounded-full text-[10px] font-bold
              bg-white/70 dark:bg-white/10 text-gray-600 dark:text-gray-300
              border border-slate-200 dark:border-white/10"
          >
            {modeBadge}
          </span>
        </div>
        <span className="text-[12px] font-medium text-gray-600 dark:text-gray-400 tabular-nums">{dateLabel}</span>
      </div>
      <div className="flex items-baseline justify-end gap-1.5 flex-wrap leading-tight">
        <span className="text-[12px] font-semibold text-gray-500 dark:text-gray-400">이번 주부터</span>
        <span className="text-3xl max-[600px]:text-2xl font-extrabold text-amber-600 dark:text-amber-300 tabular-nums">{weeks}</span>
        <span className="text-base font-bold text-amber-700 dark:text-amber-300">주</span>
        <span className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 tabular-nums">(약 {months}개월)</span>
        <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">뒤에 살 수 있어요</span>
      </div>
      <div
        className="flex items-center justify-between gap-2 pt-2 mt-1
          border-t border-amber-300/40 dark:border-white/10
          text-[11px] font-medium text-gray-500 dark:text-gray-400 tabular-nums"
      >
        <span>누적 예상 수익</span>
        <span className="font-bold text-gray-700 dark:text-gray-200">
          {accumulated.toLocaleString()} <span className="text-gray-400">메소</span>
          <span className="ml-1.5 text-gray-400">({formatKoreanNumber(accumulated)})</span>
        </span>
      </div>
    </div>
  );
};
