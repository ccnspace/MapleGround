"use client";

import { useCharacterStore } from "@/stores/character";
import { CharacterCard } from "./CharacterCard";
import { useVersusInfo } from "@/hooks/useVersusInfo";
import { DimmedLayer } from "@/components/DimmedLayer";
import { useCallback, useEffect } from "react";
import { useModalStore } from "@/stores/modal";

export const ReportContainer = ({ nickname }: { nickname: string }) => {
  const {
    firstPersonInfo,
    secondPersonInfo,
    requestPersonData,
    validateReport,
    resetPersonData,
    resetVersusSimpleReport,
    isLoading,
    versusSimpleReport,
  } = useVersusInfo();

  const handleClick = async () => {
    if (versusSimpleReport.length > 0) {
      useModalStore.getState().setModal({
        type: "confirm",
        message: "날짜를 변경하여 기존 데이터를 초기화한 다음\n다시 시도해 주세요.",
      });
      return;
    }

    if (validateReport()) {
      // TODO: 비교 리포트 만들기
      const { characterAttributes } = useCharacterStore.getState();
      if (!characterAttributes) return;

      await requestPersonData(nickname);
    }
  };

  const resetReport = useCallback(() => {
    if (versusSimpleReport.length > 0) {
      resetVersusSimpleReport();
    }
    // TODO: detail report 초기화
  }, [versusSimpleReport.length]);

  // 페이지 나갈 때 초기화
  useEffect(() => {
    return () => {
      resetPersonData();
    };
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-6 mt-8 px-6">
        {/* 캐릭터 카드 컨테이너 */}
        <div className="flex flex-row items-center gap-6 w-full min-w-[800px] max-w-4xl">
          <div className="w-[360px] flex-shrink-0">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 text-center">과거 캐릭터</h3>
            <CharacterCard
              type="first"
              direction="left"
              nickname={firstPersonInfo?.basic?.character_name}
              characterImageUrl={firstPersonInfo?.basic?.character_image}
              resetReport={resetReport}
            />
          </div>

          {/* VS 배너 - 중앙에 위치 */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-6xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              VS
            </div>
          </div>

          <div className="w-[360px] flex-shrink-0">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 text-center">현재 캐릭터</h3>
            <CharacterCard
              type="second"
              direction="right"
              nickname={secondPersonInfo?.basic?.character_name}
              characterImageUrl={secondPersonInfo?.basic?.character_image}
              resetReport={resetReport}
            />
          </div>
        </div>

        {/* 비교 버튼 */}
        <div className="mt-3 w-full max-w-md">
          <button
            onClick={handleClick}
            className="w-full py-4 px-2 rounded-2xl text-xl font-bold text-white
              bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
              hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600
              transform hover:scale-105 transition-all duration-300
              shadow-[0_8px_25px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_35px_rgba(99,102,241,0.35)]
              active:scale-95 relative overflow-hidden group"
          >
            {/* 배경 애니메이션 효과 */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent 
              -translate-x-full group-hover:translate-x-full transition-transform duration-700"
            ></div>

            <span className="flex items-center justify-center gap-2 relative z-10">
              <span className="font-extrabold text-2xl text-white drop-shadow-sm">비교하기!</span>
            </span>
          </button>
        </div>

        {/* 비교 리포트 */}
        {versusSimpleReport.length > 0 && (
          <div className="flex flex-col items-center gap-1 mt-3 mb-6 w-full max-w-lg">
            {versusSimpleReport.map((item) => (
              <div
                key={item.name}
                className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-100 dark:border-slate-700/50"
              >
                <div className="grid grid-cols-3 items-center">
                  {/* 왼쪽 수치 */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div
                      className={`text-base font-semibold ${
                        item.isWinner === "first" ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {item.firstPerson}
                    </div>
                  </div>

                  {/* 중앙 영역 */}
                  <div className="flex flex-col items-center gap-0.5">
                    {/* 항목명 */}
                    <div className="text-sm font-bold text-slate-00 dark:text-slate-200">{item.name}</div>

                    {/* WIN 라벨 */}
                    {item.isWinner === "first" && (
                      <div className="px-1.5 py-0.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-medium rounded-full">
                        과거 WIN
                      </div>
                    )}
                    {item.isWinner === "second" && (
                      <div className="px-1.5 py-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-medium rounded-full">
                        현재 WIN
                      </div>
                    )}
                  </div>

                  {/* 오른쪽 수치 */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div
                      className={`text-base font-semibold ${
                        item.isWinner === "second" ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {item.secondPerson}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoading && <DimmedLayer spinner />}
    </>
  );
};
