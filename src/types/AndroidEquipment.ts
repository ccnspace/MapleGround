import { CashItemOption } from "./CashEquipment";

type AndroidCashItem = {
  cash_item_equipment_part: string;
  cash_item_equipment_slot: string;
  cash_item_name: string;
  cash_item_icon: string;
  cash_item_description: string;
  cash_item_option: CashItemOption[];
  date_expire: string;
  date_option_expire: string;
  cash_item_label: string;
  cash_item_coloring_prism: {
    /** 색상 범위 */
    color_range: string;
    /** 색조 */
    hue: number;
    /** 채도 */
    satruation: number;
    /** 명도 */
    value: number;
  };
  android_item_gender: string;
};

export type AndroidEquipment = {
  date: string | null;
  android_name: string | null;
  android_nickname: string | null;
  android_icon: string | null;
  android_description: string | null;
  android_hair: {
    hair_name: string | null;
    base_color: string | null;
    mix_color: string | null;
    mix_rate: string;
  };
  android_face: {
    face_name: string | null;
    base_color: string | null;
    mix_color: string | null;
    mix_rate: string;
  };
  android_skin: string | null;
  android_cash_item_equipment: AndroidCashItem[];
  android_ear_sensor_clip_flag: string | null;
  android_gender: string | null;
  android_grade: string | null;
  android_non_humanoid_flag: string | null;
  android_shop_usable_flag: string | null;
  preset_no: number;
  /** TODO: 안드로이드 프리셋 지원 */
};
