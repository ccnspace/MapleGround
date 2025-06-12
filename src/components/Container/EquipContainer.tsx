"use client";

import { CharacterEquipments, useCharacterInfo } from "@/hooks/useCharacterInfo";
import { createContext, useEffect, useMemo, useState } from "react";
import { EquipInventory } from "../Equip/EquipInventory";
import { ContainerWrapper } from "./ContainerWrapper";
import { PetEquipContainer } from "./PetEquipContainer";

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
    <ContainerWrapper className="gap-1">
      <div className="flex flex-col justify-center">
        {!!characterInfo?.equipments ? (
          <div className="flex justify-between mb-1">
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
        <p className="bg-slate-200 dark:bg-black/40 rounded-md p-1 text-sm text-center font-bold text-black dark:text-gray-300 mb-3">
          ✨ 아이템을 눌러서 <span className="text-lime-700 dark:text-lime-400">잠재능력-스타포스 시뮬레이션</span>을 즐겨보세요! ✨
        </p>
        <EquipContext.Provider value={contextValue}>
          <EquipActionContext.Provider value={setSelectedEquipName}>
            <EquipInventory />
          </EquipActionContext.Provider>
        </EquipContext.Provider>
        <PetEquipContainer />
      </div>
    </ContainerWrapper>
  );
};
