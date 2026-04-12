"use client";

import { useCharacterInfo } from "@/hooks/useCharacterInfo";
import { formatKoreanNumber } from "@/utils/formatKoreanNum";
import { useMemo } from "react";

const getCombatPowerBgColor = (combatPower: number) => {
  if (combatPower < 50_000_000) return "bg-slate-500";
  if (combatPower < 100_000_000) return "bg-gradient-to-r from-gray-800/80 to-sky-600/80";
  if (combatPower < 400_000_000) return "bg-gradient-to-r from-lime-500/90 to-cyan-600/90";
  if (combatPower < 800_000_000) return "bg-gradient-to-r from-cyan-400/90 via-blue-600/90 to-indigo-900/90";
  return "bg-gradient-to-r from-yellow-500/80 via-red-600/80 to-purple-600/90";
};

const getCombatDescription = (combatPower: number) => {
  if (combatPower < 30_000_000) return "";
  if (combatPower < 90_000_000) return "군단장에 대항하는 자";
  if (combatPower < 150_000_000) return "검은마법사에 대항하는 자";
  if (combatPower < 300_000_000) return "그란디스 사도와 대항하는 자";
  if (combatPower < 500_000_000) return "그란디스 사도들이 무서워하는 자";
  if (combatPower < 800_000_000) return "극한의 메이플러버";
  return "💗메이플의 전설 그 자체💗";
};

export const HeroPowerCard = () => {
  const { characterInfo } = useCharacterInfo();
  const { final_stat = [] } = characterInfo?.stat || {};

  const combatPower = useMemo(() => {
    const stat = final_stat.find((s) => s.stat_name === "전투력");
    return stat?.stat_value ? parseInt(stat.stat_value) : 0;
  }, [final_stat]);

  if (!characterInfo?.stat) return null;

  const formatted = formatKoreanNumber(combatPower);
  const bgColor = getCombatPowerBgColor(combatPower);
  const description = getCombatDescription(combatPower);

  return (
    <div
      className={`[grid-area:hero] rounded-xl ${bgColor} px-6 py-5 flex items-center justify-between
        max-[600px]:flex-col max-[600px]:gap-2 max-[600px]:py-4`}
    >
      <div className="flex items-center gap-4">
        <span className="font-bold text-lg text-white/80">전투력</span>
        <span className="font-extrabold text-4xl text-white [text-shadow:_2px_3px_6px_rgb(0_0_0/_0.3)] max-[600px]:text-3xl">
          {formatted}
        </span>
      </div>
      {!!description && (
        <span className="text-white/90 font-semibold text-sm bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5">
          {description}
        </span>
      )}
    </div>
  );
};
