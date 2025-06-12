import { type BossConfig as GenesisBossConfig, type MissionBossConfig as GenesisMissionBossConfig } from "@/utils/genesis";
import { type BossConfig as DestinyBossConfig, type MissionBossConfig as DestinyMissionBossConfig } from "@/utils/destiny";
import { ContainerWrapper } from "./ContainerWrapper";
import { useState } from "react";
import { GenesisUnlock } from "../WeaponUnlock/GenesisUnlock";
import { DestinyUnlock } from "../WeaponUnlock/DestinyUnlock";
import { openModal } from "@/utils/openModal";
import { useNickname } from "@/hooks/useNickname";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DestinyUnlockData, GenesisUnlockData } from "@/utils/localStorage";

type WeaponUnlockTab = "genesis" | "destiny";

export const WeaponUnlockContainer = () => {
  const [tab, setTab] = useState<WeaponUnlockTab>("genesis");
  const nickname = useNickname();
  const { set: setGenesisLocalStorage, value: genesisUnlock, remove: removeGenesisLocalStorage } = useLocalStorage("genesisUnlock");
  const { set: setDestinyLocalStorage, value: destinyUnlock, remove: removeDestinyLocalStorage } = useLocalStorage("destinyUnlock");
  const [genesisData, setGenesisData] = useState<GenesisUnlockData | null>(null);
  const [destinyData, setDestinyData] = useState<DestinyUnlockData | null>(null);

  const saveGenesisConfig = () => {
    const newWeaponUnlock = {
      ...(genesisUnlock || {}),
      [nickname]: {
        ...(genesisUnlock?.[nickname] || {}),
        ...genesisData,
      },
    };

    openModal({
      type: "confirm",
      message: `[제네시스] 설정한 값을 저장하시겠습니까?\n"${nickname}" 캐릭터에 저장합니다.`,
      confirmCallback: () => {
        setGenesisLocalStorage(newWeaponUnlock);
      },
    });
  };

  const saveDestinyConfig = () => {
    const newWeaponUnlock = {
      ...(destinyUnlock || {}),
      [nickname]: {
        ...(destinyUnlock?.[nickname] || {}),
        ...destinyData,
      },
    };
    openModal({
      type: "confirm",
      message: `[데스티니] 설정한 값을 저장하시겠습니까?\n"${nickname}" 캐릭터에 저장합니다.`,
      confirmCallback: () => {
        setDestinyLocalStorage(newWeaponUnlock);
      },
    });
  };

  const saveConfig = () => {
    if (tab === "genesis") {
      saveGenesisConfig();
    } else {
      saveDestinyConfig();
    }
  };

  const resetConfig = () => {
    const tabName = tab === "genesis" ? "제네시스" : "데스티니";
    openModal({
      type: "confirm",
      message: `[${tabName}] 설정값을 삭제하시겠습니까?\n"${nickname}" 캐릭터의 설정값만 삭제됩니다.`,
      confirmCallback: () => {
        if (tab === "genesis") {
          const { [nickname]: _, ...rest } = genesisUnlock || {};
          setGenesisLocalStorage(rest);
        } else {
          const { [nickname]: _, ...rest } = destinyUnlock || {};
          setDestinyLocalStorage(rest);
        }
      },
    });
  };

  return (
    <ContainerWrapper className="expContent_container h-[700px] overflow-y-auto">
      <div className="flex flex-col">
        <div className="flex items-center mb-2 justify-between">
          <p className="flex font-extrabold text-base mb-2 px-2 pb-0.5 pt-0.5 gap-2 border-l-4 border-l-purple-400/80 text-gray-900 dark:text-gray-100">
            무기 해방 날짜 계산
            <button
              title="설정값 저장"
              onClick={saveConfig}
              className="px-1 py-0.5 text-sm rounded-md bg-slate-300 dark:bg-gray-700 hover:bg-slate-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              💾
            </button>
            <button
              title="설정값 삭제"
              onClick={resetConfig}
              className="px-1 py-0.5 text-sm rounded-md bg-slate-300 dark:bg-gray-700 hover:bg-slate-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              ⛔
            </button>
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
        {tab === "genesis" && <GenesisUnlock onSave={setGenesisData} />}
        {tab === "destiny" && <DestinyUnlock onSave={setDestinyData} />}
      </div>
    </ContainerWrapper>
  );
};
