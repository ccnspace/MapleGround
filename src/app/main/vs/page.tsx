"use client";

import { PlainBox } from "@/components/PlainBox";
import { InfoIcon } from "@/components/svg/InfoIcon";
import { ReportContainer } from "./ReportContainer";
import { useCharacterStore } from "@/stores/character";
import { useEffect } from "react";
import { useNickname } from "@/hooks/useNickname";
import { Spinner } from "@/components/svg/Spinner";
import { useTheme } from "next-themes";

export default function Page() {
  const nickname = useNickname();
  const fetchCharacterAttributes = useCharacterStore((state) => state.fetchCharacterAttributes);
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);
  const { theme } = useTheme();

  useEffect(() => {
    if (!nickname) return;

    const abortController = new AbortController();
    fetchCharacterAttributes(nickname, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [nickname, fetchCharacterAttributes]);

  if (fetchStatus !== "success") {
    return (
      <div className="main_loading w-[1366px] h-[calc(100vh-80px)] flex flex-col items-center justify-center max-[600px]:w-full">
        <Spinner width="6em" height="6em" color={theme === "dark" ? "white" : "#616161"} />
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse font-medium tracking-wide">정보를 불러오는 중입니다</p>
      </div>
    );
  }

  return (
    <div className="flex pt-8 px-2 w-[1366px] flex-col max-[600px]:w-full max-[600px]:px-0.5">
      <div className="flex flex-col gap-4">
        <p className="text-3xl font-bold flex items-center gap-2 flex-wrap max-[600px]:hidden">⚔️ 과거 vs 현재 대결</p>
        <PlainBox>
          <div className="flex flex-col gap-2">
            <p className="flex gap-1 items-center font-medium text-slate-700 dark:text-white max-[600px]:text-sm">
              <InfoIcon />
              사용 전 확인!
            </p>
            <p className="-mt-1 font-medium text-sm max-[600px]:text-xs">
              {"• 첫 번째 캐릭터의 날짜를 두 번째보다 "}
              <span className="underline underline-offset-4 decoration-2 decoration-sky-600">과거로 설정</span>
              {"해 주세요."}
            </p>
            <p className="-mt-1 font-medium text-sm max-[600px]:text-xs">{"• 반지는 정확한 1:1 비교가 어려울 수 있습니다."}</p>
          </div>
        </PlainBox>
      </div>
      <ReportContainer nickname={nickname} />
    </div>
  );
}
