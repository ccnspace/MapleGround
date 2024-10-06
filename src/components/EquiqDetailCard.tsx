import type { ItemEquipment } from "@/types/Equipment";
import Image from "next/image";
import { EquipOptionBuilder } from "@/utils/EquipmentOptionBuilder";
import { Fragment } from "react";
import { StarIcon } from "./svg/StarIcon";

type EquipValueProps = {
  equipData: ItemEquipment;
  name: string;
  isPercentage?: boolean;
};
type Options = {
  [key: string]: string | number;
};
const EquipDetailValue = (props: EquipValueProps) => {
  const { equipData, name, isPercentage = false } = props;
  const baseOption = equipData.item_base_option as Options;
  const addOption = equipData.item_add_option as Options;
  const etcOption = equipData.item_etc_option as Options;
  const starforceOption = equipData.item_starforce_option as Options;

  const baseValue = baseOption[name] as string;
  const addValue = addOption[name] as string;
  const etcValue = etcOption[name] as string;
  const starforceValue = starforceOption[name] as string;

  const element = new EquipOptionBuilder(isPercentage)
    .applyBaseOption(baseValue)
    .applyAddOption(addValue)
    .applyEtcOption(etcValue)
    .applyStarforceOption(starforceValue)
    .build();

  return (
    <>
      {"("}
      {element?.map((_element, i) => (
        <Fragment key={i}>{_element}</Fragment>
      ))}
      {")"}
    </>
  );
};

type Props = {
  equipData: ItemEquipment;
};
export const EquipDetailCard = ({ equipData }: Props) => {
  const isAmazingForce = equipData.starforce_scroll_flag === "사용";
  const showStarforceBadge =
    !!equipData.starforce && equipData.starforce !== "0";

  return (
    <div
      className="flex flex-col min-w-80  max-w-80
     bg-slate-950/80 dark:bg-[#121212]/80 
     border border-gray-700
     rounded-lg px-5 pt-4 pb-4"
    >
      {/* title */}
      {showStarforceBadge && (
        <div
          className={`flex justify-center items-center font-bold text-sm ${
            isAmazingForce ? "text-sky-400" : "text-yellow-400"
          }`}
        >
          <StarIcon isAmazingForce={isAmazingForce} />
          {` x ${equipData.starforce}`}
        </div>
      )}
      <p className="flex justify-center text-white text-lg font-medium">
        {equipData.item_name}
      </p>
      {/* item icon, item 간략정보*/}
      <div className="flex flex-row items-center gap-2">
        <div
          className="flex items-center justify-center rounded-lg
          mt-5 min-w-[100px] min-h-[100px]
        bg-gray-600 dark:bg-gray-800 pt-3 pb-3 px-3"
        >
          <Image
            src={equipData.item_icon}
            unoptimized
            style={{
              imageRendering: "pixelated",
              height: "60px",
              width: "auto",
            }}
            width={60}
            height={60}
            alt={equipData.item_name}
          />
        </div>
        <div className="flex text-white text-xs font-light">
          <p>REQ LEVEL: </p>
        </div>
      </div>
      {/* 아이템 디테일 */}
      <p className="flex mt-4 mb-4 border-b-2 border-dotted border-b-gray-600"></p>
      <div className="flex text-[12px] font-light flex-col">
        <p className="text-white">
          장비분류: <span>{equipData.item_equipment_part}</span>
        </p>
        <p className="text-white">
          STR: {`+${equipData.item_total_option.str} `}
          <EquipDetailValue equipData={equipData} name="str" />
        </p>
        <p className="text-white">
          DEX: {`+${equipData.item_total_option.dex} `}
          <EquipDetailValue equipData={equipData} name="dex" />
        </p>
        <p className="text-white">
          INT: {`+${equipData.item_total_option.int} `}
          <EquipDetailValue equipData={equipData} name="int" />
        </p>
        <p className="text-white">
          LUK: {`+${equipData.item_total_option.luk} `}
          <EquipDetailValue equipData={equipData} name="luk" />
        </p>
        <p className="text-white">
          최대 HP: {`+${equipData.item_total_option.max_hp} `}
          <EquipDetailValue equipData={equipData} name="max_hp" />
        </p>
        <p className="text-white">
          최대 MP: {`+${equipData.item_total_option.max_mp} `}
          <EquipDetailValue equipData={equipData} name="max_mp" />
        </p>
        <p className="text-white">
          최대 HP: {`+${equipData.item_total_option.max_hp_rate}%`}
        </p>
        <p className="text-white">
          최대 MP: {`+${equipData.item_total_option.max_mp_rate}%`}
        </p>
        <p className="text-white">
          공격력: {`+${equipData.item_total_option.attack_power} `}
          <EquipDetailValue equipData={equipData} name="attack_power" />
        </p>
        <p className="text-white">
          마력: {`+${equipData.item_total_option.magic_power} `}
          <EquipDetailValue equipData={equipData} name="magic_power" />
        </p>
        <p className="text-white">
          방어력: {`+${equipData.item_total_option.armor} `}
          <EquipDetailValue equipData={equipData} name="armor" />
        </p>
        <p className="text-white">
          이동속도: {`+${equipData.item_total_option.armor} `}
          <EquipDetailValue equipData={equipData} name="armor" />
        </p>
        <p className="text-white">
          점프력: {`+${equipData.item_total_option.armor} `}
          <EquipDetailValue equipData={equipData} name="armor" />
        </p>
        <p className="text-white">
          올스탯: {`+${equipData.item_total_option.all_stat}% `}
          <EquipDetailValue
            equipData={equipData}
            name="all_stat"
            isPercentage
          />
        </p>
      </div>
    </div>
  );
};
