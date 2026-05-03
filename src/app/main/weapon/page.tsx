"use client";

import { Suspense } from "react";
import { LiberationCalculatorContainer } from "@/components/Container/LiberationCalculatorContainer";
import { useNickname } from "@/hooks/useNickname";
import { useCharacterStore } from "@/stores/character";
import { useEffect } from "react";
import { PlainBox } from "@/components/PlainBox";
import { CommonWrapper } from "@/components/Container/CommonWrapper";
import { CommonTitle } from "@/components/Container/CommonTitle";
import { LoadingContainer } from "@/components/Container/LoadingContainer";

const WeaponPageContent = () => {
  const nickname = useNickname();
  const fetchCharacterAttributes = useCharacterStore((state) => state.fetchCharacterAttributes);
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);

  useEffect(() => {
    if (!nickname) return;

    const abortController = new AbortController();
    fetchCharacterAttributes(nickname, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [nickname, fetchCharacterAttributes]);

  if (fetchStatus !== "success") {
    return <LoadingContainer />;
  }

  return (
    <CommonWrapper>
      <div className="flex max-[600px]:pt-0.5 px-2 w-[1366px] flex-col max-[600px]:w-full max-[600px]:px-0.5 gap-5">
        <div className="flex flex-col gap-4">
          <CommonTitle title="🗡️ 해방 날짜 계산">
            <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">NEW</span>
          </CommonTitle>
          <PlainBox>
            <div className="flex flex-col gap-1">
              <p className="font-medium text-sm max-[600px]:text-xs">
                {"📢 "}
                <span className="font-bold">무기 해방 날짜 계산</span>
                {" / "}
                <span className="font-bold">아스트라 보조무기 해방 날짜 계산</span>
                {" 두 가지를 지원합니다."}
              </p>
              <p className="font-medium text-sm max-[600px]:text-xs">
                {"📢 "}
                <span className="font-bold">주간 클리어 보스</span>
                {" / "}
                <span className="font-bold">일일 퀘스트</span>
                {" 데이터를 설정하면, 예상 해방 날짜가 계산됩니다."}
              </p>
            </div>
          </PlainBox>
        </div>
        <LiberationCalculatorContainer />
      </div>
    </CommonWrapper>
  );
};

export default function WeaponPage() {
  return (
    <Suspense fallback={<LoadingContainer />}>
      <WeaponPageContent />
    </Suspense>
  );
}
