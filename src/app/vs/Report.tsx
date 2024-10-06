"use client";

import { useCharacterStore } from "@/stores/character";
import { CharacterCard } from "./CharacterCard";
import { openModal } from "@/utils/openModal";
import { useVersusStore } from "@/stores/versus";

export const ReportContainer = () => {
  const isCharacterSuccessFetched = () => {
    const { status: fetchStatus } = useCharacterStore.getState();
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
          "첫 번째 캐릭터의 날짜를 두 번째 캐릭터보다 과거로 설정해 주세요.",
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

  const handleClick = () => {
    if (validateReport()) {
      // TODO: 비교 리포트 만들기
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-5">
      <div className="flex flex-row gap-3 mt-5">
        <CharacterCard type="first" direction="left" />
        <CharacterCard type="second" direction="right" />
      </div>
      <button
        onClick={handleClick}
        className="flex justify-center rounded-lg px-6 pt-5 pb-5 text-3xl font-extrabold text-white
        bg-gradient-to-r from-sky-600 to-pink-400"
      >
        비교하기!
      </button>
    </div>
  );
};
