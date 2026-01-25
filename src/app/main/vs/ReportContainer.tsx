"use client";

import { useCharacterStore } from "@/stores/character";
import { CharacterCard } from "./CharacterCard";
import { useVersusInfo } from "@/hooks/useVersusInfo";
import { DimmedLayer } from "@/components/DimmedLayer";
import { useCallback, useEffect } from "react";
import { useModalStore } from "@/stores/modal";
import { ReportCard } from "@/components/Report/ReportCard";
import { ReportSectionTitle } from "@/components/Report/ReportSectionTitle";
import { SimpleComparisonItem } from "@/components/Report/SimpleComparisonItem";
import { DetailedComparisonItem } from "@/components/Report/DetailedComparisonItem";

export const ReportContainer = ({ nickname }: { nickname: string }) => {
  const {
    firstPersonInfo,
    secondPersonInfo,
    requestPersonData,
    validateReport,
    resetPersonData,
    resetVersusReport,
    isLoading,
    versusSimpleReport,
    versusDetailReport,
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
      resetVersusReport();
    }
    // TODO: detail report 초기화
  }, [versusSimpleReport.length, resetVersusReport]);

  // 페이지 나갈 때 초기화
  useEffect(() => {
    return () => {
      resetPersonData();
    };
  }, [resetPersonData]);

  return (
    <>
      <div className="flex flex-col items-center gap-3 mt-8 mb-8 px-6 min-w-[1280px] max-[600px]:min-w-0 max-[600px]:px-2">
        {/* 캐릭터 카드 컨테이너 */}
        <div
          className="flex flex-row items-center justify-center gap-6 w-full
        min-w-[800px] max-w-4xl max-[600px]:min-w-0 max-[600px]:flex-col"
        >
          <div className="w-[360px] flex-shrink-0 max-[600px]:w-[320px]">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2 text-center ">첫 번째 캐릭터</h3>
            <CharacterCard
              type="first"
              direction="left"
              nickname={firstPersonInfo?.basic?.character_name}
              characterImageUrl={firstPersonInfo?.basic?.character_image}
              resetReport={resetReport}
            />
          </div>

          {/* 비교 버튼 */}
          <div className="flex flex-col items-center justify-center max-[600px]:my-4">
            <button
              onClick={handleClick}
              className="w-[180px] px-8 py-2.5 rounded-3xl text-base font-semibold text-white
            bg-gradient-to-r from-sky-500 to-cyan-500
            hover:from-sky-600 hover:to-cyan-600
            border-2 border-white/40
            max-[600px]:w-[280px] max-[600px]:text-sm max-[600px]:py-2 max-[600px]:mt-10"
            >
              <span className="flex items-center justify-center gap-2 font-bold text-xl">
                <span>비교하기</span>
              </span>
            </button>
          </div>

          <div className="w-[360px] flex-shrink-0 max-[600px]:w-[320px]">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2 text-center">두 번째 캐릭터</h3>
            <CharacterCard
              type="second"
              direction="right"
              nickname={secondPersonInfo?.basic?.character_name}
              characterImageUrl={secondPersonInfo?.basic?.character_image}
              resetReport={resetReport}
            />
          </div>
        </div>

        {/* 비교 리포트 */}
        <div
          className="w-full max-w-7xl min-w-[1280px] grid grid-cols-3 gap-6 mt-4 
          max-[600px]:min-w-0 max-[600px]:grid-cols-1 max-[600px]:gap-4 max-[600px]:px-0.5"
        >
          {/* 간단 비교 리포트 */}
          {versusSimpleReport.length > 0 && (
            <ReportCard className="h-[500px] max-[600px]:h-[400px] overflow-y-auto">
              <ReportSectionTitle title="간단 비교 리포트" gradientFrom="blue-500" gradientTo="indigo-500" />
              <div className="space-y-2 h-[calc(100%-3.5rem)] overflow-y-auto px-1">
                {versusSimpleReport.map((item) => (
                  <SimpleComparisonItem
                    key={item.name}
                    name={item.name}
                    firstPerson={item.firstPerson}
                    secondPerson={item.secondPerson}
                    isWinner={item.isWinner}
                  />
                ))}
              </div>
            </ReportCard>
          )}

          {/* 상세 비교 리포트 */}
          {versusDetailReport && (
            <>
              {/* 많이 성장시킨 아이템 */}
              <ReportCard className="h-[500px]">
                <ReportSectionTitle title="나를 성장시킨 아이템" gradientFrom="emerald-400" gradientTo="teal-500" />
                {versusDetailReport.positiveScores.length > 0 && (
                  <div className="space-y-3 h-[calc(100%-3.5rem)] overflow-y-auto px-1">
                    {versusDetailReport.positiveScores.map((item, index) => (
                      <DetailedComparisonItem
                        key={item.itemSlot}
                        index={index}
                        itemSlot={item.itemSlot}
                        firstPersonItemIcon={item.firstPersonItemIcon}
                        secondPersonItemIcon={item.secondPersonItemIcon}
                        score={item.score}
                        comparison={item.comparison}
                        variant="positive"
                      />
                    ))}
                  </div>
                )}
                {versusDetailReport.positiveScores.length === 0 && (
                  <div className="flex items-center justify-center h-[calc(100%-3.5rem)]">
                    <p className="text-slate-500 dark:text-slate-400">나를 성장시킨 아이템이 없습니다.</p>
                  </div>
                )}
              </ReportCard>

              {/* 전투력을 떨어트린 아이템 */}
              <ReportCard className="h-[500px]">
                <ReportSectionTitle title="성장을 방해한 아이템" gradientFrom="rose-400" gradientTo="pink-500" />
                {versusDetailReport.negativeScores.length > 0 && (
                  <div className="space-y-3 h-[calc(100%-3.5rem)] overflow-y-auto px-1">
                    {versusDetailReport.negativeScores.map((item, index) => (
                      <DetailedComparisonItem
                        key={item.itemSlot}
                        index={index}
                        itemSlot={item.itemSlot}
                        firstPersonItemIcon={item.firstPersonItemIcon}
                        secondPersonItemIcon={item.secondPersonItemIcon}
                        score={item.score}
                        comparison={item.comparison}
                        variant="negative"
                      />
                    ))}
                  </div>
                )}
                {versusDetailReport.negativeScores.length === 0 && (
                  <div className="flex items-center justify-center h-[calc(100%-3.5rem)]">
                    <p className="text-slate-500 dark:text-slate-400">성장을 방해한 아이템이 없습니다.</p>
                  </div>
                )}
              </ReportCard>
            </>
          )}
        </div>

        {versusSimpleReport.length === 0 && !versusDetailReport && (
          <div
            className="flex items-center justify-center h-[200px] w-full
          rounded-lg bg-slate-100 dark:bg-slate-600/80"
          >
            <p className="text-slate-500 dark:text-slate-400">비교 데이터가 없습니다.</p>
          </div>
        )}
      </div>

      {isLoading && <DimmedLayer spinner />}
    </>
  );
};
