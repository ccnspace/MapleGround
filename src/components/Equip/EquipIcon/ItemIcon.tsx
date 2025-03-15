import { ItemEquipment } from "@/types/Equipment";
import Image from "next/image";

export const ItemIcon = ({ item }: { item: ItemEquipment }) => (
  <Image
    src={item?.item_icon}
    alt={item?.item_equipment_part}
    unoptimized
    width={52}
    height={60}
    style={{ width: "auto", height: "auto" }}
  />
);
