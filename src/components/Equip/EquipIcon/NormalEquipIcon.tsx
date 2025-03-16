import { useClickOutside } from "@/hooks/useClickOutside";
import { CSSProperties, memo, useContext, useRef } from "react";
import { EquipActionContext } from "@/components/Container/EquipContainer";
import { ItemEquipment } from "@/types/Equipment";
import { StarIcon } from "../../svg/StarIcon";
import { ItemIcon } from "./ItemIcon";
import { EquipDetailCard } from "../EquiqDetailCard";
import { CubeSimulator } from "@/utils/CubeSimulator";

const StarForceBadge = ({ item }: { item: ItemEquipment }) => {
  const starforce = parseInt(item?.starforce);
  const isAmazingForce = item?.starforce_scroll_flag === "사용";

  if (!item?.starforce || (!isAmazingForce && starforce < 17)) return null;

  const forceKey = (() => {
    if (isAmazingForce) return "amazing";
    if (starforce >= 17 && starforce < 22) return "17+";
    if (starforce === 22) return "22";
    if (starforce === 23) return "23";
    if (starforce === 24) return "24";
    return "25";
  })();

  const starforceStyle = {
    amazing: "bg-slate-500 text-blue-200",
    "17+": "bg-blue-500",
    "22": "bg-lime-600",
    "23": "bg-purple-900",
    "24": "bg-pink-800",
    "25": "bg-slate-800",
  };

  return (
    <div
      className={`absolute flex items-center shadow top-0 left-0 font-medium text-white rounded-sm
          text-xs px-0.5 pt-0.25 pb-0.25 ${starforceStyle[forceKey]}`}
    >
      <StarIcon size={"size-3"} isAmazingForce={isAmazingForce} />
      {`${starforce}`}
    </div>
  );
};

const potentialStyle: Record<string, string> = {
  레전드리: "border-2 border-green-500",
  유니크: "border-2 border-yellow-400",
  에픽: "border-2 border-purple-500",
  레어: "border-2 border-sky-400",
};

const commonEquipStyle = `equip_wrapper flex hover:bg-slate-400/60 dark:hover:bg-white/40 relative justify-center
  items-center bg-slate-300 dark:bg-[#4f515a] w-16 h-16 rounded-md cursor-pointer`;

// TODO: EquipDetailCard에 공통화
const commonDetailStyle = { position: "absolute", zIndex: 1000, top: 10, left: 10 } as CSSProperties;

type EquipItemProps = {
  name: string;
  equipData: Record<string, ItemEquipment> | undefined;
  customClass?: string;
  isSelected: boolean;
};
export const NormalEquipIcon = memo(({ name, equipData, customClass, isSelected }: EquipItemProps) => {
  const setSelectedEquipName = useContext(EquipActionContext);
  const equipDetailRef = useRef<HTMLDivElement>(null);

  useClickOutside(equipDetailRef, () => setSelectedEquipName(""));

  const getPotentialStyle = (name: string) => {
    const potentialTitle = equipData?.[name]?.potential_option_grade;
    return !!(equipData && potentialTitle) ? potentialStyle[potentialTitle] : "";
  };

  return (
    <div id={name} className={`${getPotentialStyle(name)} ${commonEquipStyle} ${customClass}`}>
      {equipData?.[name] && (
        <>
          <StarForceBadge item={equipData[name]} />
          <ItemIcon item={equipData[name]} />
        </>
      )}
      {isSelected && (
        <div ref={equipDetailRef} style={commonDetailStyle}>
          <EquipDetailCard equipName={name} />
        </div>
      )}
    </div>
  );
});

NormalEquipIcon.displayName = "NormalEquipIcon";
