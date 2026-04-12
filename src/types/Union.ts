/** 유니온 블록 좌표 */
type UnionBlockPosition = {
  x: number;
  y: number;
};

/** 유니온 공격대 배치 */
type UnionInnerStat = {
  stat_field_id: string;
  stat_field_effect: string;
};

/** 유니온 블록 정보 */
type UnionBlock = {
  block_type: string;
  block_class: string;
  block_level: string;
  block_control_point: UnionBlockPosition;
  block_position: UnionBlockPosition[] | null;
};

/** 유니온 공격대 프리셋 공통 구조 */
type UnionRaiderPreset = {
  union_raider_stat: string[];
  union_occupied_stat: string[];
  union_inner_stat: UnionInnerStat[];
  union_block: UnionBlock[];
};

/** 유니온 아티팩트 효과 */
type UnionArtifactEffect = {
  name: string;
  level: number;
};

/** 유니온 아티팩트 크리스탈 */
type UnionArtifactCrystal = {
  name: string;
  validity_flag: string;
  date_expire: string | null;
  level: number;
  crystal_option_name_1: string;
  crystal_option_name_2: string;
  crystal_option_name_3: string;
};

/** 유니온 챔피언 휘장 정보 */
type ChampionBadgeInfo = {
  stat: string;
};

/** 유니온 챔피언 상세 정보 */
type UnionChampionInfo = {
  champion_name: string;
  champion_slot: number;
  champion_grade: string;
  champion_class: string;
  champion_badge_info: ChampionBadgeInfo[];
};

// ── 메인 타입 ──

/** /maplestory/v1/user/union */
export type Union = {
  date: string | null;
  union_level: number;
  union_grade: string;
  union_artifact_level: number;
  union_artifact_exp: number;
  union_artifact_point: number;
};

/** /maplestory/v1/user/union-raider */
export type UnionRaider = {
  date: string | null;
  union_raider_stat: string[];
  union_occupied_stat: string[];
  union_inner_stat: UnionInnerStat[];
  union_block: UnionBlock[];
  use_preset_no: number;
  union_raider_preset_1: UnionRaiderPreset;
  union_raider_preset_2: UnionRaiderPreset;
  union_raider_preset_3: UnionRaiderPreset;
  union_raider_preset_4: UnionRaiderPreset;
  union_raider_preset_5: UnionRaiderPreset;
};

/** /maplestory/v1/user/union-artifact */
export type UnionArtifact = {
  date: string | null;
  union_artifact_effect: UnionArtifactEffect[];
  union_artifact_crystal: UnionArtifactCrystal[];
  union_artifact_remain_ap: number;
};

/** /maplestory/v1/user/union-champion */
export type UnionChampion = {
  date: string | null;
  union_champion: UnionChampionInfo[];
  champion_badge_total_info: ChampionBadgeInfo[];
};
