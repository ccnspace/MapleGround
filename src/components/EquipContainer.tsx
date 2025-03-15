"use client";

import { CharacterEquipments, useCharacterInfo } from "@/hooks/useCharacterInfo";
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { EquipInventory } from "./Equip/EquipInventory";

type EquipContextType = {
  characterEquipments: CharacterEquipments | undefined;
  selectedEquipName: string;
};

export const EquipContext = createContext<EquipContextType>({ characterEquipments: undefined, selectedEquipName: "" });
export const EquipActionContext = createContext((_name: string) => {});

export const EquipContainer = () => {
  const [selectedEquipName, setSelectedEquipName] = useState("");
  const [preset, setPreset] = useState(0);
  const { characterInfo } = useCharacterInfo(preset);

  useEffect(() => {
    console.log(characterInfo);
  }, [characterInfo]);

  const getActivePresetStyle = (_preset: number) => {
    if (preset === _preset)
      return `text-black dark:text-white underline decoration-2 underline-offset-4 decoration-black/60 dark:decoration-white/80
    `;
    return `text-slate-500 underline decoration-2 underline-offset-4 decoration-transparent
    hover:decoration-slate-400
    `;
  };

  useEffect(() => {
    setSelectedEquipName("");
  }, [preset]);

  useEffect(() => {
    if (!characterInfo) {
      setSelectedEquipName("");
      setPreset(0);
    }
  }, [characterInfo]);

  // FIXME: selectedEquipName이 변하면 의미없는 useMemo임.
  const contextValue = useMemo(
    () => ({
      characterEquipments: characterInfo?.equipments,
      selectedEquipName,
    }),
    [characterInfo, selectedEquipName]
  );

  return (
    <div
      className="flex shrink-0 min-w-96 justify-center bg-slate-100 flex-col dark:bg-[#1f2024] px-3 pt-3 pb-3
      rounded-lg gap-1"
    >
      <div className="flex flex-col justify-center">
        {!!characterInfo?.equipments ? (
          <div className="flex justify-between mb-4">
            <p
              className="flex font-extrabold text-base mb-2 px-2 pb-0.5 pt-0.5 
              border-l-4 border-l-lime-400
             "
            >
              일반 장비 아이템
            </p>
            <div
              className="flex font-bold flex-row gap-3 text-sm mb-2 px-1 pb-1 pt-1
            rounded-md bg-slate-200 dark:bg-[#121212]/60"
            >
              <button onClick={() => setPreset(1)} className={`flex text-xs px-1 pt-0.5 pb-0.5 ${getActivePresetStyle(1)}`}>
                1번 프리셋
              </button>
              <button onClick={() => setPreset(2)} className={`flex rounded-md text-xs px-1 pt-0.5 pb-0.5 ${getActivePresetStyle(2)}`}>
                2번 프리셋
              </button>
              <button
                onClick={() => setPreset(3)}
                className={`flex rounded-md text-xs px-1 pt-0.5 pb-0.5 text-slate-500 ${getActivePresetStyle(3)}`}
              >
                3번 프리셋
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col  min-w-96 h-32 justify-center">
            <div className="flex items-center justify-center">
              <p className="font-bold text-sm text-slate-950/50 dark:text-white/60">여기에 캐릭터의 아이템이 표시됩니다.</p>
            </div>
          </div>
        )}
        <EquipContext.Provider value={contextValue}>
          <EquipActionContext.Provider value={setSelectedEquipName}>
            <EquipInventory />
          </EquipActionContext.Provider>
        </EquipContext.Provider>
      </div>
    </div>
  );
};
