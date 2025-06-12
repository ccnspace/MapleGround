import { getCharacterAttributes } from "@/apis/getCharacterAttributes";
import { useCharacterStore } from "@/stores/character";
import { useVersusStore } from "@/stores/versus";
import { openModal } from "@/utils/openModal";
import { useState } from "react";
import { useShallow } from "zustand/shallow";

export const useVersusInfo = () => {
  const [isLoading, setLoading] = useState(false);
  const { firstPersonInfo, secondPersonInfo } = useVersusStore(
    useShallow((state) => ({
      firstPersonInfo: state.firstPersonInfo,
      secondPersonInfo: state.secondPersonInfo,
    }))
  );

  const isCharacterSuccessFetched = () => {
    const { characterAttributes } = useCharacterStore.getState();
    if (!characterAttributes) {
      openModal({ message: "먼저 왼쪽에서 캐릭터명을 검색해 주세요." });
      return false;
    }
    return true;
  };

  const isValidateDateInput = () => {
    const { firstPersonDate, secondPersonDate } = useVersusStore.getState();
    if (firstPersonDate >= secondPersonDate) {
      openModal({
        message: "첫 번째 캐릭터의 날짜를 \n두 번째 캐릭터보다 과거로 설정해 주세요.",
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

  const requestPersonData = async (nickname: string) => {
    setLoading(true);

    const { firstPersonDate, secondPersonDate, setPersonInfo } = useVersusStore.getState();

    const [firstPersonResponse, secondePersonResponse] = await Promise.all([
      getCharacterAttributes(nickname, firstPersonDate),
      getCharacterAttributes(nickname, secondPersonDate),
    ]);

    setPersonInfo("first", firstPersonResponse);
    setPersonInfo("second", secondePersonResponse);

    setLoading(false);
  };

  return {
    validateReport,
    requestPersonData,
    firstPersonInfo,
    secondPersonInfo,
    isLoading,
  };
};
