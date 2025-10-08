"use client";

import { useCharacterStore } from "@/stores/character";
import { CashItemOption } from "@/types/CashEquipment";
import { PetEquipment } from "@/types/PetEquipment";
import Image from "next/image";
import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Divider } from "../Equip/Divider";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ContainerWrapper } from "./ContainerWrapper";
import { useNickname } from "@/hooks/useNickname";

type PetInfo = {
  name: string | null;
  nickname: string | null;
  icon: string | null;
  skills: string[] | null;
  shapeName: string | null;
  shapeIcon: string | null;
  equipment: {
    name: string | null;
    icon: string | null;
    shapeName: string | null; // 외형
    shapeIcon: string | null; // 외형
    options: CashItemOption[];
    upgrade: number | null;
    upgradable: number | null;
  };
};

const MAX_PET_COUNT = 3;

const getPetInfoByIndex = (petEquip: PetEquipment, index: number): PetInfo => {
  return {
    name: petEquip[`pet_${index}_name`],
    nickname: petEquip[`pet_${index}_nickname`],
    icon: petEquip[`pet_${index}_icon`],
    skills: petEquip[`pet_${index}_skill`],
    shapeName: petEquip[`pet_${index}_appearance`] ?? null,
    shapeIcon: petEquip[`pet_${index}_appearance_icon`] ?? null,
    equipment: {
      name: petEquip[`pet_${index}_equipment`]?.item_name ?? null,
      icon: petEquip[`pet_${index}_equipment`]?.item_icon ?? null,
      shapeName: petEquip[`pet_${index}_equipment`]?.item_shape ?? null,
      shapeIcon: petEquip[`pet_${index}_equipment`]?.item_shape_icon ?? null,
      options: petEquip[`pet_${index}_equipment`]?.item_option ?? [],
      upgrade: petEquip[`pet_${index}_equipment`]?.scroll_upgrade ?? null,
      upgradable: petEquip[`pet_${index}_equipment`]?.scroll_upgradable ?? null,
    },
  };
};

const PetDetailBox = ({ petInfo, setSelectedPetIndex }: { petInfo: PetInfo; setSelectedPetIndex: (index: string) => void }) => {
  const detailRef = useRef<HTMLDivElement>(null);

  // useClickOutside(detailRef, () => {
  //   setSelectedPetIndex("");
  // });

  return (
    <div
      ref={detailRef}
      className="absolute z-10 flex flex-col gap-2 justify-center p-2 rounded-lg
    bg-slate-950/90 dark:bg-[#121212]/90 border border-gray-700 w-[160px]
    "
    >
      <div className="flex flex-col text-white">
        <div className="flex flex-col text-white">
          <p className="font-medium text-sm">펫 닉네임</p>
          <p className="font-light text-xs text-white">{petInfo.nickname}</p>
        </div>
        <Divider />
        <p className="font-medium text-sm">펫장비 옵션</p>
        <p className="font-light text-xs">{petInfo.equipment.name}</p>
        {petInfo.equipment.options?.map((option, index) => (
          <p key={index} className="font-medium text-xs text-yellow-500">
            {`· ${option.option_type}: +${option.option_value}`}
          </p>
        ))}
        <Divider />
        <p className="font-medium text-sm">장착 스킬 목록</p>
        {petInfo.skills?.map((skill, index) => (
          <p key={index} className="font-light text-xs">
            {`+ ${skill}`}
          </p>
        ))}
      </div>
    </div>
  );
};

const PetBox = ({
  petInfo,
  index,
  selectedPetIndex,
  setSelectedPetIndex,
  onMouseEnter,
  onMouseLeave,
}: {
  petInfo: PetInfo;
  index: string;
  selectedPetIndex: string;
  setSelectedPetIndex: (index: string) => void;
  onMouseEnter: (e: MouseEvent) => void;
  onMouseLeave: (e: MouseEvent) => void;
}) => {
  if (!petInfo.name || !petInfo.icon) return null;

  return (
    <div
      id={index}
      className="petbox flex flex-col gap-1 justify-center items-center
     bg-slate-300/60 min-w-28 dark:bg-white/5 p-2 rounded-lg
     hover:bg-slate-400/40 dark:hover:bg-white/10 cursor-pointer
     "
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {!!petInfo.shapeIcon && !!petInfo.shapeName && <Image src={petInfo.shapeIcon} alt={petInfo.shapeName} width={30} height={30} />}
      <div className="flex flex-col items-center">
        <p className="font-bold text-sm max-w-24 tracking-tighter truncate">{petInfo.nickname}</p>
      </div>
      <div className="flex gap-1 flex-col">
        <div className="flex flex-row items-center gap-1">
          <p className="font-light text-xs text-white tracking-tighter bg-lime-600/80 rounded-md px-1">외형</p>
          <p className="font-medium max-w-16 text-xs tracking-tighter truncate">{petInfo.shapeName}</p>
        </div>
        <div className="flex flex-row items-center gap-1">
          <p className="font-light text-xs text-white tracking-tighter bg-slate-500 rounded-md px-1">실제</p>
          <p className="font-medium max-w-16 text-xs tracking-tighter truncate">{petInfo.name}</p>
        </div>
      </div>

      {!!petInfo.equipment.shapeIcon && !!petInfo.equipment.shapeName && (
        <Image src={petInfo.equipment.shapeIcon} alt={petInfo.equipment.shapeName} width={30} height={30} />
      )}
      {!!petInfo.equipment.name && (
        <>
          <div className="flex flex-col items-center">
            <p className="font-bold text-xs max-w-24 tracking-tighter truncate">{petInfo.equipment.shapeName}</p>
          </div>
          {/* <div className="flex gap-1 flex-col">
            <div className="flex flex-row items-center gap-1">
              <p className="font-light text-xs text-white tracking-tighter bg-lime-600/80 rounded-md px-1">외형</p>
              <p className="font-medium max-w-16 text-xs tracking-tighter truncate">{petInfo.equipment.shapeName}</p>
            </div>
            <div className="flex flex-row items-center gap-1">
              <p className="font-light text-xs text-white tracking-tighter bg-slate-500 rounded-md px-1">실제</p>
              <p className="font-medium max-w-16 text-xs tracking-tighter truncate">{petInfo.equipment.name}</p>
            </div>
          </div> */}
        </>
      )}
      {selectedPetIndex === index && <PetDetailBox petInfo={petInfo} setSelectedPetIndex={setSelectedPetIndex} />}
    </div>
  );
};

export const PetEquipContainer = () => {
  const nickname = useNickname();
  const petEquip = useCharacterStore((state) => state.characterAttributes?.[nickname]?.petEquip);
  // const [petInfos, setPetInfos] = useState<PetInfo[]>([]);
  const [selectedPetIndex, setSelectedPetIndex] = useState<string>("");

  const handleMouseEnter = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    const parent = target.closest(".petbox");
    if (!parent || parent.childElementCount === 0) return;

    setSelectedPetIndex(parent.id);
  }, []);

  const petInfos = useMemo(() => {
    if (!petEquip) return [];

    return Array.from({ length: MAX_PET_COUNT }, (_, i) => getPetInfoByIndex(petEquip, i + 1)).filter((petInfo) => petInfo.name !== null);
  }, [petEquip]);

  return (
    <div className="flex flex-col gap-1 mt-5 justify-center">
      <div className="flex justify-between mb-1">
        <p
          className="flex font-bold text-sm px-2 pb-1 pt-1 border-l-4 border-l-rose-400
             "
        >
          펫 정보
        </p>
      </div>
      {petInfos.length > 0 ? (
        <div className="flex flex-row gap- justify-around">
          {petInfos.map((petInfo, index) => (
            <PetBox
              key={index}
              index={`${index + 1}`}
              petInfo={petInfo}
              selectedPetIndex={selectedPetIndex}
              setSelectedPetIndex={setSelectedPetIndex}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setSelectedPetIndex("")}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="flex font-bold text-sm text-slate-950/50 dark:text-white/60 min-h-48 items-center">장착한 펫이 없습니다</p>
        </div>
      )}
    </div>
  );
};
