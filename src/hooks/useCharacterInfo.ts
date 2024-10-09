import type { CharacterAttributes } from "@/apis/getCharacterAttributes";
import type { AndroidEquipment } from "@/types/AndroidEquipment";
import type {
  CashEquipmentInfo,
  CashItemEquipment,
} from "@/types/CashEquipment";
import type { EquipmentInfo, ItemEquipment } from "@/types/Equipment";
import { SymbolEquipmentInfo, SymbolOption } from "@/types/SymbolEquipment";
import { useCharacterStore } from "@/stores/character";
import { useShallow } from "zustand/shallow";
import { useMemo } from "react";

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
};

/** 현재 검색한 캐릭터의 정보를 반환하는 hook */
export const useCharacterInfo = () => {
  const { basic, normalEquip, cashEquip, symbolEquip, androidEquip, stat } =
    useCharacterStore(
      useShallow((state) => ({
        basic: state.characterAttributes?.basic,
        normalEquip: state.characterAttributes?.normalEquip,
        cashEquip: state.characterAttributes?.cashEquip,
        symbolEquip: state.characterAttributes?.symbolEquip,
        androidEquip: state.characterAttributes?.androidEquip,
        stat: state.characterAttributes?.stat,
      }))
    );

  /** 아이템 분류가 key값이 되는 객체로 변환 (인벤토리 UI에 쉽게 넣기 위함) */
  const convertToEquipmentObjects = ({
    normalEquip,
    cashEquip,
    symbolEquip,
  }: {
    normalEquip: EquipmentInfo | undefined;
    cashEquip: CashEquipmentInfo | undefined;
    symbolEquip: SymbolEquipmentInfo | undefined;
  }) => {
    const normalObject: Record<string, ItemEquipment> = {};
    const cashObject: Record<string, CashItemEquipment> = {};
    const arcaneObject: Record<string, SymbolOption> = {};
    const authenticObject: Record<string, SymbolOption> = {};

    const normalEquipObject = normalEquip?.item_equipment.reduce((acc, cur) => {
      acc[cur.item_equipment_slot] = cur;
      return acc;
    }, normalObject);

    const cashEquipObject = cashEquip?.cash_item_equipment_base.reduce(
      (acc, cur) => {
        acc[cur.cash_item_equipment_slot] = cur;
        return acc;
      },
      cashObject
    );

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

  const {
    normalEquipObject,
    cashEquipObject,
    arcaneSymbolObject,
    authenticSymbolObject,
  } = useMemo(
    () => convertToEquipmentObjects({ normalEquip, cashEquip, symbolEquip }),
    [normalEquip, cashEquip, symbolEquip]
  );

  const characterInfo: CharacterInfo = useMemo(
    () => ({
      basic,
      equipments: {
        normal: normalEquipObject,
        cash: cashEquipObject,
        arcaneSymbol: arcaneSymbolObject,
        authenticSymbol: authenticSymbolObject,
        android: androidEquip,
      },
      stat,
    }),
    [
      normalEquipObject,
      cashEquipObject,
      arcaneSymbolObject,
      authenticSymbolObject,
      androidEquip,
      stat,
      basic,
    ]
  );

  return { characterInfo };
};
