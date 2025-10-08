"use client";

import { ReactElement } from "react";
import { ProfileWrapper } from "./Profile";
import { StarIcon } from "./svg/StarIcon";
import { SideBarItem } from "./SideBarItem";
import { useCharacterStore } from "@/stores/character";
import { useNickname } from "@/hooks/useNickname";

export type SideBarItemType = {
  icon: ReactElement | string;
  title: string;
  src: string;
  isUpdated?: boolean;
};

export const SideBar = () => {
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);
  const isSuccess = fetchStatus === "success";
  const nickname = useNickname();

  if (!isSuccess) return null;

  return (
    <div className="sidebar flex-shrink-0 w-96 font-bold text-lg border-r border-r-slate-200 dark:border-r-white/10">
      <ProfileWrapper />
      <nav className="mt-3">
        <ul className="flex flex-col gap-0.5">
          <SideBarItem icon={"🏠"} title={"메인으로"} src={`/main?name=${nickname}`} isUpdated={false} />
        </ul>
        <ul className="flex flex-col gap-0.5">
          <SideBarItem icon={"⚔️"} title={"과거 vs 현재 대결"} src={`/main/vs?name=${nickname}`} isUpdated={false} />
          <SideBarItem icon={"📊"} title={"경험치 효율 계산"} src={`/main/exp?name=${nickname}`} isUpdated />
          <SideBarItem icon={"🗡️"} title={"무기 해방 날짜 계산"} src={`/main/weapon?name=${nickname}`} isUpdated />
        </ul>
      </nav>
    </div>
  );
};
