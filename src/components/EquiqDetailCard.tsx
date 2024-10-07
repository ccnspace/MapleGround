import type { ItemEquipment } from "@/types/Equipment";
import { StarforceBadge } from "./Equip/StarforceBadge";
import { EquipDescription } from "./Equip/EquipDescription";
import { EquipDetailValue } from "./Equip/EquipDetailValue";
import type { Options } from "@/types/Options";
import { equipOptionList } from "@/consts/EquipOptionList";
import { PotentialOption } from "./Equip/PotentialOption";
import { Divider } from "./Equip/Divider";

type EquipDetailItemProps = {
  name: string;
  alias: string;
  equipData: ItemEquipment;
  isPercent?: boolean;
};
const EquipDetailItem = (props: EquipDetailItemProps) => {
  const { name, alias, equipData, isPercent } = props;
  const totalOption = equipData.item_total_option as Options;
  const baseOption = equipData.item_base_option as Options;

  // TODO: string or number를 number로 반환해 주는 유틸함수 정의
  const sign = parseInt(totalOption[name] as string) >= 0 ? "+" : "-";
  const percent = isPercent ? "%" : "";
  const isAddedOptions = totalOption[name] !== baseOption[name];

  if (totalOption[name] === "0") return null;

  return (
    <p className="flex whitespace-pre text-white">
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

type EquipDetailCardProps = {
  equipData: ItemEquipment;
};
export const EquipDetailCard = ({ equipData }: EquipDetailCardProps) => {
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
  } = equipData;
  const isAmazingForce = equipData.starforce_scroll_flag === "사용";
  const showStarforceBadge =
    !!equipData.starforce && equipData.starforce !== "0";
  const canCuttableItem = equipData.cuttable_count !== "255";

  return (
    <div
      className="flex flex-col min-w-80 max-w-80
     bg-slate-950/80 dark:bg-[#121212]/80 
     border border-gray-700
     rounded-lg px-5 pt-3 pb-4"
    >
      {showStarforceBadge && (
        <StarforceBadge isAmazingForce={isAmazingForce} starforce={starforce} />
      )}
      <EquipDescription item_icon={item_icon} item_name={item_name} />
      <Divider />
      <div className="flex text-xs font-light flex-col gap-[2px]">
        <p className="text-white">
          장비분류: <span>{item_equipment_part}</span>
        </p>
        {equipOptionList.map((item) => (
          <EquipDetailItem
            key={item.name}
            name={item.name}
            alias={item.alias}
            equipData={equipData}
            isPercent={item.isPercent}
          />
        ))}
        <p className="text-white">
          업그레이드 가능 횟수: {scroll_upgradeable_count}
          <span className="text-yellow-500">
            {` (복구 가능 횟수 : ${scroll_resilience_count})`}
          </span>
        </p>
        {golden_hammer_flag === "적용" && (
          <p className="text-white">황금망치 제련 적용</p>
        )}
        {canCuttableItem && (
          <p className="text-yellow-500">
            {`가위 사용 가능 횟수 : ${cuttable_count}회`}
          </p>
        )}
      </div>
      {item_description && (
        <>
          <Divider />
          <p className="text-xs text-white whitespace-pre-wrap">
            {item_description}
          </p>
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
          options={[
            additional_potential_option_1,
            additional_potential_option_2,
            additional_potential_option_3,
          ]}
        />
      )}
    </div>
  );
};
