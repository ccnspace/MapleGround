type Stat = {
  stat_name: string;
  stat_value: string;
};

export type CharacterStat = {
  date: string;
  character_class: string;
  final_stat: Stat[];
  remain_ap: number;
};
