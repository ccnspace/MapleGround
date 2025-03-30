import { getAdditionalOptionPool, getItemOptionPool } from "@/utils/potentialUtils";
import { convertItemLevel } from "@/utils/convertItemLevel";
import type { CubeType, ItemGrade } from "@/utils/CubeSimulator";
import { useMemo, useState } from "react";
import { NOT_SELECTED } from "@/consts/Cube";

const getItemOptionPoolByType = (type: CubeType, itemType: string, itemLevel: number | undefined, grade: ItemGrade = "레전드리") => {
  const convertedItemLevel = convertItemLevel(itemLevel);
  if (type === "potential") return getItemOptionPool(itemType, grade, convertedItemLevel);
  return getAdditionalOptionPool(itemType, grade, convertedItemLevel);
};

/** 잠재능력 등급과 아이템 분류, 레벨에 따른 모든 첫번째~세번째 옵션을 반환*/
export const usePotentialInfo = ({
  cubeType,
  itemType,
  itemLevel,
  grade,
}: {
  cubeType: CubeType;
  itemType: string | undefined;
  itemLevel: number | undefined;
  grade?: ItemGrade;
}) => {
  const { firstLine, secondLine, thirdLine } = useMemo(() => {
    if (!cubeType || !itemType) return { firstLine: [], secondLine: [], thirdLine: [] };
    return getItemOptionPoolByType(cubeType, itemType, itemLevel, grade);
  }, [cubeType, itemType, itemLevel, grade]);

  const firstOptions = useMemo(() => [NOT_SELECTED, ...firstLine.map((option) => option.name)], [firstLine]);
  const secondOptions = useMemo(() => [NOT_SELECTED, ...secondLine.map((option) => option.name)], [secondLine]);
  const thirdOptions = useMemo(() => [NOT_SELECTED, ...thirdLine.map((option) => option.name)], [thirdLine]);

  return { firstOptions, secondOptions, thirdOptions };
};
