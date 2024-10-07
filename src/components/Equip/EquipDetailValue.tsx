import type { ItemEquipment } from "@/types/Equipment";
import type { Options } from "@/types/Options";
import { EquipOptionBuilder } from "@/utils/EquipmentOptionBuilder";
import { Fragment } from "react";

type EquipValueProps = {
  equipData: ItemEquipment;
  name: string;
  isPercent?: boolean;
};
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
