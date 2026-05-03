import { useState } from "react";
import { WeaponUnlockContainer } from "./WeaponUnlockContainer";
import { AstraUnlockContainer } from "./AstraUnlockContainer";

type OuterTab = "weapon" | "astra";

export const LiberationCalculatorContainer = () => {
  const [tab, setTab] = useState<OuterTab>("weapon");

  return (
    <div className="flex flex-col items-center w-full gap-3">
      <div className="flex w-full max-w-[820px] items-center justify-center gap-2 px-3 max-[600px]:px-0 max-[600px]:gap-1.5">
        <button
          onClick={() => setTab("weapon")}
          className={`flex-1 px-3 py-2 max-[600px]:px-2 max-[600px]:py-1.5 rounded-md text-sm max-[600px]:text-xs font-bold transition-colors ${
            tab === "weapon"
              ? "bg-gradient-to-b from-rose-900/90 to-rose-500/70 text-white shadow"
              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          }`}
        >
          🗡️ 무기 해방 날짜 계산
        </button>
        <button
          onClick={() => setTab("astra")}
          className={`flex-1 px-3 py-2 max-[600px]:px-2 max-[600px]:py-1.5 rounded-md text-sm max-[600px]:text-xs font-bold transition-colors ${
            tab === "astra"
              ? "bg-gradient-to-b from-purple-900/90 to-fuchsia-500/70 text-white shadow"
              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          }`}
        >
          ⚜️ 아스트라 보조무기 해방 날짜 계산
        </button>
      </div>

      {tab === "weapon" ? <WeaponUnlockContainer /> : <AstraUnlockContainer />}
    </div>
  );
};
