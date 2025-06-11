import { calculateBossTrace, type Boss, type BossConfig } from "@/utils/genesis";
import { ContainerWrapper } from "./ContainerWrapper";
import { useState } from "react";
import { GenesisUnlock } from "../WeaponUnlock/GenesisUnlock";
import { DestinyUnlock } from "../WeaponUnlock/DestinyUnlock";

type WeaponUnlockTab = "genesis" | "destiny";

export const WeaponUnlockContainer = () => {
  const [tab, setTab] = useState<WeaponUnlockTab>("genesis");
  return (
    <ContainerWrapper className="expContent_container h-[700px] overflow-y-auto">
      <div className="flex flex-col">
        <div className="flex items-center mb-2 justify-between">
          <p className="flex font-extrabold text-base mb-2 px-2 pb-0.5 pt-0.5 border-l-4 border-l-purple-400/80 text-gray-900 dark:text-gray-100">
            무기 해방 날짜 계산
          </p>
          <div className="flex items-center mb-2 gap-2">
            <button
              className={`px-2 py-1.5 text-xs rounded-md ${
                tab === "genesis"
                  ? "bg-gradient-to-b from-rose-900/90 to-rose-500/70 hover:bg-rose-900/90 font-bold text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setTab("genesis")}
            >
              제네시스
            </button>
            <button
              className={`px-2 py-1.5 text-xs rounded-md ${
                tab === "destiny"
                  ? "bg-gradient-to-b from-blue-900/90 to-sky-500/70 hover:bg-sky-900/90 font-bold text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setTab("destiny")}
            >
              데스티니
            </button>
          </div>
        </div>
        {tab === "genesis" && <GenesisUnlock />}
        {tab === "destiny" && <DestinyUnlock />}
      </div>
    </ContainerWrapper>
  );
};
