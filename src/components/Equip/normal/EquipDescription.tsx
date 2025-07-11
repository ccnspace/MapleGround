import Image from "next/image";
import { Divider } from "../Divider";

type Props = {
  item_icon: string;
  item_name: string;
  baseLevel?: number;
  description?: string;
  scroll_upgrade?: string;
};

// TODO: 추옵 정보/주흔 작 등 다양한 정보를 간략화하여 제공
export const EquipDescription = ({ item_icon, item_name, baseLevel, scroll_upgrade, description }: Props) => {
  const itemName = !!scroll_upgrade && scroll_upgrade !== "0" ? `${item_name} (+${scroll_upgrade})` : item_name;
  return (
    <>
      <p className="flex justify-center text-white text-base font-medium">{itemName}</p>
      <div className="flex flex-row items-center gap-2">
        <div
          className="flex items-center justify-center rounded-lg
          min-w-[72px] min-h-[72px]
        bg-gray-600 dark:bg-gray-800 mt-1 pt-3 pb-3 px-3"
        >
          <div style={{ position: "relative", width: "52px", aspectRatio: "4 / 3" }}>
            <Image src={item_icon} unoptimized fill style={{ objectFit: "contain" }} alt={item_name} />
          </div>
        </div>
        {!!baseLevel && <div className="flex items-start text-xs text-white">· REQ LEVEL: {baseLevel}</div>}
      </div>
      {!!description && (
        <div className="flex text-xs flex-col gap-[2px]">
          <Divider />
          <p className="text-xs text-white whitespace-pre-wrap">{description}</p>
        </div>
      )}
    </>
  );
};
