export type SetEffect = {
  set_effect: SetEffectItem[];
};

export type SetEffectItem = {
  set_name: string;
  total_set_count: number;
  set_effect_info: SetEffectInfoOption[];
  set_option_full: SetEffectInfoOption[];
};

type SetEffectInfoOption = {
  set_count: number;
  set_option: string;
};
