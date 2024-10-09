import type { AndroidEquipment } from "@/types/AndroidEquipment";

type Props = {
  item: AndroidEquipment;
};
export const AndroidContainer = ({ item }: Props) => {
  const { android_name, android_icon, android_description } = item;

  return <div>{android_name}</div>;
};
