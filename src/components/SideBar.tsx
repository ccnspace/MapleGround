"use client";

import { ReactElement } from "react";
import { ProfileWrapper } from "./Profile";
import { SideBarItem } from "./SideBarItem";
import { useCharacterStore } from "@/stores/character";
import { useNickname } from "@/hooks/useNickname";
import { usePathname } from "next/navigation";
import { useLoggedInStore } from "@/stores/loggedIn";

export type SideBarItemType = {
  icon: ReactElement | string;
  title: string;
  src: string;
  isUpdated?: boolean;
};

export const SideBar = () => {
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);
  const loggedInUserInfo = useLoggedInStore((state) => state.loggedInUserInfo);
  const isSuccess = fetchStatus === "success";

  const pathname = usePathname();
  const isMyPage = pathname.startsWith("/my");

  const nickname = useNickname(!isMyPage);
  const isMyDisabled = !loggedInUserInfo;

  if (!isSuccess && !isMyPage) return null;

  return (
    <div className={`sidebar flex-shrink-0 w-96 font-bold text-md ${isMyPage ? "mt-6" : ""}`}>
      {!isMyPage && <ProfileWrapper />}
      <nav className="mt-3">
        <ul className="flex flex-col gap-0.5 mx-5 bg-white/30 dark:bg-black/30 rounded-lg py-1.5 px-2 backdrop-blur-sm">
          <SideBarItem
            icon={"↗️"}
            title={"마이메이플"}
            src={`/my`}
            disabled={isMyDisabled}
            isUpdated
            tooltip={isMyDisabled ? "로그인 후 이용할 수 있습니다." : undefined}
            className="bg-gradient-to-r from-sky-400 to-green-400 hover:from-sky-500 hover:to-green-500
            dark:bg-gradient-to-r dark:from-sky-600 dark:to-green-400 dark:hover:from-sky-600 dark:hover:to-green-600
            "
          />
          <SideBarItem icon={"🏠"} title={"메인으로"} src={`/main?name=${nickname}`} isUpdated={false} />
          <SideBarItem icon={"⚔️"} title={"과거 vs 현재 대결"} src={`/main/vs?name=${nickname}`} isUpdated={false} />
          <SideBarItem icon={"📊"} title={"경험치 효율 계산"} src={`/main/exp?name=${nickname}`} isUpdated={false} />
          <SideBarItem icon={"🗡️"} title={"무기 해방 날짜 계산"} src={`/main/weapon?name=${nickname}`} isUpdated={false} />
          <SideBarItem icon={"🪙"} title={"주간보스 정산(Coming Soon)"} src={""} isUpdated={false} />
        </ul>
      </nav>
    </div>
  );
};
