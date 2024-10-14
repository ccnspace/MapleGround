"use client";

import { useCharacterInfo } from "@/hooks/useCharacterInfo";
import { useMemo } from "react";
import { formatKoreanNumber } from "@/utils/formatKoreanNum";
import { StatName } from "@/types/CharacterStat";

const getCombatPowerBgColor = (combatPower: number) => {
  if (combatPower < 50_000_000) {
    return "bg-slate-500";
  }
  if (combatPower < 100_000_000) {
    return "bg-gradient-to-r from-gray-800/80 to-sky-600/80";
  }
  if (combatPower < 400_000_000) {
    return "bg-gradient-to-r from-lime-500/90 to-cyan-600/90";
  }
  if (combatPower < 800_000_000) {
    return "bg-gradient-to-r from-cyan-400/90 via-blue-600/90 to-indigo-900/90";
  }
  return "bg-gradient-to-r from-yellow-500/80 via-red-600/80 to-purple-600/90";
};

const getCombatDescription = (combatPower: number) => {
  if (combatPower < 30_000_000) return "";
  if (combatPower < 90_000_000) {
    return "군단장에 대항하는 자";
  }
  if (combatPower < 150_000_000) {
    return "검은마법사에 대항하는 자";
  }
  if (combatPower < 300_000_000) {
    return "그란디스 사도와 대항하는 자";
  }
  if (combatPower < 500_000_000) {
    return "그란디스 사도들이 무서워하는 자";
  }
  return "💗초 극강의 메이플러버💗";
};

const getUnit = (statName: string) => {
  const percent = [
    "데미지",
    "보스 몬스터 데미지",
    "최종 데미지",
    "방어율 무시",
    "크리티컬 확률",
    "스탠스",
    "크리티컬 데미지",
    "이동속도",
    "점프력",
    "아이템 드롭률",
    "메소 획득량",
    "버프 지속시간",
    "재사용 대기시간 감소 (%)",
    "재사용 대기시간 미적용",
    "속성 내성 무시",
    "상태이상 추가 데미지",
    "무기 숙련도",
    "추가 경험치 획득",
    "소환수 지속시간 증가",
  ];
  const seconds = "재사용 대기시간 감소 (초)";

  if (percent.includes(statName)) return "%";
  if (seconds === statName) return "초";
  return "";
};

// TODO: 직업별로 강조할 스탯 배경색 지정
const getStatItemBgColor = () => {};

export const StatContainer = () => {
  const { stat } = useCharacterInfo();
  const { final_stat = [] } = stat || {};

  const statObject = useMemo(() => {
    const object = {} as Record<StatName, string>;
    return final_stat.reduce((acc, cur) => {
      const { stat_name, stat_value } = cur;
      const unit = getUnit(stat_name);
      const statValueNum = parseInt(stat_value);
      const formattedValue =
        stat_name !== "전투력" ? statValueNum.toLocaleString() : statValueNum;
      acc[stat_name] = `${formattedValue}${unit}`;
      return acc;
    }, object);
  }, [final_stat]);

  const combatPower = parseInt(statObject["전투력"]);
  const formattedCombatPower = formatKoreanNumber(combatPower);
  const combatPowerBgColor = getCombatPowerBgColor(combatPower);
  const combatDescription = getCombatDescription(combatPower);

  return (
    <div
      className="flex shrink-0 min-w-96 flex-col bg-slate-100 dark:bg-[#1f2024] px-3 pt-3 pb-3
      border-2 border-slate-200 dark:border-[#1f2024] rounded-lg gap-1"
    >
      {stat ? (
        <div className="flex flex-col gap-3">
          <p
            className="flex font-extrabold text-base mb-2 px-2 pb-0.5 pt-0.5 
              border-l-4 border-l-sky-400
             "
          >
            캐릭터 능력치
          </p>

          <div className="flex flex-col mb">
            <div
              className={`flex gap-2 justify-center items-center ${combatPowerBgColor}
        px-3 pt-2 pb-2 rounded-lg`}
            >
              <p className="font-bold text-lg text-white">전투력</p>
              <p className="font-extrabold text-3xl text-white [text-shadow:_1px_2px_4px_rgb(0_0_0/_0.4)]">
                {formattedCombatPower}
              </p>
            </div>
            {!!combatDescription && (
              <p className="flex justify-center pt-1 font-bold text-sm text-gray-600">
                {combatDescription}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 bg-slate-400/20 rounded-md px-2 pt-2 pb-3 gap-2 text-sm">
            <div className="flex items-center rounded-md px-1 pt-1 pb-1 col-span-2">
              <span className="font-extrabold">스탯 공격력</span>
              <span className="font-medium px-1 pt-1 pb-1 ml-auto">
                {`${statObject["최소 스탯공격력"]} ~ ${statObject["최대 스탯공격력"]}`}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">STR</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["STR"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">DEX</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["DEX"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">INT</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["INT"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">LUK</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["LUK"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">HP</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["HP"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">MP</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["MP"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5 col-span-2">
              <span className="font-bold">최종 데미지</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["최종 데미지"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5 col-span-2">
              <span className="font-bold">데미지</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["데미지"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5 col-span-2">
              <span className="font-bold">보스 몬스터 데미지</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["보스 몬스터 데미지"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5 col-span-2">
              <span className="font-bold">방어율 무시</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["방어율 무시"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5 col-span-2">
              <span className="font-bold">버프 지속시간</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["버프 지속시간"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">공격력</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["공격력"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">마력</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["마력"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">크리티컬 데미지</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["크리티컬 데미지"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">크리티컬 확률</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["크리티컬 확률"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">아케인포스</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["아케인포스"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">어센틱포스</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["어센틱포스"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="flex font-bold">공격 속도</span>
              <span className="flex font-medium px-1 ml-auto items-center gap-0.5">
                {statObject["공격 속도"]}
                <span className="text-xs font-bold text-black/50 dark:text-white/50">
                  {"(최대 8)"}
                </span>
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">상태이상 내성</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["상태이상 내성"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">스탠스</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["스탠스"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">방어력</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["방어력"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">이동속도</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["이동속도"]}
              </span>
            </div>
            <div className="flex bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">점프력</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["점프력"]}
              </span>
            </div>

            <div className="flex bg-lime-400/30 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">아이템 드롭률</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["아이템 드롭률"]}
              </span>
            </div>
            <div className="flex bg-yellow-400/30 rounded-md px-1.5 pt-1.5 pb-1.5">
              <span className="font-bold">메소 획득량</span>
              <span className="font-medium px-1 ml-auto">
                {statObject["메소 획득량"]}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="font-bold text-sm text-slate-950/50 dark:text-white/60">
            여기에 캐릭터의 전투 정보가 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
};
