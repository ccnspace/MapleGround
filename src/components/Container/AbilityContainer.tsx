"use client";

import { useCharacterInfo } from "@/hooks/useCharacterInfo";
import { Ability } from "@/types/Ability";
import { useEffect, useState } from "react";
import { ContainerWrapper } from "./ContainerWrapper";

const getGradeBgColor = (grade: string | null) => {
  if (grade === "레전드리") return "bg-lime-400/70";
  if (grade === "유니크") return "bg-yellow-400/70";
  if (grade === "에픽") return "bg-purple-400/70";
  if (grade === "레어") return "bg-sky-400/70";
  return "";
};

const getAbility = (ability: Ability, preset: number) => {
  if (preset === 1) return ability.ability_preset_1;
  if (preset === 2) return ability.ability_preset_2;
  return ability.ability_preset_3;
};

type CurrentAbility = {
  grade: string | null;
  info: Ability["ability_info"];
};

export const AbilityContainer = () => {
  const [currentAbility, setCurrentAbility] = useState<CurrentAbility>();
  const { ability } = useCharacterInfo();
  const [preset, setPreset] = useState<number>();

  const getActivePresetStyle = (_preset: number) => {
    if (preset === _preset)
      return `text-black dark:text-white underline decoration-2 underline-offset-4 decoration-black/60 dark:decoration-white/80
    `;
    return `text-slate-500 underline decoration-2 underline-offset-4 decoration-transparent
    hover:decoration-slate-400
    `;
  };

  useEffect(() => {
    if (!ability?.preset_no) return;
    setPreset(ability?.preset_no);
  }, [ability?.preset_no]);

  useEffect(() => {
    if (!ability || !preset) {
      setCurrentAbility(undefined);
      return;
    }

    const _ability = getAbility(ability, preset);
    setCurrentAbility((prev) => ({
      ...prev,
      grade: _ability.ability_preset_grade,
      info: _ability.ability_info,
    }));
  }, [preset, ability]);

  return (
    <ContainerWrapper>
      {!!currentAbility ? (
        <div className="flex flex-col justify-center">
          <div className="flex justify-between mb-2">
            <p
              className="flex font-extrabold text-base mb-2 px-2 pb-0.5 pt-0.5 
              border-l-4 border-l-green-400/80
             "
            >
              어빌리티
            </p>
            <div
              className="flex font-bold flex-row gap-3 text-sm mb-2 px-1 pb-1 pt-1
            rounded-md bg-slate-200 dark:bg-[#121212]/60"
            >
              <button
                onClick={() => {
                  setPreset(1);
                }}
                className={`flex text-xs px-1 pt-0.5 pb-0.5 ${getActivePresetStyle(1)}`}
              >
                1번 프리셋
              </button>
              <button
                onClick={() => {
                  setPreset(2);
                }}
                className={`flex rounded-md text-xs px-1 pt-0.5 pb-0.5 ${getActivePresetStyle(2)}`}
              >
                2번 프리셋
              </button>
              <button
                onClick={() => {
                  setPreset(3);
                }}
                className={`flex rounded-md text-xs px-1 pt-0.5 pb-0.5 text-slate-500 ${getActivePresetStyle(3)}`}
              >
                3번 프리셋
              </button>
            </div>
          </div>
          <div className={`flex flex-col rounded-md px-1 pt-1 pb-1`}>
            <span className="font-bold text-sm">{`${currentAbility.grade} 어빌리티`}</span>
          </div>
          <div className="flex flex-col pt-2 pb-2 gap-2">
            {currentAbility.info.map((item) => (
              <p
                className={`flex text-sm font-medium px-2 pt-1.5 pb-1.5 rounded-md ${getGradeBgColor(item.ability_grade)}`}
                key={item.ability_no}
              >
                {item.ability_value}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="flex font-bold text-sm text-slate-950/50 dark:text-white/60">여기에 어빌리티 정보가 표시됩니다.</p>
        </div>
      )}
    </ContainerWrapper>
  );
};
