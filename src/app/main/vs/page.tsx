"use client";

import { PlainBox } from "@/components/PlainBox";
import { ReportContainer } from "./ReportContainer";
import { useCharacterStore } from "@/stores/character";
import { useEffect } from "react";
import { useNickname } from "@/hooks/useNickname";
import { CommonWrapper } from "@/components/Container/CommonWrapper";
import { CommonTitle } from "@/components/Container/CommonTitle";
import { LoadingContainer } from "@/components/Container/LoadingContainer";

export default function Page() {
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
      <div className="flex px-2 w-[1366px] flex-col max-[600px]:w-full max-[600px]:px-0.5">
        <div className="flex flex-col gap-4">
          <CommonTitle title="⚔️ 과거 vs 현재 대결" />
          <PlainBox>
            <div className="flex flex-col gap-2 w-full">
              <p className="-mt-1 font-medium text-sm max-[600px]:text-xs text-white">
                {"📢 첫 번째 캐릭터를 두 번째 캐릭터보다 과거로 설정해 주세요."}
              </p>
              <p className="-mt-1 font-medium text-sm max-[600px]:text-xs text-white">
                {"📢 반지는 정확한 1:1 비교가 어려울 수 있습니다."}
              </p>
            </div>
          </PlainBox>
        </div>
        <ReportContainer nickname={nickname} />
      </div>
    </CommonWrapper>
  );
}
