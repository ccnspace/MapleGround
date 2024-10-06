import { CashItemOption } from "./CashEquipment";

type PetItem = {
  item_name: string;
  item_icon: string;
  item_description: string;
  item_option: CashItemOption[];
  scroll_upgrade: number;
  scroll_upgradable: number;
  item_shape: string;
  item_shape_icon: string;
};

type PetSkill = {
  skill_1: string | null;
  skill_1_icon: string | null;
  skill_2: string | null;
  skill_2_icon: string | null;
};

export type PetEquipment = {
  date: string | null;
  pet_1_icon: string | null;
  pet_1_description: string | null;
  pet_1_equipment: PetItem | null;
  pet_1_auto_skill: PetSkill | null;
  pet_1_pet_type: string | null;
  pet_1_skill: string[];
  pet_1_date_expire: string | null;
  pet_1_appearance: string | null;
  pet_1_appearance_icon: string | null;

  pet_2_icon: string | null;
  pet_2_description: string | null;
  pet_2_equipment: PetItem | null;
  pet_2_auto_skill: PetSkill | null;
  pet_2_pet_type: string | null;
  pet_2_skill: string[];
  pet_2_date_expire: string | null;
  pet_2_appearance: string | null;
  pet_2_appearance_icon: string | null;

  pet_3_icon: string | null;
  pet_3_description: string | null;
  pet_3_equipment: PetItem | null;
  pet_3_auto_skill: PetSkill | null;
  pet_3_pet_type: string | null;
  pet_3_skill: string[];
  pet_3_date_expire: string | null;
  pet_3_appearance: string | null;
  pet_3_appearance_icon: string | null;
};
