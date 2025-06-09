import type { AndroidEquipment } from "@/types/AndroidEquipment";
import { EquipDescription } from "../normal/EquipDescription";

type Props = {
  item: AndroidEquipment;
};
export const AndroidContainer = ({ item }: Props) => {
  const { android_name, android_icon, android_description } = item || {};

  return (
    <div>
      <EquipDescription item_icon={android_icon} item_name={android_name} description={android_description} />
    </div>
  );
};
