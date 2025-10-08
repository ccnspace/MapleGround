"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { ContainerWrapper } from "./ContainerWrapper";
import { useCharacterInfo } from "@/hooks/useCharacterInfo";

export const SetEffectContainer = () => {
  const { characterInfo } = useCharacterInfo();
  const { set_effect } = characterInfo?.setEffect || {};
  const [selectedSetIndex, setSelectedSetIndex] = useState<string>("");

  const handleMouseEnter = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    const parent = target.closest(".setbox");
    if (!parent || parent.childElementCount === 0) return;

    setSelectedSetIndex(parent.id);
  }, []);

  return (
    <ContainerWrapper className="h-[240px]  overflow-y-auto">
      <div className="flex justify-between mb-2">
        <p
          className="flex font-extrabold text-base mb-2 px-2 pb-0.5 pt-0.5 
        border-l-4 border-l-green-400/80
        max-[600px]:text-sm items-center
       "
        >
          세트 효과
        </p>
      </div>
      {set_effect && set_effect.length > 0 ? (
        <div className="flex flex-col gap-2">
          {set_effect.map((set, index) => {
            const lastSetEffect = set.set_effect_info[set.set_effect_info.length - 1];
            const activeSetCount = lastSetEffect?.set_count || 0;

            return (
              <div
                key={index}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setSelectedSetIndex("")}
                id={index.toString()}
                className="setbox flex items-center justify-between py-2 px-3 rounded-md bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300/50 dark:hover:bg-white/10 cursor-pointer"
              >
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{set.set_name}</span>
                <div className="flex flex-row items-center gap-1">
                  {activeSetCount === 0 && <span className="text-sm font-bold text-gray-500">세트효과 미발동</span>}
                  {activeSetCount > 0 && <span className="text-sm font-bold text-green-500">{activeSetCount}세트효과 발동</span>}
                  <span className="text-xs text-gray-500 dark:text-gray-400">({set.total_set_count}개 착용)</span>
                </div>
                {/* 호버 시 세트 효과 목록 표시 */}
                {selectedSetIndex === index.toString() && (
                  <div className="absolute z-50 mt-[-100px] text-white bg-slate-950/90 dark:bg-[#121212]/90 border border-gray-700 rounded-md shadow-lg p-3 w-80">
                    <div className="text-xs font-semibold mb-2">{set.set_name} 효과</div>
                    <div className="space-y-1">
                      {set.set_option_full.map((effect, effectIndex) => {
                        const isActive = set.set_effect_info.some((activeEffect) => activeEffect.set_count === effect.set_count);
                        return (
                          <div
                            key={effectIndex}
                            className={`flex items-center gap-1 text-xs py-0.5 rounded ${
                              isActive ? "text-green-400 font-medium" : "text-gray-400"
                            }`}
                          >
                            <div>
                              <span className="font-semibold border border-gray-600 rounded-md px-1 py-0.5">{effect.set_count}세트</span>
                              <span>{` ${effect.set_option}`}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="flex font-bold text-sm text-slate-950/50 dark:text-white/60">세트 효과 정보를 불러오는 중입니다...</p>
        </div>
      )}
    </ContainerWrapper>
  );
};
