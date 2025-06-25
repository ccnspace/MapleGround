export const STAT_LABELS: Record<string, string> = {
  // 기본 스탯
  str: "STR",
  dex: "DEX",
  int: "INT",
  luk: "LUK",
  max_hp: "HP",

  // 비율 스탯
  str_rate: "STR %",
  dex_rate: "DEX %",
  int_rate: "INT %",
  luk_rate: "LUK %",
  max_hp_rate: "HP %",
  magic_power_rate: "마력 %",
  attack_power_rate: "공격력 %",

  // 전투 관련 스탯
  ignore_monster_armor: "방어율 무시",
  critical_damage_rate: "크리티컬 데미지",
  boss_damage_rate: "보스 데미지",
  magic_power: "마력",
  attack_power: "공격력",
  starforce: "스타포스",
} as const;

// 스탯 표시 순서 (공통 스탯 먼저, 그 다음 일반 스탯)
export const STAT_DISPLAY_ORDER: string[] = [
  "starforce",
  "ignore_monster_armor",
  "critical_damage_rate",
  "boss_damage_rate",
  "str",
  "dex",
  "int",
  "luk",
  "max_hp",
  "magic_power",
  "attack_power",
  "str_rate",
  "dex_rate",
  "int_rate",
  "luk_rate",
  "max_hp_rate",
  "magic_power_rate",
  "attack_power_rate",
];
