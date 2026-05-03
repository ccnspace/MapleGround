import { useState } from "react";
import { AstraUnlock } from "../AstraUnlock/AstraUnlock";
import { openModal } from "@/utils/openModal";
import { useNickname } from "@/hooks/useNickname";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AstraUnlockData } from "@/utils/localStorage";

export const AstraUnlockContainer = () => {
  const nickname = useNickname() ?? "";
  const { set: setAstraLocalStorage, value: astraUnlock } = useLocalStorage("astraUnlock");
  const [astraData, setAstraData] = useState<AstraUnlockData | null>(null);

  const saveConfig = () => {
    const newAstraUnlock = {
      ...(astraUnlock || {}),
      [nickname]: {
        ...(astraUnlock?.[nickname] || {}),
        ...astraData,
      },
    };

    openModal({
      type: "confirm",
      message: `[아스트라 보조무기] 설정한 값을 저장하시겠습니까?\n"${nickname}" 캐릭터에 저장합니다.`,
      confirmCallback: () => {
        setAstraLocalStorage(newAstraUnlock);
      },
    });
  };

  const resetConfig = () => {
    openModal({
      type: "confirm",
      message: `[아스트라 보조무기] 설정값을 삭제하시겠습니까?\n"${nickname}" 캐릭터의 설정값만 삭제됩니다.`,
      confirmCallback: () => {
        const { [nickname]: _, ...rest } = astraUnlock || {};
        setAstraLocalStorage(rest);
      },
    });
  };

  return (
    <div className="flex items-center justify-center p-3 max-[600px]:p-0 rounded-lg w-full">
      <div
        className="flex flex-col items-center bg-slate-100 dark:bg-color-950/70
        max-[600px]:p-2 max-[600px]:pt-2 py-5 px-5 rounded-lg w-full max-w-[800px]"
      >
        <div
          className="flex mb-2 justify-end w-full font-bold pb-0.5 pt-0.5 gap-2
            text-gray-900 dark:text-gray-100
            max-[600px]:text-xs text-sm items-center max-[600px]:justify-center"
        >
          <button
            title="저장"
            onClick={saveConfig}
            className="p-1 pr-2 max-[600px]:px-3 max-[600px]:py-1.5 rounded-md bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            💾 저장
          </button>
          <button
            title="삭제"
            onClick={resetConfig}
            className="p-1 pr-2 max-[600px]:px-3 max-[600px]:py-1.5 rounded-md bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            ⛔ 삭제
          </button>
        </div>
        <AstraUnlock onSave={setAstraData} />
      </div>
    </div>
  );
};
