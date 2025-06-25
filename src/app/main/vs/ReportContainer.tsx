"use client";

import { useCharacterStore } from "@/stores/character";
import { CharacterCard } from "./CharacterCard";
import { useVersusInfo } from "@/hooks/useVersusInfo";
import { DimmedLayer } from "@/components/DimmedLayer";
import { useCallback, useEffect, useState } from "react";
import { useModalStore } from "@/stores/modal";
import { STAT_LABELS, STAT_DISPLAY_ORDER } from "@/consts/statLabels";
import { ComparisonStats } from "@/types/Equipment";
import Image from "next/image";

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
  }, [versusSimpleReport.length]);

  // 페이지 나갈 때 초기화
  useEffect(() => {
    return () => {
      resetPersonData();
    };
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-3 mt-8 mb-8 px-6 min-w-[1280px] max-[600px]:min-w-0 max-[600px]:px-2">
        {/* 캐릭터 카드 컨테이너 */}
        <div className="flex flex-row items-center justify-center gap-6 w-full min-w-[800px] max-w-4xl max-[600px]:min-w-0 max-[600px]:flex-col">
          <div className="w-[360px] flex-shrink-0 max-[600px]:w-full">
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
          <div className="flex flex-col items-center justify-center max-[600px]:my-4">
            <div className="text-6xl font-black bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              VS
            </div>
          </div>

          <div className="w-[360px] flex-shrink-0 max-[600px]:w-full">
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
        <button
          onClick={handleClick}
          className="w-[280px] px-8 py-2.5 rounded-xl text-base font-semibold text-white
            bg-gradient-to-r from-indigo-500 to-purple-500
            hover:from-indigo-600 hover:to-purple-600
            transform transition-all duration-200
            shadow-[0_2px_12px_rgba(99,102,241,0.3)]
            active:scale-95 relative overflow-hidden
            max-[600px]:w-[240px] max-[600px]:text-sm max-[600px]:py-2"
        >
          <span className="flex items-center justify-center gap-2 font-bold text-lg">
            <span>비교하기</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>

        {/* 비교 리포트 */}
        <div
          className="w-full max-w-7xl min-w-[1280px] grid grid-cols-3 gap-6 mt-4 
          max-[600px]:min-w-0 max-[600px]:grid-cols-1 max-[600px]:gap-4 max-[600px]:px-0.5"
        >
          {/* 간단 비교 리포트 */}
          {versusSimpleReport.length > 0 && (
            <div className="w-full">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 max-[600px]:p-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 h-[500px] max-[600px]:h-[400px] overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-8 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
                  <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200">간단 비교 리포트</h4>
                </div>
                <div className="space-y-2 h-[calc(100%-3.5rem)] overflow-y-auto px-1">
                  {versusSimpleReport.map((item, index) => (
                    <div
                      key={item.name}
                      className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 border border-slate-100 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-all duration-300"
                    >
                      <div className="grid grid-cols-3 items-center gap-2">
                        {/* 왼쪽 수치 */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`text-xs font-semibold ${
                              item.isWinner === "first" ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {item.firstPerson}
                          </div>
                        </div>

                        {/* 중앙 영역 */}
                        <div className="flex flex-col items-center gap-1">
                          {/* 항목명 */}
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{item.name}</div>

                          {/* WIN 라벨 */}
                          {item.isWinner === "first" && (
                            <div className="px-1.5 py-0.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[10px] font-medium rounded-full">
                              과거 WIN
                            </div>
                          )}
                          {item.isWinner === "second" && (
                            <div className="px-1.5 py-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[10px] font-medium rounded-full">
                              현재 WIN
                            </div>
                          )}
                        </div>

                        {/* 오른쪽 수치 */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`text-xs font-semibold ${
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
              </div>
            </div>
          )}

          {/* 상세 비교 리포트 */}
          {versusDetailReport && (versusDetailReport.positiveScores.length > 0 || versusDetailReport.negativeScores.length > 0) && (
            <>
              {/* 많이 성장시킨 아이템 */}
              {versusDetailReport.positiveScores.length > 0 && (
                <div className="w-full">
                  <div className="h-[500px] bg-white dark:bg-slate-800 rounded-2xl p-5 max-[600px]:p-2 shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full"></div>
                      <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200">나를 성장시킨 아이템</h4>
                    </div>
                    <div className="space-y-3 h-[calc(100%-3.5rem)] overflow-y-auto px-1">
                      {versusDetailReport.positiveScores.map((item, index) => (
                        <div
                          key={item.itemSlot}
                          className="group relative bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            {/* 순위 */}
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>

                            {/* 아이템 아이콘들 */}
                            <div className="flex items-center gap-3 flex-1">
                              <Image
                                src={item.firstPersonItemIcon}
                                alt="과거 아이템"
                                width={48}
                                height={48}
                                unoptimized
                                style={{ width: "auto", height: "auto" }}
                                className="rounded-lg"
                              />
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </div>
                              <Image
                                src={item.secondPersonItemIcon}
                                alt="현재 아이템"
                                width={48}
                                height={48}
                                unoptimized
                                style={{ width: "auto", height: "auto" }}
                                className="rounded-lg"
                              />
                            </div>

                            {/* 점수 */}
                            <div className="flex-shrink-0">
                              <div className="text-right">
                                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{item.score.toFixed(1)}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{item.itemSlot}</div>
                              </div>
                            </div>
                          </div>

                          {/* 호버 시 상세 정보 */}
                          <div
                            className={`absolute left-1/2 -translate-x-1/2 ${
                              index < 2 ? "top-full mt-2" : "bottom-full mb-2"
                            } bg-white dark:bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-200 dark:border-slate-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 w-80`}
                          >
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">상세 비교 정보</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {STAT_DISPLAY_ORDER.map((key) => {
                                const value = (item.comparison as ComparisonStats)[key];
                                if (value === undefined) return null;

                                return (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">{STAT_LABELS[key]}</span>
                                    <span
                                      className={`font-semibold ${
                                        value > 0
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : value < 0
                                          ? "text-red-600 dark:text-red-400"
                                          : "text-slate-500 dark:text-slate-400"
                                      }`}
                                    >
                                      {value > 0 ? "+" : ""}
                                      {value}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 전투력을 떨어트린 아이템 */}
              {versusDetailReport.negativeScores.length > 0 && (
                <div className="w-full">
                  <div className="h-[500px] bg-white dark:bg-slate-800 rounded-2xl p-5 max-[600px]:p-2 shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-8 bg-gradient-to-b from-rose-400 to-pink-500 rounded-full"></div>
                      <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200">전투력을 떨어트린 아이템</h4>
                    </div>
                    <div className="space-y-3 h-[calc(100%-3.5rem)] overflow-y-auto px-1">
                      {versusDetailReport.negativeScores.map((item, index) => (
                        <div
                          key={item.itemSlot}
                          className="group relative bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            {/* 순위 */}
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>

                            {/* 아이템 아이콘들 */}
                            <div className="flex items-center gap-3 flex-1">
                              <Image
                                src={item.firstPersonItemIcon}
                                alt="과거 아이템"
                                width={48}
                                height={48}
                                unoptimized
                                style={{ width: "auto", height: "auto" }}
                                className="rounded-lg"
                              />
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </div>
                              <Image
                                src={item.secondPersonItemIcon}
                                alt="현재 아이템"
                                width={48}
                                height={48}
                                unoptimized
                                style={{ width: "auto", height: "auto" }}
                                className="rounded-lg"
                              />
                            </div>

                            {/* 점수 */}
                            <div className="flex-shrink-0">
                              <div className="text-right">
                                <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{item.score.toFixed(1)}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{item.itemSlot}</div>
                              </div>
                            </div>
                          </div>

                          {/* 호버 시 상세 정보 */}
                          <div
                            className={`absolute left-1/2 -translate-x-1/2 ${
                              index < 2 ? "top-full mt-2" : "bottom-full mb-2"
                            } bg-white dark:bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-200 dark:border-slate-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 w-80`}
                          >
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">상세 비교 정보</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {STAT_DISPLAY_ORDER.map((key) => {
                                const value = (item.comparison as ComparisonStats)[key];
                                if (value === undefined) return null;

                                return (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">{STAT_LABELS[key]}</span>
                                    <span
                                      className={`font-semibold ${
                                        value > 0
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : value < 0
                                          ? "text-red-600 dark:text-red-400"
                                          : "text-slate-500 dark:text-slate-400"
                                      }`}
                                    >
                                      {value > 0 ? "+" : ""}
                                      {value}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isLoading && <DimmedLayer spinner />}
    </>
  );
};
