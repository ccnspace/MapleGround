"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  BOSS_CRYSTAL_PRICES,
  BOSS_DIFFICULTIES,
  BOSS_DIFFICULTY_LABEL,
  BOSS_IMAGES,
  getBossMaxPartySize,
  type BossDifficulty,
} from "@/constants/bossCrystals";
import { effectivePartySize, MIN_PARTY_SIZE, useBossIncomeStore, type BossSelection } from "@/stores/bossIncome";
import { formatKoreanNumber } from "@/utils/formatKoreanNum";

type Props = {
  boss: string;
  selection: BossSelection | undefined;
  // 외부 제약(주간 보스 12개 한도 등)에 의해 체크박스 활성화가 막혀 있는지.
  // 이미 enabled 인 row 는 해제 가능해야 하므로 호출자가 직접 판단해 넘긴다.
  disabled?: boolean;
  disabledReason?: string;
};

// 난이도별 색. 체크된 상태 + 선택된 pill 에 강조 적용.
const DIFFICULTY_STYLES: Record<BossDifficulty, { active: string; idle: string }> = {
  EASY: {
    active: "bg-slate-200 text-slate-700 dark:bg-slate-500/40 dark:text-slate-100 ring-1 ring-slate-400",
    idle: "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5",
  },
  NORMAL: {
    active: "bg-sky-100 text-sky-700 dark:bg-sky-500/30 dark:text-sky-100 ring-1 ring-sky-400",
    idle: "text-slate-500 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-sky-900/20",
  },
  HARD: {
    active: "bg-violet-100 text-violet-700 dark:bg-violet-500/30 dark:text-violet-100 ring-1 ring-violet-400",
    idle: "text-slate-500 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-900/20",
  },
  CHAOS: {
    active: "bg-rose-100 text-rose-700 dark:bg-rose-500/30 dark:text-rose-100 ring-1 ring-rose-400",
    idle: "text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20",
  },
  EXTREME: {
    active: "bg-amber-100 text-amber-700 dark:bg-amber-500/30 dark:text-amber-100 ring-1 ring-amber-400",
    idle: "text-slate-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
  },
};

export const BossSettlementRow = ({ boss, selection, disabled = false, disabledReason }: Props) => {
  const toggleBoss = useBossIncomeStore((s) => s.toggleBoss);
  const setDifficulty = useBossIncomeStore((s) => s.setDifficulty);
  const setPartySize = useBossIncomeStore((s) => s.setPartySize);

  const enabled = selection?.enabled ?? false;
  // 아직 선택된 난이도가 없으면 UI 에선 첫 번째 제공 난이도를 "미리보기" 로 보여준다.
  const availableDifficulties = BOSS_DIFFICULTIES.filter((d) => BOSS_CRYSTAL_PRICES[boss]?.[d] !== undefined);
  const previewDifficulty: BossDifficulty = selection?.difficulty ?? availableDifficulties[availableDifficulties.length - 1];
  // 보스별 인게임 파티 상한 — 일부 보스는 3인까지만 허용. effectivePartySize 가 이 값으로 clamp 한다.
  const bossMaxParty = getBossMaxPartySize(boss);
  const partySizeOptions = useMemo(
    () => Array.from({ length: bossMaxParty - MIN_PARTY_SIZE + 1 }, (_, i) => i + MIN_PARTY_SIZE),
    [bossMaxParty]
  );
  const partySize = effectivePartySize(selection, boss);
  const fullPrice = BOSS_CRYSTAL_PRICES[boss]?.[previewDifficulty] ?? 0;
  // 파티원 수에 따라 사용자가 실제로 받는 분배 수익(메소가 1/n 로 분배).
  const sharePrice = Math.floor(fullPrice / partySize);
  const image = BOSS_IMAGES[boss];

  return (
    <div
      title={disabled ? disabledReason : undefined}
      className={`flex items-center gap-3 max-[600px]:gap-2 px-3 max-[600px]:px-2 py-1 rounded-lg border transition-colors overflow-x-auto
        ${
          enabled
            ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300/70 dark:border-emerald-700/50"
            : disabled
            ? "bg-white dark:bg-color-900/40 border-slate-200/60 dark:border-white/5 opacity-45"
            : "bg-white dark:bg-color-900/40 border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
        }`}
    >
      {/* 체크박스 */}
      <label className={`flex items-center select-none shrink-0 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
        <input
          type="checkbox"
          checked={enabled}
          disabled={disabled}
          onChange={() => {
            if (disabled) return;
            toggleBoss(boss);
          }}
          className={`w-5 h-5 accent-emerald-500 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          aria-label={`${boss} 선택`}
        />
      </label>

      {/* 보스 이미지 */}
      <div
        className={`relative w-10 h-10 max-[600px]:w-8 max-[600px]:h-8 rounded-md overflow-hidden shrink-0
          border border-slate-200 dark:border-white/10
          ${enabled ? "" : "opacity-70 grayscale-[0.4]"}`}
      >
        {image && <Image src={image} alt={boss} fill sizes="40px" className="object-cover" unoptimized />}
      </div>

      {/* 보스 이름 — 남는 공간 차지 */}
      <span
        className={`flex-1 min-w-0 text-[14px] max-[600px]:text-[13px] font-bold text-gray-800 dark:text-gray-100 truncate
          ${enabled ? "" : "opacity-70"}`}
      >
        {boss}
      </span>

      {/* 난이도 pill 라디오 */}
      <div
        role="radiogroup"
        aria-label={`${boss} 난이도 선택`}
        className="flex items-center gap-0.5 p-0.5 rounded-md bg-slate-100 dark:bg-color-950/60 border border-slate-200 dark:border-white/5 shrink-0"
      >
        {availableDifficulties.map((difficulty) => {
          const isSelected = difficulty === previewDifficulty;
          const styles = DIFFICULTY_STYLES[difficulty];
          return (
            <button
              key={difficulty}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setDifficulty(boss, difficulty)}
              className={`px-2 max-[600px]:px-1.5 py-0.5 rounded text-[12px] max-[600px]:text-[11px] font-semibold transition-colors
                ${isSelected ? styles.active : styles.idle}`}
              title={`${BOSS_DIFFICULTY_LABEL[difficulty]} · ${(BOSS_CRYSTAL_PRICES[boss]?.[difficulty] ?? 0).toLocaleString()} 메소`}
            >
              {BOSS_DIFFICULTY_LABEL[difficulty]}
            </button>
          );
        })}
      </div>

      {/* 파티원 수 — 메소가 1/n 로 분배됨. 활성 상태가 아니어도 미리 설정 가능. */}
      <div className="shrink-0 w-[60px] max-[600px]:w-[52px] flex justify-end">
        <select
          aria-label={`${boss} 파티원 수`}
          value={partySize}
          onChange={(e) => setPartySize(boss, Number(e.target.value))}
          disabled={disabled}
          title={partySize > 1 ? `파티 ${partySize}명 — 메소가 1/${partySize}로 분배됩니다` : "솔로 클리어 (분배 없음)"}
          className={`text-[12px] max-[600px]:text-[11px] font-bold tabular-nums
            px-1.5 py-0.5 rounded
            bg-white dark:bg-color-900
            border border-slate-200 dark:border-white/10
            text-gray-700 dark:text-gray-200
            cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-600
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {partySizeOptions.map((n) => (
            <option key={n} value={n}>
              {n}명
            </option>
          ))}
        </select>
      </div>

      {/* 가격 (파티원 수에 따라 1/n 분배된 실수령액) */}
      <div className="flex flex-col items-end shrink-0 min-w-[96px] max-[600px]:min-w-[76px]">
        <span
          className={`text-[15px] max-[600px]:text-[13px] font-extrabold tabular-nums leading-tight
            ${enabled ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}`}
        >
          {sharePrice.toLocaleString()}
        </span>
        <span className="text-[10px] max-[600px]:text-[9px] text-gray-400 dark:text-gray-500 leading-tight tabular-nums">
          {partySize > 1 ? (
            <>
              <span className="opacity-80">÷{partySize}</span> · {formatKoreanNumber(sharePrice)}
            </>
          ) : (
            formatKoreanNumber(sharePrice)
          )}
        </span>
      </div>
    </div>
  );
};
