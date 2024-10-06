"use client";

import { useCharacterInfo } from "@/hooks/useCharacterInfo";
import { ItemEquipment } from "@/types/Equipment";
import Image from "next/image";
import { useState, type MouseEvent } from "react";

const ItemIcon = ({ item }: { item: ItemEquipment }) => (
  <Image
    src={item.item_icon}
    alt={item.item_equipment_part}
    unoptimized
    width={52}
    height={60}
    style={{ width: "auto", height: "auto" }}
  />
);

const potentialStyle: { [key: string]: string } = {
  레전드리: "border-2 border-lime-400",
  유니크: "border-2 border-yellow-400",
  에픽: "border-2 border-purple-500",
  레어: "border-2 border-sky-400",
};

const commonEquipStyle =
  "flex justify-center items-center bg-slate-300 dark:bg-[#4f515a] w-16 h-16 rounded-md cursor-pointer";

export const EquipContainer = () => {
  const { characterData } = useCharacterInfo();
  const { normal, cash, symbol } = characterData.equipments || {};
  const getPotentialStyle = (slot: string) => {
    const potentialTitle = normal?.[slot]?.potential_option_grade;
    return normal && potentialTitle && potentialStyle[potentialTitle];
  };
  const [clickedEquip, setClickedEquip] = useState("");

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
          <div
            id="반지4"
            className={`${commonEquipStyle} ${getPotentialStyle("반지4")}`}
          >
            {normal && <ItemIcon item={normal["반지4"]} />}
          </div>
          <div
            id="모자"
            className={`${commonEquipStyle} ${getPotentialStyle("모자")}
    col-start-3 col-end-5`}
          >
            {normal && <ItemIcon item={normal["모자"]} />}
          </div>
          <div
            id="엠블렘"
            className={`${commonEquipStyle} ${getPotentialStyle("엠블렘")}`}
          >
            {normal && <ItemIcon item={normal["엠블렘"]} />}
          </div>
          <div
            id="반지3"
            className={`${commonEquipStyle} ${getPotentialStyle("반지3")}`}
          >
            {normal && <ItemIcon item={normal["반지3"]} />}
          </div>
          <div
            id="펜던트2"
            className={`${commonEquipStyle} ${getPotentialStyle("펜던트2")}`}
          >
            {normal && <ItemIcon item={normal["펜던트2"]} />}
          </div>
          <div
            id="얼굴장식"
            className={`${commonEquipStyle} ${getPotentialStyle("얼굴장식")}
    col-start-3 col-end-5`}
          >
            {normal && <ItemIcon item={normal["얼굴장식"]} />}
          </div>
          <div
            id="뱃지"
            className={`${commonEquipStyle} ${getPotentialStyle("뱃지")}`}
          >
            {normal && <ItemIcon item={normal["뱃지"]} />}
          </div>
          <div
            id="반지2"
            className={`${commonEquipStyle} ${getPotentialStyle("반지2")}`}
          >
            {normal && <ItemIcon item={normal["반지2"]} />}
          </div>
          <div
            id="펜던트"
            className={`${commonEquipStyle} ${getPotentialStyle("펜던트")}`}
          >
            {normal && <ItemIcon item={normal["펜던트"]} />}
          </div>
          <div
            id="눈장식"
            className={`${commonEquipStyle} ${getPotentialStyle("눈장식")}`}
          >
            {normal && <ItemIcon item={normal["눈장식"]} />}
          </div>
          <div
            id="귀고리"
            className={`${commonEquipStyle} ${getPotentialStyle("귀고리")}`}
          >
            {normal && <ItemIcon item={normal["귀고리"]} />}
          </div>
          <div
            id="훈장"
            className={`${commonEquipStyle} ${getPotentialStyle("훈장")}`}
          >
            {normal && <ItemIcon item={normal["훈장"]} />}
          </div>
          <div
            id="반지1"
            className={`${commonEquipStyle} ${getPotentialStyle("반지1")}`}
          >
            {normal && <ItemIcon item={normal["반지1"]} />}
          </div>
          <div
            id="무기"
            className={`${commonEquipStyle} ${getPotentialStyle("무기")}`}
          >
            {normal && <ItemIcon item={normal["무기"]} />}
          </div>
          <div
            id="상의"
            className={`${commonEquipStyle} ${getPotentialStyle("상의")}`}
          >
            {normal && <ItemIcon item={normal["상의"]} />}
          </div>
          <div
            id="어깨장식"
            className={`${commonEquipStyle} ${getPotentialStyle("어깨장식")}`}
          >
            {normal && <ItemIcon item={normal["어깨장식"]} />}
          </div>
          <div
            id="보조무기"
            className={`${commonEquipStyle} ${getPotentialStyle("보조무기")}`}
          >
            {normal && <ItemIcon item={normal["보조무기"]} />}
          </div>
          <div
            id="포켓 아이템"
            className={`${commonEquipStyle} ${getPotentialStyle("아이템")}`}
          >
            {normal && <ItemIcon item={normal["포켓 아이템"]} />}
          </div>
          <div
            id="벨트"
            className={`${commonEquipStyle} ${getPotentialStyle("벨트")}`}
          >
            {normal && <ItemIcon item={normal["벨트"]} />}
          </div>
          <div
            id="하의"
            className={`${commonEquipStyle} ${getPotentialStyle("하의")}`}
          >
            {normal && <ItemIcon item={normal["하의"]} />}
          </div>
          <div
            id="장갑"
            className={`${commonEquipStyle} ${getPotentialStyle("장갑")}`}
          >
            {normal && <ItemIcon item={normal["장갑"]} />}
          </div>
          <div
            id="망토"
            className={`${commonEquipStyle} ${getPotentialStyle("망토")}`}
          >
            {normal && <ItemIcon item={normal["망토"]} />}
          </div>
          <div
            id="신발"
            className={`${commonEquipStyle} ${getPotentialStyle(
              "신발"
            )} col-start-3`}
          >
            {normal && <ItemIcon item={normal["신발"]} />}
          </div>
          <div
            id="안드로이드"
            className={`${commonEquipStyle} ${getPotentialStyle("안드로이드")}`}
          >
            {/* {normal && <ItemIcon item={normal["안드로이드"]} />} */}
          </div>
          <div
            id="기계 심장"
            className={`${commonEquipStyle} ${getPotentialStyle("기계 심장")}`}
          >
            {normal && <ItemIcon item={normal["기계 심장"]} />}
          </div>
        </div>
      </div>

      {/* 프리뷰 */}
      <div className="flex rounded-lg px-4 pt-4 pb-4 min-w-[320px]">
        {/* TODO: 장비 프리뷰 컴포넌트 */}
      </div>
    </div>
  );
};
