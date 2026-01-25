"use client";

import { ReactElement } from "react";
import { ProfileWrapper } from "./Profile";
import { useCharacterStore } from "@/stores/character";

export type SideBarItemType = {
  icon: ReactElement | string;
  title: string;
  src: string;
  isUpdated?: boolean;
};

export const SideBar = () => {
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);
  const isSuccess = fetchStatus === "success";

  if (!isSuccess) return null;

  return (
    <div className="sidebar flex-shrink-0 w-96 font-bold text-md">
      <ProfileWrapper />
      {/* <nav className="mt-3">
        <ul className="flex flex-col gap-0.5 mx-5 bg-white/30 dark:bg-black/30 rounded-lg py-1.5 px-2 backdrop-blur-sm">
          <SideBarItem icon={"🏠"} title={"메인으로"} src={`/main?name=${nickname}`} isUpdated={false} />
          <SideBarItem icon={"⚔️"} title={"과거 vs 현재 대결"} src={`/main/vs?name=${nickname}`} isUpdated={false} />
          <SideBarItem icon={"📊"} title={"경험치 효율 계산"} src={`/main/exp?name=${nickname}`} isUpdated />
          <SideBarItem icon={"🗡️"} title={"무기 해방 날짜 계산"} src={`/main/weapon?name=${nickname}`} isUpdated />
          <SideBarItem icon={"🪙"} title={"주간보스 정산(Coming Soon)"} src={""} isUpdated={false} />
        </ul>
      </nav> */}
    </div>
  );
};
