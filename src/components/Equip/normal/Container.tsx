import type { ItemEquipment } from "@/types/Equipment";
import { PotentialOption } from "./PotentialOption";
import { Divider } from "../Divider";
import { EquipDetailItem } from "./EquipDetailItem";
import { equipOptionList } from "@/consts/EquipOptionList";
import { StarforceBadge } from "../StarforceBadge";
import { EquipDescription } from "./EquipDescription";

type Props = {
  item: ItemEquipment;
};
export const NormalContainer = ({ item }: Props) => {
  const {
    starforce,
    item_icon,
    item_name,
    item_equipment_part,
    scroll_upgradeable_count,
    scroll_resilience_count,
    cuttable_count,
    golden_hammer_flag,
    potential_option_grade,
    item_description,
    additional_potential_option_grade,
    potential_option_1,
    potential_option_2,
    potential_option_3,
    additional_potential_option_1,
    additional_potential_option_2,
    additional_potential_option_3,
    item_base_option: { base_equipment_level },
  } = item;
  const isAmazingForce = item.starforce_scroll_flag === "사용";
  const showStarforceBadge = !!item.starforce && item.starforce !== "0";
  const canCuttableItem = item.cuttable_count !== "255";

  return (
    <>
      {showStarforceBadge && <StarforceBadge isAmazingForce={isAmazingForce} starforce={starforce} />}
      <EquipDescription item_icon={item_icon} item_name={item_name} baseLevel={base_equipment_level} />
      <Divider />
      <div className="flex text-xs flex-col gap-[2px]">
        <p className="text-white">
          장비분류: <span>{item_equipment_part}</span>
        </p>
        {equipOptionList.map((option) => (
          <EquipDetailItem key={option.name} name={option.name} alias={option.alias} equipData={item} isPercent={option.isPercent} />
        ))}
        <p className="text-white">
          업그레이드 가능 횟수: {scroll_upgradeable_count}
          <span className="text-yellow-500">{` (복구 가능 횟수 : ${scroll_resilience_count})`}</span>
        </p>
        {golden_hammer_flag === "적용" && <p className="text-white">황금망치 제련 적용</p>}
        {canCuttableItem && <p className="text-yellow-500">{`가위 사용 가능 횟수 : ${cuttable_count}회`}</p>}
      </div>
      {item_description && (
        <>
          <Divider />
          <p className="text-xs text-white whitespace-pre-wrap">{item_description}</p>
        </>
      )}
      {potential_option_grade && (
        <PotentialOption
          type="potential"
          grade={potential_option_grade}
          options={[potential_option_1, potential_option_2, potential_option_3]}
        />
      )}
      {additional_potential_option_grade && (
        <PotentialOption
          type="additional"
          grade={additional_potential_option_grade}
          options={[additional_potential_option_1, additional_potential_option_2, additional_potential_option_3]}
        />
      )}
    </>
  );
};
