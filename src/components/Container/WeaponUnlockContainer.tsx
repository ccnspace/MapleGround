import { ContainerWrapper } from "./ContainerWrapper";
import { useState } from "react";
import { GenesisUnlock } from "../WeaponUnlock/GenesisUnlock";
import { DestinyUnlock } from "../WeaponUnlock/DestinyUnlock";
import { openModal } from "@/utils/openModal";
import { useNickname } from "@/hooks/useNickname";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DestinyUnlockData, GenesisUnlockData } from "@/utils/localStorage";
import Image from "next/image";
import genesisIcon from "@/images/genesis.png";
import destinyIcon from "@/images/destiny.png";

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
    <div className="flex items-center justify-center p-3 rounded-lg">
      <div
        className="flex flex-col items-center bg-white/70 dark:bg-black/50
      max-[600px]:p-1 max-[600px]:pt-2 py-2 px-3 rounded-lg w-fit"
      >
        <div className="flex mb-2 justify-between w-full">
          <p
            className="flex font-bold mb-2 pb-0.5 pt-0.5 gap-2
    text-gray-900 dark:text-gray-100
    max-[600px]:text-xs text-sm items-center"
          >
            <button
              title="저장"
              onClick={saveConfig}
              className="p-1 pr-2 rounded-md bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              💾 저장
            </button>
            <button
              title="삭제"
              onClick={resetConfig}
              className="p-1 pr-2 rounded-md bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              ⛔ 삭제
            </button>
          </p>
          <div className="flex items-center mb-2 gap-2">
            <button
              className={`px-2 py-1.5 text-xs rounded-md max-[600px]:px-1 ${
                tab === "genesis"
                  ? "bg-gradient-to-b from-rose-900/90 to-rose-500/70 hover:bg-rose-900/90 font-bold text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setTab("genesis")}
            >
              <p className="flex items-center gap-1">
                <Image src={genesisIcon} alt="제네시스" width={24} height={24} unoptimized style={{ imageRendering: "pixelated" }} />
                제네시스
              </p>
            </button>
            <button
              className={`px-2 py-1.5 text-xs rounded-md max-[600px]:px-1 ${
                tab === "destiny"
                  ? "bg-gradient-to-b from-blue-900/90 to-sky-500/70 hover:bg-sky-900/90 font-bold text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setTab("destiny")}
            >
              <p className="flex items-center gap-1">
                <Image src={destinyIcon} alt="데스티니" width={24} height={24} unoptimized style={{ imageRendering: "pixelated" }} />
                데스티니
              </p>
            </button>
          </div>
        </div>
        {tab === "genesis" && <GenesisUnlock onSave={setGenesisData} />}
        {tab === "destiny" && <DestinyUnlock onSave={setDestinyData} />}
      </div>
    </div>
  );
};
