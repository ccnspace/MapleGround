import type { CharacterAttributes } from "@/apis/getCharacterAttributes";
import type { AndroidEquipment } from "@/types/AndroidEquipment";
import type { CashEquipmentInfo, CashItemEquipment } from "@/types/CashEquipment";
import type { EquipmentInfo, ItemEquipment } from "@/types/Equipment";
import { SymbolEquipmentInfo, SymbolOption } from "@/types/SymbolEquipment";
import { useCharacterStore } from "@/stores/character";
import { useShallow } from "zustand/shallow";
import { useMemo } from "react";
import { useNickname } from "./useNickname";

/** equiments를 컴포넌트에서 사용하기 쉽게 가공 */
export type CharacterEquipments = {
  normal?: Record<string, ItemEquipment>;
  cash?: Record<string, CashItemEquipment>;
  arcaneSymbol?: Record<string, SymbolOption>;
  authenticSymbol?: Record<string, SymbolOption>;
  android?: AndroidEquipment;
};
export type CharacterInfo = {
  basic?: CharacterAttributes["basic"];
  equipments?: CharacterEquipments;
  stat?: CharacterAttributes["stat"];
  ability?: CharacterAttributes["ability"];
};

/** 현재 검색한 캐릭터의 정보를 반환하는 hook */
export const useCharacterInfo = (preset?: number) => {
  const nickname = useNickname();
  const { characterAttributes, basic, normalEquip, cashEquip, symbolEquip, androidEquip, stat, ability } = useCharacterStore(
    useShallow((state) => ({
      characterAttributes: state.characterAttributes?.[nickname],
      basic: state.characterAttributes?.[nickname]?.basic,
      normalEquip: state.characterAttributes?.[nickname]?.normalEquip,
      cashEquip: state.characterAttributes?.[nickname]?.cashEquip,
      symbolEquip: state.characterAttributes?.[nickname]?.symbolEquip,
      androidEquip: state.characterAttributes?.[nickname]?.androidEquip,
      stat: state.characterAttributes?.[nickname]?.stat,
      ability: state.characterAttributes?.[nickname]?.ability,
    }))
  );

  /** 아이템 분류가 key값이 되는 객체로 변환 (인벤토리 UI에 쉽게 넣기 위함) */
  const convertToEquipmentObjects = ({
    normalEquip,
    cashEquip,
    symbolEquip,
    preset,
  }: {
    normalEquip: EquipmentInfo | undefined;
    cashEquip: CashEquipmentInfo | undefined;
    symbolEquip: SymbolEquipmentInfo | undefined;
    preset?: number;
  }) => {
    const normalObject: Record<string, ItemEquipment> = {};
    const cashObject: Record<string, CashItemEquipment> = {};
    const arcaneObject: Record<string, SymbolOption> = {};
    const authenticObject: Record<string, SymbolOption> = {};

    const getNormalEquipSource = (preset?: number) => {
      if (preset === 1) return normalEquip?.item_equipment_preset_1;
      if (preset === 2) return normalEquip?.item_equipment_preset_2;
      if (preset === 3) return normalEquip?.item_equipment_preset_3;
      return normalEquip?.item_equipment;
    };

    const normalEquipObject = getNormalEquipSource(preset)?.reduce((acc, cur) => {
      acc[cur.item_equipment_slot] = cur;
      return acc;
    }, normalObject);

    const cashEquipObject = cashEquip?.cash_item_equipment_base.reduce((acc, cur) => {
      acc[cur.cash_item_equipment_slot] = cur;
      return acc;
    }, cashObject);

    const arcaneSymbolObject = symbolEquip?.symbol
      .filter((item) => item.symbol_name.includes("아케인"))
      .reduce((acc, cur) => {
        acc[cur.symbol_name] = cur;
        return acc;
      }, arcaneObject);

    const authenticSymbolObject = symbolEquip?.symbol
      .filter((item) => item.symbol_name.includes("어센틱"))
      .reduce((acc, cur) => {
        acc[cur.symbol_name] = cur;
        return acc;
      }, authenticObject);

    return {
      normalEquipObject,
      cashEquipObject,
      arcaneSymbolObject,
      authenticSymbolObject,
    };
  };

  const { normalEquipObject, cashEquipObject, arcaneSymbolObject, authenticSymbolObject } = useMemo(
    () =>
      convertToEquipmentObjects({
        normalEquip,
        cashEquip,
        symbolEquip,
        preset,
      }),
    [normalEquip, cashEquip, symbolEquip, preset]
  );

  const characterInfo: CharacterInfo | null = useMemo(() => {
    if (!characterAttributes) return null;
    return {
      basic,
      equipments: {
        normal: normalEquipObject,
        cash: cashEquipObject,
        arcaneSymbol: arcaneSymbolObject,
        authenticSymbol: authenticSymbolObject,
        android: androidEquip,
      },
      stat,
      ability,
    };
  }, [
    characterAttributes,
    normalEquipObject,
    cashEquipObject,
    arcaneSymbolObject,
    authenticSymbolObject,
    androidEquip,
    stat,
    basic,
    ability,
  ]);

  return { characterInfo, defaultNormalEquipPresetNo: normalEquip?.preset_no, stat, ability };
};
