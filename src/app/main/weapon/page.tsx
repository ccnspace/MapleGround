"use client";

import { WeaponUnlockContainer } from "@/components/Container/WeaponUnlockContainer";
import { useNickname } from "@/hooks/useNickname";
import { useCharacterStore } from "@/stores/character";
import { useEffect } from "react";
import { PlainBox } from "@/components/PlainBox";
import { CommonWrapper } from "@/components/Container/CommonWrapper";
import { CommonTitle } from "@/components/Container/CommonTitle";
import { LoadingContainer } from "@/components/Container/LoadingContainer";

export default function WeaponPage() {
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
          <CommonTitle title="🗡️ 무기 해방 날짜 계산">
            <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">UPDATED</span>
          </CommonTitle>
          <PlainBox>
            <div className="flex flex-col gap-2">
              <p className="-mt-1 font-medium text-sm max-[600px]:text-xs text-white">
                {"📢 "}
                <span className="text-cyan-300 font-bold">주간 클리어 보스</span>
                {" 데이터를 설정하면, 예상 해방 날짜가 계산됩니다."}
              </p>
              <p className="-mt-1 font-medium text-sm max-[600px]:text-xs text-white">
                {"📢 "}
                <span className="text-cyan-300 font-bold">미션 클리어 당시 파티 인원</span>
                {"은, 해당 보스의 미션을 클리어 했을 때의 파티 인원입니다."}
              </p>
            </div>
          </PlainBox>
        </div>
        <WeaponUnlockContainer />
      </div>
    </CommonWrapper>
  );
}
