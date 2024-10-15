export type StatName =
  | "전투력"
  | "데미지"
  | "보스 몬스터 데미지"
  | "최종 데미지"
  | "방어율 무시"
  | "크리티컬 확률"
  | "스탠스"
  | "크리티컬 데미지"
  | "이동속도"
  | "점프력"
  | "아이템 드롭률"
  | "메소 획득량"
  | "버프 지속시간"
  | "재사용 대기시간 감소 (초)"
  | "재사용 대기시간 감소 (%)"
  | "재사용 대기시간 미적용"
  | "속성 내성 무시"
  | "상태이상 추가 데미지"
  | "무기 숙련도"
  | "추가 경험치 획득"
  | "소환수 지속시간 증가"
  | "최소 스탯공격력"
  | "최대 스탯공격력"
  | "방어력"
  | "상태이상 내성"
  | "스타포스"
  | "아케인포스"
  | "어센틱포스"
  | "STR"
  | "DEX"
  | "INT"
  | "LUK"
  | "HP"
  | "MP"
  | "AP 배분 STR"
  | "AP 배분 DEX"
  | "AP 배분 INT"
  | "AP 배분 LUK"
  | "AP 배분 HP"
  | "AP 배분 MP"
  | "공격 속도"
  | "공격력"
  | "마력";

type Stat = {
  stat_name: StatName;
  stat_value: string | null;
};

export type CharacterStat = {
  date: string;
  character_class: string;
  final_stat: Stat[];
  remain_ap: number;
};
