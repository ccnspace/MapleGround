import { CharacterAllInfo } from "@/apis/getCharacterAllInfo";
import { useCharacterStore } from "@/stores/character";
import type { CashItemEquipment } from "@/types/CashEquipment";
import type { ItemEquipment } from "@/types/Equipment";
import { useShallow } from "zustand/shallow";

/** 현재 검색한 캐릭터의 정보를 반환하는 hook */
export const useCharacterInfo = () => {
  const characterAllInfo = useCharacterStore(
    useShallow((state) => state.characterAllInfo)
  );

  /** 아이템 분류가 key값이 되는 객체로 변환 (인벤토리 UI에 쉽게 넣기 위함) */
  const convertToEquipmentObjects = (allInfo: CharacterAllInfo | null) => {
    const { normalEquip, cashEquip } = allInfo || {};
    const normalObject: { [key: string]: ItemEquipment } = {};
    const cashObject: { [key: string]: CashItemEquipment } = {};

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

    return { normalEquipObject, cashEquipObject };
  };

  const { normalEquipObject, cashEquipObject } =
    convertToEquipmentObjects(characterAllInfo);

  const characterData = {
    basic: characterAllInfo?.basic,
    equipments: {
      normal: normalEquipObject,
      cash: cashEquipObject,
      symbol: characterAllInfo?.symbolEquip,
      android: characterAllInfo?.androidEquip,
    },
    stats: characterAllInfo?.stat,
  };

  return { characterData };
};
