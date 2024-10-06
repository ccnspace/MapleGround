import { useCharacterStore } from "@/stores/character";
import type { CashItemEquipment } from "@/types/CashEquipment";
import { AllEquipmentsInfo, type ItemEquipment } from "@/types/Equipment";
import { useShallow } from "zustand/shallow";

/** 현재 검색한 캐릭터의 정보를 반환하는 hook */
export const useCharacterInfo = () => {
  const { characterBase, characterEquipments, characterStats } =
    useCharacterStore(
      useShallow((state) => ({
        characterBase: state.characterBase,
        characterStats: state.characterStats,
        characterEquipments: state.characterEquipments,
      }))
    );

  const convertToEquipmentObjects = (equipment: AllEquipmentsInfo | null) => {
    const { normal, cash } = equipment || {};
    const normalObject: { [key: string]: ItemEquipment } = {};
    const cashObject: { [key: string]: CashItemEquipment } = {};

    const normalEquipment = normal?.item_equipment.reduce((acc, cur) => {
      acc[cur.item_equipment_slot] = cur;
      return acc;
    }, normalObject);

    const cashEquipment = cash?.cash_item_equipment_base.reduce((acc, cur) => {
      acc[cur.cash_item_equipment_slot] = cur;
      return acc;
    }, cashObject);

    return { normalEquipment, cashEquipment };
  };

  const { normalEquipment, cashEquipment } =
    convertToEquipmentObjects(characterEquipments);

  const characterData = {
    base: characterBase,
    equipments: {
      normal: normalEquipment,
      cash: cashEquipment,
      symbol: characterEquipments?.symbol,
    },
    stats: characterStats,
  };

  return { characterData };
};
