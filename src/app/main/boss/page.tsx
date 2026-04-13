"use client";

import { Suspense, useEffect } from "react";
import { CommonWrapper } from "@/components/Container/CommonWrapper";
import { CommonTitle } from "@/components/Container/CommonTitle";
import { LoadingContainer } from "@/components/Container/LoadingContainer";
import { BossSettlementContent } from "@/components/Boss/BossSettlementContent";
import { useNickname } from "@/hooks/useNickname";
import { useCharacterStore } from "@/stores/character";

const BossPageContent = () => {
  // 주간보스 정산은 닉네임 없이도 접근 가능. 단, ?name= 이 붙어 오면 경험치 효율 탭처럼 캐릭터 fetch 를 걸어
  // 헤더의 부캐 스위처 등이 정상 동작하도록 맞춘다.
  const nickname = useNickname({ isEnableErrorModal: false });
  const fetchCharacterAttributes = useCharacterStore((state) => state.fetchCharacterAttributes);
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);

  useEffect(() => {
    if (!nickname) return;
    const abortController = new AbortController();
    fetchCharacterAttributes(nickname, abortController.signal);
    return () => abortController.abort();
  }, [nickname, fetchCharacterAttributes]);

  // nickname 이 있을 때만 로딩 체크, 없으면 바로 컨텐츠 표시
  const isLoading = nickname && fetchStatus !== "success";
  if (isLoading) return <LoadingContainer />;

  return (
    <CommonWrapper>
      <div className="flex max-[600px]:pt-0.5 px-2 w-[1366px] flex-col max-[600px]:w-full max-[600px]:px-0.5 gap-5">
        <div className="flex flex-col gap-4">
          <CommonTitle title="💰 주간보스 정산">
            <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">NEW</span>
          </CommonTitle>
        </div>
        <BossSettlementContent />
      </div>
    </CommonWrapper>
  );
};

export default function BossPage() {
  return (
    <Suspense fallback={<LoadingContainer />}>
      <BossPageContent />
    </Suspense>
  );
}
