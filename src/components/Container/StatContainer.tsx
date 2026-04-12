"use client";

import { useCharacterInfo } from "@/hooks/useCharacterInfo";
import { type PropsWithChildren, useMemo } from "react";
import { StatName } from "@/types/CharacterStat";
import { ContainerWrapper } from "./ContainerWrapper";

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
export const importantStats: Record<string, string[]> = {
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
    "캐논마스터",
    "스트라이커",
    "은월",
    "아크",
    "제논",
    "렌",
  ],
  DEX: ["보우마스터", "신궁", "메카닉", "패스파인더", "윈드브레이커", "와일드헌터", "카인", "메르세데스", "캡틴", "제논", "엔젤릭버스터"],
  INT: ["아크메이지(불,독)", "아크메이지(썬,콜)", "비숍", "플레임위자드", "배틀메이지", "루미너스", "에반", "일리움", "라라", "키네시스"],
  LUK: ["나이트로드", "섀도어", "듀얼블레이더", "나이트워커", "제논", "팬텀", "카데나", "칼리", "호영"],
  "버프 지속시간": ["아크메이지(썬,콜)", "비숍", "아크메이지(불,독)", "카이저", "루미너스"],
  HP: ["데몬어벤져"],
  공격력: [
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
    "캐논마스터",
    "스트라이커",
    "은월",
    "아크",
    "제논",
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
    "나이트로드",
    "섀도어",
    "듀얼블레이더",
    "나이트워커",
    "제논",
    "팬텀",
    "카데나",
    "칼리",
    "호영",
    "렌",
  ],
  마력: ["아크메이지(불,독)", "아크메이지(썬,콜)", "비숍", "플레임위자드", "배틀메이지", "루미너스", "에반", "일리움", "라라", "키네시스"],
};
const mainStats = [
  "최종 데미지",
  "데미지",
  "크리티컬 데미지",
  "아이템 드롭률",
  "메소 획득량",
  "보스 몬스터 데미지",
  "방어율 무시",
  "아케인포스",
  "어센틱포스",
];
const getStatItemStyle = (jobName: string, valueName: string) => {
  if (importantStats[valueName]?.includes(jobName)) {
    return "font-bold text-blue-600 dark:text-sky-400";
  }
  if (mainStats.includes(valueName)) {
    return "font-bold text-black dark:text-white";
  }
  return "font-bold text-slate-500";
};

type StatItemProps = {
  statName: StatName;
  jobName: string;
  statObject: Record<StatName, string>;
  className?: string;
};
const StatItem = ({ statName, jobName, statObject, className, children }: PropsWithChildren<StatItemProps>) => (
  <div
    className={`${getStatItemStyle(
      jobName,
      statName
    )} flex items-center px-1 py-1 border-b border-dashed border-b-slate-300 dark:border-b-white/15 ${className}`}
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
      const formattedValue = stat_name !== "전투력" ? statValueNum.toLocaleString() : statValueNum;
      acc[stat_name] = `${formattedValue}${unit}`;
      return acc;
    }, object);
  }, [final_stat]);

  return (
    <ContainerWrapper className="h-full !min-w-0" innerClassName="h-full overflow-y-auto">
      {characterInfo?.stat ? (
        <div className="flex flex-col gap-3">
          <p
            className="flex font-extrabold text-base mb-2 px-2 pb-0.5 pt-0.5
              border-l-4 border-l-sky-400
             "
          >
            캐릭터 능력치
          </p>

          <div className="grid grid-cols-2 rounded-md px-2 pt-2 pb-3 gap-2 text-sm">
            <div className="flex items-center rounded-md px-1.5 pt-1 pb-1 col-span-2 font-bold bg-slate-400/20">
              <span className="font-extrabold">스탯 공격력</span>
              <span className="font-medium px-1 pt-1 pb-1 ml-auto">
                {`${statObject["최소 스탯공격력"]} ~ ${statObject["최대 스탯공격력"]}`}
              </span>
            </div>
            <StatItem statName="STR" statObject={statObject} jobName={jobName} />
            <StatItem statName="DEX" statObject={statObject} jobName={jobName} />
            <StatItem statName="INT" statObject={statObject} jobName={jobName} />
            <StatItem statName="LUK" statObject={statObject} jobName={jobName} />
            <StatItem statName="HP" statObject={statObject} jobName={jobName} />
            <StatItem statName="MP" statObject={statObject} jobName={jobName} />
            <StatItem statName="최종 데미지" statObject={statObject} jobName={jobName} className="col-span-2" />
            <StatItem statName="데미지" statObject={statObject} jobName={jobName} className="col-span-2" />
            <StatItem statName="보스 몬스터 데미지" statObject={statObject} jobName={jobName} className="col-span-2" />
            <StatItem statName="방어율 무시" statObject={statObject} jobName={jobName} className="col-span-2" />
            <StatItem statName="버프 지속시간" statObject={statObject} jobName={jobName} className="col-span-2" />
            <StatItem statName="공격력" statObject={statObject} jobName={jobName} />
            <StatItem statName="마력" statObject={statObject} jobName={jobName} />
            <StatItem statName="크리티컬 데미지" statObject={statObject} jobName={jobName} />
            <StatItem statName="크리티컬 확률" statObject={statObject} jobName={jobName} />
            <StatItem statName="아케인포스" statObject={statObject} jobName={jobName} />
            <StatItem statName="어센틱포스" statObject={statObject} jobName={jobName} />
            <StatItem statName="공격 속도" statObject={statObject} jobName={jobName}>
              <span className="text-xs font-bold text-black/50 dark:text-white/50">{"(최대 8)"}</span>
            </StatItem>
            <StatItem statName="상태이상 내성" statObject={statObject} jobName={jobName} />
            <StatItem statName="스탠스" statObject={statObject} jobName={jobName} />
            <StatItem statName="방어력" statObject={statObject} jobName={jobName} />
            <StatItem statName="이동속도" statObject={statObject} jobName={jobName} />
            <StatItem statName="점프력" statObject={statObject} jobName={jobName} />
            <StatItem statName="아이템 드롭률" statObject={statObject} jobName={jobName} />
            <StatItem statName="메소 획득량" statObject={statObject} jobName={jobName} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="font-bold text-sm text-slate-950/50 dark:text-white/60">여기에 캐릭터의 전투 정보가 표시됩니다.</p>
        </div>
      )}
    </ContainerWrapper>
  );
};
