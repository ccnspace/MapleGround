import type { ItemEquipment } from "@/types/Equipment";
import { PotentialOption } from "./PotentialOption";
import { Divider } from "../Divider";
import { EquipDetailItem } from "./EquipDetailItem";
import { equipOptionList } from "@/consts/EquipOptionList";
import { StarforceBadge } from "../StarforceBadge";
import { EquipDescription } from "./EquipDescription";
import { type MouseEvent, useContext } from "react";
import { useCubeStore } from "@/stores/cube";
import { EquipActionContext } from "@/components/Container/EquipContainer";
import { CubeType } from "@/utils/CubeSimulator";
import { useStarforceStore } from "@/stores/starforce";
import { ExceptionalOptionComponent } from "./ExceptionalOption";
import { getItemOptionPoolByType } from "@/hooks/usePotentialInfo";

type Props = {
  item: ItemEquipment;
  enableItemMenu?: boolean;
};

/** 잠재능력 재설정 가능 아이템 리스트트 */
const starforceDisableItem = ["엠블렘", "훈장", "뱃지", "포켓", "안드로이드"];

const isRollableItem = (item: ItemEquipment) => {
  const optionPool = getItemOptionPoolByType("potential", item.item_equipment_slot, item.item_base_option.base_equipment_level);
  return optionPool.firstLine.length > 0;
};

const isAdditionalRollableItem = (item: ItemEquipment) => {
  const optionPool = getItemOptionPoolByType("additional", item.item_equipment_slot, item.item_base_option.base_equipment_level);
  return optionPool.firstLine.length > 0;
};

export const NormalContainer = ({ item, enableItemMenu = true }: Props) => {
  const {
    starforce,
    item_icon,
    scroll_upgrade,
    item_name,
    item_equipment_slot,
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
    item_exceptional_option,
    item_base_option: { base_equipment_level },
  } = item;
  const isAmazingForce = item.starforce_scroll_flag === "사용";
  const showStarforceBadge = !!item.starforce && item.starforce !== "0";
  const canCuttableItem = item.cuttable_count !== "255";

  const setSelectedEquipName = useContext(EquipActionContext);
  const setCubeTargetState = useCubeStore((state) => state.setCubeTargetState);
  const setStarforceTargetState = useStarforceStore((state) => state.setTargetItem);

  const canRollPotential = !!potential_option_grade && isRollableItem(item);
  const canRollAdditional = !!additional_potential_option_grade && isAdditionalRollableItem(item);
  const canRollCube = canRollPotential || canRollAdditional;
  const canStarforcePart =
    !starforceDisableItem.includes(item_equipment_slot) && !item.item_name.includes("제네시스") && !item.item_name.startsWith("타일런트");
  const canStarforce = canStarforcePart && !isAmazingForce && parseInt(item.starforce || "0") > 0;
  const canShowExceptionalOption = !!item_exceptional_option && item_exceptional_option.exceptional_upgrade > 0;

  const handleRollCubeClick = (e: MouseEvent, cubeType: CubeType) => {
    if (!potential_option_grade && !additional_potential_option_grade) return;
    e.stopPropagation();
    setSelectedEquipName("");
    setCubeTargetState({
      cubeType,
      targetItem: {
        itemName: item_name,
        itemIcon: item_icon,
        itemLevel: base_equipment_level,
        itemType: item_equipment_slot,
        itemPotentialGrade: potential_option_grade,
        additionalPotentialGrade: additional_potential_option_grade,
        currentPotentialOptions: [potential_option_1, potential_option_2, potential_option_3],
        currentAdditionalOptions: [additional_potential_option_1, additional_potential_option_2, additional_potential_option_3],
      },
    });
  };

  const handleStarforceClick = (e: MouseEvent) => {
    e.stopPropagation();
    setSelectedEquipName("");
    setStarforceTargetState(item);
  };

  return (
    <>
      {showStarforceBadge && <StarforceBadge isAmazingForce={isAmazingForce} starforce={starforce} />}
      <EquipDescription scroll_upgrade={scroll_upgrade} item_icon={item_icon} item_name={item_name} baseLevel={base_equipment_level} />
      {enableItemMenu && (canRollCube || canStarforce) && (
        <>
          <Divider />
          <div className="grid grid-flow-col-dense gap-1.5">
            {canRollCube && (
              <>
                {canRollPotential && (
                  <button
                    onClick={(e) => handleRollCubeClick(e, "potential")}
                    className="w-full tracking-tighter text-white text-sm font-bold pt-1 pb-1 px-1 [text-shadow:_2px_1px_3px_rgb(0_0_0_/_50%)]
              rounded-md bg-gradient-to-r from-purple-400/90 to-sky-500/90 hover:bg-gradient-to-r hover:from-purple-500/90 hover:to-sky-600/90"
                  >
                    {`🪄 잠재능력`}
                  </button>
                )}
                {canRollAdditional && (
                  <button
                    onClick={(e) => handleRollCubeClick(e, "additional")}
                    className="w-full tracking-tighter text-white whitespace-pre-wrap text-sm font-bold pt-1 pb-1 px-1 [text-shadow:_2px_1px_3px_rgb(0_0_0_/_50%)] 
              rounded-md bg-gradient-to-r from-lime-400/90 to-teal-600/90 hover:bg-gradient-to-r hover:from-lime-500/90 hover:to-teal-700/90"
                  >
                    {`🪄 에디셔널`}
                  </button>
                )}
              </>
            )}
            {canStarforce && (
              <button
                onClick={handleStarforceClick}
                className="w-full tracking-tighter text-white whitespace-pre-wrap text-sm font-bold pt-1 pb-1 px-1 [text-shadow:_2px_1px_3px_rgb(0_0_0_/_50%)] 
              rounded-md bg-gradient-to-r from-yellow-400/90 to-orange-400/90 hover:bg-gradient-to-r hover:from-yellow-500/90 hover:to-orange-600/90"
              >
                {`⭐ 스타포스`}
              </button>
            )}
          </div>
        </>
      )}
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
      {canShowExceptionalOption && <ExceptionalOptionComponent options={item_exceptional_option} />}
    </>
  );
};
