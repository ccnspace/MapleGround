import type { TotalItemOption } from "@/types/Equipment";

type EquipOptionList = {
  name: keyof TotalItemOption;
  alias: string;
  isPercent?: boolean;
}[];
export const equipOptionList: EquipOptionList = [
  { name: "str", alias: "STR" },
  { name: "dex", alias: "DEX" },
  { name: "int", alias: "INT" },
  { name: "luk", alias: "LUK" },
  { name: "max_hp_rate", alias: "최대 HP", isPercent: true },
  { name: "max_mp_rate", alias: "최대 MP", isPercent: true },
  { name: "max_hp", alias: "최대 HP" },
  { name: "max_mp", alias: "최대 MP" },
  { name: "attack_power", alias: "공격력" },
  { name: "magic_power", alias: "마력" },
  { name: "armor", alias: "방어력" },
  { name: "speed", alias: "이동속도" },
  { name: "jump", alias: "점프력" },
  { name: "all_stat", alias: "올스탯", isPercent: true },
  {
    name: "boss_damage",
    alias: "보스 몬스터 공격시 데미지",
    isPercent: true,
  },
  {
    name: "ignore_monster_armor",
    alias: "몬스터 방어율 무시",
    isPercent: true,
  },
  { name: "damage", alias: "데미지", isPercent: true },
];
