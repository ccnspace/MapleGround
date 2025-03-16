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

type PetEquipInfo = {
  [key: `pet_${number}_name`]: string | null;
  [key: `pet_${number}_icon`]: string | null;
  [key: `pet_${number}_nickname`]: string | null;
  [key: `pet_${number}_appearance`]: string | null;
  [key: `pet_${number}_appearance_icon`]: string | null;
  [key: `pet_${number}_description`]: string | null;
  [key: `pet_${number}_equipment`]: PetItem | null;
  [key: `pet_${number}_auto_skill`]: PetSkill | null;
  [key: `pet_${number}_pet_type`]: string | null;
  [key: `pet_${number}_skill`]: string[];
  [key: `pet_${number}_date_expire`]: string | null;
};

export type PetEquipment = {
  date: string | null;
} & PetEquipInfo;
