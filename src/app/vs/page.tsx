"use client";

import { PlainBox } from "@/components/PlainBox";
import { InfoIcon } from "@/components/svg/InfoIcon";
import { CharacterCard } from "./CharacterCard";
import { useCharacterStore } from "@/stores/character";
import { openModal } from "@/utils/openModal";

export default function Page() {
  const handleClick = () => {
    const hasCharacterFetched =
      useCharacterStore.getState().status === "success";
    if (!hasCharacterFetched) {
      openModal({ message: "먼저 왼쪽에서 캐릭터명을 검색해 주세요." });
      return;
    }
  };

  return (
    <div className="flex px-5 pt-8 w-full flex-col">
      <div className="flex flex-col gap-3">
        <p className="text-2xl font-bold">과거의 나와 대결</p>
        <PlainBox>
          <p className="flex items-center gap-1 justify-center font-medium text-slate-700">
            <InfoIcon />
            사용 전 확인!
          </p>
        </PlainBox>
      </div>
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
    </div>
  );
}
