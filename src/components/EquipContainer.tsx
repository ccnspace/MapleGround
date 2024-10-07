"use client";

import { useCharacterInfo } from "@/hooks/useCharacterInfo";
import type { AndroidEquipment } from "@/types/AndroidEquipment";
import { ItemEquipment } from "@/types/Equipment";
import Image from "next/image";
import { useState, type MouseEvent } from "react";
import { EquipDetailCard } from "./EquiqDetailCard";
import { StarIcon } from "./svg/StarIcon";

const ItemIcon = ({ item }: { item: ItemEquipment }) => (
  <Image
    src={item?.item_icon}
    alt={item?.item_equipment_part}
    unoptimized
    width={52}
    height={60}
    style={{ width: "auto", height: "auto" }}
  />
);

const AndroidIcon = ({ icon }: { icon: AndroidEquipment["android_icon"] }) => (
  <Image
    src={icon as string}
    alt={"안드로이드"}
    unoptimized
    width={52}
    height={60}
    style={{ width: "auto", height: "auto" }}
  />
);

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
  레전드리: "border-2 border-lime-400",
  유니크: "border-2 border-yellow-400",
  에픽: "border-2 border-purple-500",
  레어: "border-2 border-sky-400",
};

const commonEquipStyle =
  "flex relative justify-center items-center bg-slate-300 dark:bg-[#4f515a] w-16 h-16 rounded-md cursor-pointer";

type EquipItemProps = {
  name: string;
  equipData: { [key: string]: ItemEquipment } | undefined;
  customClass?: string;
};
const Equipment = ({ name, equipData, customClass }: EquipItemProps) => {
  const getPotentialStyle = (name: string) => {
    const potentialTitle = equipData?.[name]?.potential_option_grade;
    return equipData && potentialTitle && potentialStyle[potentialTitle];
  };
  return (
    <div
      id={name}
      className={`${getPotentialStyle(
        name
      )} ${commonEquipStyle} ${customClass}`}
    >
      {equipData?.[name] && (
        <>
          <StarForceBadge item={equipData[name]} />
          <ItemIcon item={equipData[name]} />
        </>
      )}
    </div>
  );
};

const AndroidEquipment = ({
  equipData,
}: {
  equipData: AndroidEquipment | undefined;
}) => {
  return (
    <div id={"안드로이드"} className={`${commonEquipStyle}`}>
      {equipData?.android_icon && <AndroidIcon icon={equipData.android_icon} />}
    </div>
  );
};

export const EquipContainer = () => {
  const [clickedEquip, setClickedEquip] = useState("");
  const { characterData } = useCharacterInfo();
  const { normal, android } = characterData.equipments || {};

  const handleClickIcon = (e: MouseEvent) => {
    const target = e.target as Element;
    const id = target.id || target.parentElement?.id;
    if (!id) return;
    setClickedEquip(id);
  };

  return (
    <div
      className="flex shrink-0 flex-row bg-slate-100 dark:bg-[#1f2024] px-3 pt-3 pb-3 border
   border-slate-300 dark:border-[#1f2024] rounded-lg gap-6"
    >
      {/* 장비창 */}
      <div className="flex justify-center items-center">
        <div
          onClick={handleClickIcon}
          className="grid grid-cols-5 grid-flow-row gap-2"
        >
          <Equipment name="반지4" equipData={normal} />
          <Equipment
            name="모자"
            equipData={normal}
            customClass="col-start-3 col-end-5"
          />
          <Equipment name="엠블렘" equipData={normal} />
          <Equipment name="반지3" equipData={normal} />
          <Equipment name="펜던트2" equipData={normal} />
          <Equipment
            name="얼굴장식"
            equipData={normal}
            customClass="col-start-3 col-end-5"
          />
          <Equipment name="뱃지" equipData={normal} />
          <Equipment name="반지2" equipData={normal} />
          <Equipment name="펜던트" equipData={normal} />
          <Equipment name="눈장식" equipData={normal} />
          <Equipment name="귀고리" equipData={normal} />
          <Equipment name="훈장" equipData={normal} />

          <Equipment name="반지1" equipData={normal} />
          <Equipment name="무기" equipData={normal} />
          <Equipment name="상의" equipData={normal} />
          <Equipment name="어깨장식" equipData={normal} />
          <Equipment name="보조무기" equipData={normal} />

          <Equipment name="포켓 아이템" equipData={normal} />
          <Equipment name="벨트" equipData={normal} />
          <Equipment name="하의" equipData={normal} />
          <Equipment name="장갑" equipData={normal} />
          <Equipment name="망토" equipData={normal} />
          <Equipment name="신발" equipData={normal} customClass="col-start-3" />
          <AndroidEquipment equipData={android} />
          <Equipment name="기계 심장" equipData={normal} />
        </div>
      </div>

      {/* 프리뷰 */}
      <div className="flex items-center rounded-lg px-4 pt-4 pb-4 min-w-[320px] bg-slate-200 dark:bg-[#25272e]">
        {/* TODO: 장비 프리뷰 컴포넌트 */}
        {!!normal && !!clickedEquip && (
          <EquipDetailCard equipData={normal[clickedEquip]} />
        )}
      </div>
    </div>
  );
};
