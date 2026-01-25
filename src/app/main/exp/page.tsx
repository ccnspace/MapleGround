"use client";

import { Suspense } from "react";
import { ExpContentContainer } from "@/components/Container/ExpContentContainer";
import { useNickname } from "@/hooks/useNickname";
import { useCharacterStore } from "@/stores/character";
import { useEffect } from "react";
import { CommonWrapper } from "@/components/Container/CommonWrapper";
import { CommonTitle } from "@/components/Container/CommonTitle";
import { LoadingContainer } from "@/components/Container/LoadingContainer";

const ExpPageContent = () => {
  const nickname = useNickname({ isEnableErrorModal: false });
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

  // nickname이 있을 때만 로딩 체크, 없으면 바로 컨텐츠 표시
  const isLoading = nickname && fetchStatus !== "success";

  if (isLoading) {
    return <LoadingContainer />;
  }

  return (
    <CommonWrapper>
      <div className="flex max-[600px]:pt-0.5 px-2 w-[1366px] flex-col max-[600px]:w-full max-[600px]:px-0.5 gap-5">
        <div className="flex flex-col gap-4">
          <CommonTitle title="📊 경험치 효율 계산">
            <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">NEW (25년 12월 업데이트 반영)</span>
          </CommonTitle>
        </div>
        <ExpContentContainer nickname={nickname} />
      </div>
    </CommonWrapper>
  );
};

export default function ExpPage() {
  return (
    <Suspense fallback={<LoadingContainer />}>
      <ExpPageContent />
    </Suspense>
  );
}
