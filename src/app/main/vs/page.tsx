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
      <div className="main_loading w-[1366px] h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <Spinner width="6em" height="6em" color={theme === "dark" ? "white" : "#616161"} />
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse font-medium tracking-wide">정보를 불러오는 중입니다</p>
      </div>
    );
  }

  return (
    <div className="flex pt-8 px-2 w-[1366px] flex-col">
      <div className="flex flex-col gap-4">
        <p className="text-3xl font-bold flex items-center gap-2">
          ⚔️ 과거 vs 현재 대결
          <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">UPDATED</span>
        </p>
        <PlainBox>
          <div className="flex flex-col gap-2">
            <p className="flex gap-1 items-center font-medium text-slate-700 dark:text-white">
              <InfoIcon />
              사용 전 확인!
            </p>
            <p className="-mt-1 font-medium text-sm">
              {"• 첫 번째 캐릭터의 날짜를 두 번째보다 "}
              <span className="underline underline-offset-4 decoration-2 decoration-sky-600">과거로 설정</span>
              {"해 주세요."}
            </p>
          </div>
        </PlainBox>
      </div>
      <ReportContainer nickname={nickname} />
    </div>
  );
}
