import { getCharacterBaseInfo } from "@/apis/getCharacterBaseInfo";
import { getCharacterStat } from "@/apis/getCharacterStat";
import { getAllEquipmentsInfo } from "@/apis/getEquipment";
import { useCharacterStore } from "@/stores/character";
import { useVersusStore } from "@/stores/versus";
import { openModal } from "@/utils/openModal";
import { useState } from "react";
import { useShallow } from "zustand/shallow";

export const useVersusInfo = () => {
  const [isLoading, setLoading] = useState(false);
  const {
    firstPersonBase,
    firstPersonStat,
    firstPersonEquipment,
    secondPersonBase,
    secondPersonStat,
    secondPersonEquipment,
  } = useVersusStore(
    useShallow((state) => ({
      firstPersonBase: state.firstPersonBase,
      firstPersonStat: state.firstPersonStat,
      firstPersonEquipment: state.firstPersonEquipment,
      secondPersonBase: state.secondPersonBase,
      secondPersonStat: state.secondPersonStat,
      secondPersonEquipment: state.secondPersonEquipment,
    }))
  );

  const isCharacterSuccessFetched = () => {
    const { fetchStatus } = useCharacterStore.getState();
    const hasCharacterFetched = fetchStatus === "success";
    if (!hasCharacterFetched) {
      openModal({ message: "먼저 왼쪽에서 캐릭터명을 검색해 주세요." });
      return false;
    }
    return true;
  };

  const isValidateDateInput = () => {
    const { firstPersonDate, secondPersonDate } = useVersusStore.getState();
    if (firstPersonDate >= secondPersonDate) {
      openModal({
        message:
          "첫 번째 캐릭터의 날짜를 \n두 번째 캐릭터보다 과거로 설정해 주세요.",
      });
      return false;
    }
    return true;
  };

  const validateReport = () => {
    if (!isCharacterSuccessFetched()) return false;
    if (!isValidateDateInput()) return false;
    return true;
  };

  const requestPersonData = async () => {
    const { characterAllInfo } = useCharacterStore.getState();
    if (!characterAllInfo) return;

    setLoading(true);

    const nickname = characterAllInfo.basic.character_name;
    const {
      firstPersonDate,
      secondPersonDate,
      setPersonBase,
      setPersonStat,
      setPersonEquipment,
    } = useVersusStore.getState();
    const [
      firstBase,
      secondBase,
      firstStat,
      secondStat,
      firstEquipment,
      secondEquipment,
    ] = await Promise.all([
      getCharacterBaseInfo(nickname, firstPersonDate),
      getCharacterBaseInfo(nickname, secondPersonDate),
      getCharacterStat(nickname, firstPersonDate),
      getCharacterStat(nickname, secondPersonDate),
      getAllEquipmentsInfo(nickname, firstPersonDate),
      getAllEquipmentsInfo(nickname, secondPersonDate),
    ]);

    setPersonBase("first", firstBase);
    setPersonStat("first", firstStat);
    setPersonEquipment("first", firstEquipment);

    setPersonBase("second", secondBase);
    setPersonStat("second", secondStat);
    setPersonEquipment("second", secondEquipment);

    setLoading(false);
  };

  const firstPersonData = {
    base: firstPersonBase,
    stat: firstPersonStat,
    equipment: firstPersonEquipment,
  };

  const secondPersonData = {
    base: secondPersonBase,
    stat: secondPersonStat,
    equipment: secondPersonEquipment,
  };

  return {
    validateReport,
    requestPersonData,
    firstPersonData,
    secondPersonData,
    isLoading,
  };
};
