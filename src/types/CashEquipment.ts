export type CashItemOption = {
  option_type: string;
  option_value: string;
};

export type CashItemEquipment = {
  cash_item_equipment_part: string;
  cash_item_equipment_slot: string;
  cash_item_name: string;
  cash_item_icon: string;
  cash_item_description: string | null;
  cash_item_option: CashItemOption[];
  date_expire: string | null;
  date_option_expire: string;
  cash_item_label: string;
  cash_item_coloring_prism: string | null;
  item_gender: string | null;
};

export type CashEquipmentInfo = {
  date: string | null;
  character_gender: string;
  character_class: string;
  character_look_mode: string;
  preset_no: number;
  cash_item_equipment_base: CashItemEquipment[];
  cash_item_equipment_preset_1: CashItemEquipment[];
  cash_item_equipment_preset_2: CashItemEquipment[];
  cash_item_equipment_preset_3: CashItemEquipment[];
  additional_cash_item_equipment_base: CashItemEquipment[];
  additional_cash_item_equipment_preset_1: CashItemEquipment[];
  additional_cash_item_equipment_preset_2: CashItemEquipment[];
  additional_cash_item_equipment_preset_3: CashItemEquipment[];
};
