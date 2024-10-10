import type { ItemEquipment } from "@/types/Equipment";
import type { Options } from "@/types/Options";
import { EquipOptionBuilder } from "@/utils/EquipmentOptionBuilder";
import { Fragment } from "react";

type EquipValueProps = {
  equipData: ItemEquipment;
  name: string;
  isPercent?: boolean;
};

/** 옵션을 구성하는 자세한 + 수치들 */
export const EquipDetailValue = (props: EquipValueProps) => {
  const { equipData, name, isPercent = false } = props;
  const baseOption = equipData.item_base_option as Options;
  const addOption = equipData.item_add_option as Options;
  const etcOption = equipData.item_etc_option as Options;
  const starforceOption = equipData.item_starforce_option as Options;

  const baseValue = baseOption[name] as string;
  const addValue = addOption[name] as string;
  const etcValue = etcOption[name] as string;
  const starforceValue = starforceOption[name] as string;

  const element = new EquipOptionBuilder(isPercent)
    .applyBaseOption(baseValue)
    .applyAddOption(addValue)
    .applyEtcOption(etcValue)
    .applyStarforceOption(starforceValue)
    .build();

  if (element.length === 1) return null;

  return (
    <>
      {" ("}
      {element?.map((_element, i) => (
        <Fragment key={i}>{_element}</Fragment>
      ))}
      {")"}
    </>
  );
};

type EquipDetailItemProps = {
  name: string;
  alias: string;
  equipData: ItemEquipment;
  isPercent?: boolean;
};
export const EquipDetailItem = (props: EquipDetailItemProps) => {
  const { name, alias, equipData, isPercent } = props;
  const totalOption = equipData.item_total_option as Options;
  const baseOption = equipData.item_base_option as Options;

  // TODO: string or number를 number로 반환해 주는 유틸함수 정의
  const sign = parseInt(totalOption[name] as string) >= 0 ? "+" : "-";
  const percent = isPercent ? "%" : "";
  const isAddedOptions = totalOption[name] !== baseOption[name];

  if (totalOption[name] === "0") return null;

  return (
    <p className="flex whitespace-pre text-white font-medium">
      <span
        className={`${isAddedOptions ? "text-cyan-400" : "text-white"}`}
      >{`${alias} : ${sign}${totalOption[name]}${percent}`}</span>
      <EquipDetailValue
        equipData={equipData}
        name={name}
        isPercent={isPercent}
      />
    </p>
  );
};
