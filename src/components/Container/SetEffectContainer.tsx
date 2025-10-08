"use client";

import { ContainerWrapper } from "./ContainerWrapper";

export const SetEffectContainer = () => {
  return (
    <ContainerWrapper className="h-[240px]">
      <div className="flex justify-between mb-2">
        <p
          className="flex font-extrabold text-base mb-2 px-2 pb-0.5 pt-0.5 
        border-l-4 border-l-orange-400/80
        max-[600px]:text-sm items-center
       "
        >
          세트 효과
        </p>
      </div>
      <div className="flex items-center justify-center h-full">
        <p className="flex font-bold text-sm text-slate-950/50 dark:text-white/60">세트 효과 정보를 불러오는 중입니다...</p>
      </div>
    </ContainerWrapper>
  );
};
