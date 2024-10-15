"use client";

import { useCharacterInfo } from "@/hooks/useCharacterInfo";
import { type PropsWithChildren, useMemo } from "react";
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
const importantStats: Record<string, string[]> = {
  STR: [
    "히어로",
    "팔라딘",
    "다크나이트",
    "소울마스터",
    "미하일",
    "블래스터",
    "데몬 슬레이어",
    "아란",
    "카이저",
    "아델",
    "제로",
    "바이퍼",
    "캐논슈터",
    "스트라이커",
    "은월",
    "아크",
    "제논",
  ],
  DEX: [
    "보우마스터",
    "신궁",
    "메카닉",
    "패스파인더",
    "윈드브레이커",
    "와일드헌터",
    "카인",
    "메르세데스",
    "캡틴",
    "제논",
    "엔젤릭버스터",
  ],
  INT: [
    "아크메이지(불,독)",
    "아크메이지(썬,콜)",
    "비숍",
    "플레임위자드",
    "배틀메이지",
    "루미너스",
    "에반",
    "일리움",
    "라라",
    "키네시스",
  ],
  LUK: [
    "나이트로드",
    "섀도어",
    "듀얼블레이드",
    "나이트워커",
    "제논",
    "팬텀",
    "카데나",
    "칼리",
    "호영",
  ],
  "버프 지속시간": [
    "아크메이지(썬,콜)",
    "비숍",
    "아크메이지(불,독)",
    "카이저",
    "루미너스",
  ],
  HP: ["데몬어벤져"],
};
const getStatItemStyle = (jobName: string, valueName: string) => {
  if (importantStats[valueName]?.includes(jobName)) {
    return "font-bold bg-slate-500/70 text-white dark:bg-black/30";
  }
  return "font-bold";
};

type StatItemProps = {
  statName: StatName;
  jobName: string;
  statObject: Record<StatName, string>;
  className?: string;
};
const StatItem = ({
  statName,
  jobName,
  statObject,
  className,
  children,
}: PropsWithChildren<StatItemProps>) => (
  <div
    className={`${getStatItemStyle(jobName, statName)} 
              flex items-center bg-slate-400/25 rounded-md px-1.5 pt-1.5 pb-1.5 ${className}`}
  >
    <span className="font-bold">{statName}</span>
    <span className="font-medium px-1 ml-auto">{statObject[statName]}</span>
    {children}
  </div>
);

export const StatContainer = () => {
  const { characterInfo } = useCharacterInfo();
  const { final_stat = [] } = characterInfo?.stat || {};
  const jobName = characterInfo?.basic?.character_class || "";

  const statObject = useMemo(() => {
    const object = {} as Record<StatName, string>;
    return final_stat.reduce((acc, cur) => {
      const { stat_name, stat_value } = cur;
      const unit = getUnit(stat_name);
      const statValueNum = stat_value !== null ? parseInt(stat_value) : 0;
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
      {characterInfo?.stat ? (
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
            <StatItem
              statName="STR"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="DEX"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="INT"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="LUK"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem statName="HP" statObject={statObject} jobName={jobName} />
            <StatItem statName="MP" statObject={statObject} jobName={jobName} />
            <StatItem
              statName="최종 데미지"
              statObject={statObject}
              jobName={jobName}
              className="col-span-2"
            />
            <StatItem
              statName="데미지"
              statObject={statObject}
              jobName={jobName}
              className="col-span-2"
            />
            <StatItem
              statName="보스 몬스터 데미지"
              statObject={statObject}
              jobName={jobName}
              className="col-span-2"
            />
            <StatItem
              statName="방어율 무시"
              statObject={statObject}
              jobName={jobName}
              className="col-span-2"
            />
            <StatItem
              statName="버프 지속시간"
              statObject={statObject}
              jobName={jobName}
              className="col-span-2"
            />
            <StatItem
              statName="공격력"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="마력"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="크리티컬 데미지"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="크리티컬 확률"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="아케인포스"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="어센틱포스"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="공격 속도"
              statObject={statObject}
              jobName={jobName}
            >
              <span className="text-xs font-bold text-black/50 dark:text-white/50">
                {"(최대 8)"}
              </span>
            </StatItem>
            <StatItem
              statName="상태이상 내성"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="스탠스"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="방어력"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="이동속도"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="점프력"
              statObject={statObject}
              jobName={jobName}
            />
            <StatItem
              statName="아이템 드롭률"
              statObject={statObject}
              jobName={jobName}
              className="bg-lime-400/40"
            />
            <StatItem
              statName="메소 획득량"
              statObject={statObject}
              jobName={jobName}
              className="bg-yellow-400/30"
            />
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
