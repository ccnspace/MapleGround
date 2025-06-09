"use client";

import { MouseEvent, useCallback, useContext } from "react";
import { EquipActionContext, EquipContext } from "../Container/EquipContainer";
import { NormalEquipIcon } from "./EquipIcon/NormalEquipIcon";
import { AndroidEquipIcon } from "./EquipIcon/AndroidEquipIcon";
import { SymbolEquipIcon } from "./EquipIcon/SymbolEquipIcon";

export const EquipInventory = () => {
  const { characterEquipments, selectedEquipName } = useContext(EquipContext);
  const setSelectedEquipName = useContext(EquipActionContext);
  const { normal, android, arcaneSymbol = {}, authenticSymbol = {} } = characterEquipments || {};

  const arcaneSymbolList = Object.values(arcaneSymbol);
  const authenticSymbolList = Object.values(authenticSymbol);
  const hasSymbol = !!arcaneSymbolList.length || !!authenticSymbolList.length;

  const handleClickIcon = useCallback(
    (e: MouseEvent) => {
      const target = e.target as Element;
      const parent = target.closest(".equip_wrapper") || target.closest(".symbol_wrapper");
      if (!parent || parent.childElementCount === 0) return;

      setSelectedEquipName(parent.id);
    },
    [setSelectedEquipName]
  );

  if (!characterEquipments) return null;

  return (
    <div className="flex flex-col justify-center items-center min-h-[640px]">
      <div onClick={handleClickIcon} className="grid grid-cols-5 grid-flow-row gap-2">
        <NormalEquipIcon name="반지4" equipData={normal} isSelected={selectedEquipName === "반지4"} />
        <NormalEquipIcon name="모자" equipData={normal} customClass="col-start-3 col-end-5" isSelected={selectedEquipName == "모자"} />
        <NormalEquipIcon name="엠블렘" equipData={normal} isSelected={selectedEquipName == "엠블렘"} />
        <NormalEquipIcon name="반지3" equipData={normal} isSelected={selectedEquipName == "반지3"} />
        <NormalEquipIcon name="펜던트2" equipData={normal} isSelected={selectedEquipName == "펜던트2"} />
        <NormalEquipIcon
          name="얼굴장식"
          equipData={normal}
          customClass="col-start-3 col-end-5"
          isSelected={selectedEquipName == "얼굴장식"}
        />
        <NormalEquipIcon name="뱃지" equipData={normal} isSelected={selectedEquipName === "뱃지"} />
        <NormalEquipIcon name="반지2" equipData={normal} isSelected={selectedEquipName === "반지2"} />
        <NormalEquipIcon name="펜던트" equipData={normal} isSelected={selectedEquipName === "펜던트"} />
        <NormalEquipIcon name="눈장식" equipData={normal} isSelected={selectedEquipName === "눈장식"} />
        <NormalEquipIcon name="귀고리" equipData={normal} isSelected={selectedEquipName === "귀고리"} />
        <NormalEquipIcon name="훈장" equipData={normal} isSelected={selectedEquipName === "훈장"} />

        <NormalEquipIcon name="반지1" equipData={normal} isSelected={selectedEquipName === "반지1"} />
        <NormalEquipIcon name="무기" equipData={normal} isSelected={selectedEquipName === "무기"} />
        <NormalEquipIcon name="상의" equipData={normal} isSelected={selectedEquipName === "상의"} />
        <NormalEquipIcon name="어깨장식" equipData={normal} isSelected={selectedEquipName === "어깨장식"} />
        <NormalEquipIcon name="보조무기" equipData={normal} isSelected={selectedEquipName === "보조무기"} />

        <NormalEquipIcon name="포켓 아이템" equipData={normal} isSelected={selectedEquipName === "포켓 아이템"} />
        <NormalEquipIcon name="벨트" equipData={normal} isSelected={selectedEquipName === "벨트"} />
        <NormalEquipIcon name="하의" equipData={normal} isSelected={selectedEquipName === "하의"} />
        <NormalEquipIcon name="장갑" equipData={normal} isSelected={selectedEquipName === "장갑"} />
        <NormalEquipIcon name="망토" equipData={normal} isSelected={selectedEquipName === "망토"} />
        <NormalEquipIcon name="신발" equipData={normal} isSelected={selectedEquipName === "신발"} customClass="col-start-3" />
        <AndroidEquipIcon equipData={android} isSelected={selectedEquipName === "안드로이드"} />
        <NormalEquipIcon name="기계 심장" equipData={normal} isSelected={selectedEquipName === "기계 심장"} />
      </div>
      {hasSymbol && (
        <>
          <div className="flex mr-auto mt-3">
            <p
              className="flex font-bold text-sm px-2 pb-1 pt-1
         border-l-4 border-l-purple-300"
            >
              심볼 아이템
            </p>
          </div>
          <div className="flex flex-col mt-3 items-start gap-2">
            <div className="grid grid-cols-6 grid-flow-row gap-1.5">
              {Object.values(arcaneSymbol)?.map((item) => (
                <SymbolEquipIcon
                  key={item.symbol_name}
                  symbol={item}
                  type="arcane"
                  onClick={handleClickIcon}
                  isSelected={selectedEquipName === item.symbol_name}
                />
              ))}
            </div>
            <div className="grid grid-cols-6 grid-flow-row gap-1.5">
              {Object.values(authenticSymbol)?.map((item) => (
                <SymbolEquipIcon
                  key={item.symbol_name}
                  symbol={item}
                  type="authentic"
                  onClick={handleClickIcon}
                  isSelected={selectedEquipName === item.symbol_name}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
