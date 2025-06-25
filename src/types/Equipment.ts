type ItemOption = {
  str: string;
  dex: string;
  int: string;
  luk: string;
  max_hp: string;
  max_mp: string;
  attack_power: string;
  magic_power: string;
  armor: string;
  speed: string;
  jump: string;
  boss_damage: string;
  ignore_monster_armor: string;
  all_stat: string;
  max_hp_rate: string;
  max_mp_rate: string;
};

type BaseItemOption = ItemOption & { base_equipment_level: number };
export type TotalItemOption = ItemOption & {
  damage: string;
  equipment_level_decrease: number;
};
export type ExceptionalOption = {
  str: string;
  dex: string;
  int: string;
  luk: string;
  max_hp: string;
  max_mp: string;
  attack_power: string;
  magic_power: string;
  exceptional_upgrade: number;
};
type ItemAddOption = {
  str: string;
  dex: string;
  int: string;
  luk: string;
  max_hp: string;
  max_mp: string;
  attack_power: string;
  magic_power: string;
  armor: string;
  speed: string;
  jump: string;
  boss_damage: string;
  damage: string;
  all_stat: string;
  equipment_level_decrease: number;
};
type ItemEtcOption = {
  str: string;
  dex: string;
  int: string;
  luk: string;
  max_hp: string;
  max_mp: string;
  attack_power: string;
  magic_power: string;
  armor: string;
  speed: string;
  jump: string;
};
type StarforceOption = ItemEtcOption;

export type ItemPotentialGrade = "레어" | "에픽" | "유니크" | "레전드리";

export type ItemEquipment = {
  item_equipment_part: string;
  item_equipment_slot: string;
  item_name: string;
  item_icon: string;
  item_description: string | null;
  item_shape_name: string;
  item_shape_icon: string;
  item_gender: string | null;
  item_total_option: TotalItemOption;
  item_base_option: BaseItemOption;
  potential_option_grade: ItemPotentialGrade | null;
  additional_potential_option_grade: ItemPotentialGrade | null;
  /** 잠재능력 봉인 여부 */
  potential_option_flag: string;
  potential_option_1: string;
  potential_option_2: string;
  potential_option_3: string;
  /** 에디셔널 잠재능력 봉인 여부 */
  additional_potential_option_flag: string;
  additional_potential_option_1: string;
  additional_potential_option_2: string;
  additional_potential_option_3: string;
  equipment_level_increase: number;
  item_exceptional_option: ExceptionalOption;
  /** 추가옵션 */
  item_add_option: ItemAddOption;
  growth_exp: number;
  growth_level: number;
  scroll_upgrade: string;
  cuttable_count: string;
  golden_hammer_flag: string;
  scroll_resilience_count: string;
  scroll_upgradeable_count: string;
  soul_name: string | null;
  soul_option: string | null;
  /** 주문의 흔적 */
  item_etc_option: ItemEtcOption;
  starforce: string;
  starforce_scroll_flag: string;
  item_starforce_option: StarforceOption;
  special_ring_level: number;
  date_expire: null;
};

export type EquipmentInfo = {
  date: string | null;
  character_gender: string;
  character_class: string;
  preset_no: number;
  item_equipment: ItemEquipment[];
  item_equipment_preset_1: ItemEquipment[];
  item_equipment_preset_2: ItemEquipment[];
  item_equipment_preset_3: ItemEquipment[];
  title: {
    title_name: string;
    title_icon: string;
    title_description: string;
    date_expire: string | null;
    date_option_expire: string | null;
  };
  dragon_equipment: [];
  mechanic_equipment: [];
};

export interface ComparisonStats {
  starforce: number;
  ignore_monster_armor: number;
  critical_damage_rate: number;
  boss_damage_rate: number;
  str?: number;
  dex?: number;
  int?: number;
  luk?: number;
  max_hp?: number;
  max_hp_rate?: number;
  magic_power?: number;
  attack_power?: number;
  str_rate?: number;
  dex_rate?: number;
  int_rate?: number;
  luk_rate?: number;
  magic_power_rate?: number;
  attack_power_rate?: number;
  [key: string]: number | undefined;
}
