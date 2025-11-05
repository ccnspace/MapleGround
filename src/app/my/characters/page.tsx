"use client";

import type { CharacterInfo } from "@/types/CharacterList";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SelectBox } from "@/components/SelectBox";
import { useAccountList } from "@/hooks/useAccountList";
import { Spinner } from "@/components/svg/Spinner";
import { getWorldIcon } from "@/utils/getWorldIcon";
import { useRouter } from "next/navigation";
import { openModal } from "@/utils/openModal";

const CharacterCard = ({ characterList }: { characterList: CharacterInfo[] }) => {
  const router = useRouter();
  const handleClickCharacter = (name: string) => {
    openModal({
      type: "confirm",
      message: `${name}\n캐릭터 상세로 이동하시겠습니까?`,
      confirmLabel: "이동",
      cancelLabel: "취소",
      confirmCallback: () => router.push(`/main?name=${name}`),
    });
  };

  return (
    <>
      {characterList.map((character) => (
        <div
          key={character.ocid}
          onClick={() => handleClickCharacter(character.character_name)}
          className="flex flex-col gap-2 bg-slate-200 dark:bg-slate-600/40 rounded-lg p-3
        cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-200
        "
        >
          <div className="flex flex-row items-center justify-center gap-4">
            {/* <div className="flex items-center justify-center overflow-hidden">
              {character.character_image && (
                <div
                  style={{
                    backgroundImage: `url(${character.character_image})`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    width: 120,
                    height: 120,
                    marginTop: -20,
                  }}
                />
              )}
              {!character.character_image && <Image src={personShadow} alt={character.character_name} width={60} height={60} />}
            </div> */}
            <div className="flex flex-row text-sm items-center gap-2">
              <p className="text-slate-700 font-bold dark:text-slate-200">{`Lv. ${character.character_level}`}</p>
              <p>{character.character_class}</p>
            </div>
          </div>
          <div
            className="flex items-center justify-center flex-row gap-2 text-sm font-bold
            bg-slate-400/50 dark:bg-slate-600 rounded-lg p-1
          "
          >
            <Image src={getWorldIcon(character.world_name)} alt={character.world_name} width={14} height={14} unoptimized />
            <p>{character.character_name}</p>
          </div>
        </div>
      ))}
    </>
  );
};

const sortOptions = [
  { label: "레벨 낮은 순", value: "레벨 낮은 순" },
  { label: "레벨 높은 순", value: "레벨 높은 순" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

const sortCharacterList = (characterList: CharacterInfo[], sortOption: SortOption): CharacterInfo[] => {
  // 원본 배열을 변경하지 않고 새로운 배열을 생성하여 정렬
  return [...characterList].sort((a, b) => {
    if (sortOption === "레벨 낮은 순") {
      return a.character_level - b.character_level;
    }
    return b.character_level - a.character_level;
  });
};

export default function Page() {
  const { accountList, fetchStatus: characterListFetchStatus } = useAccountList();
  const [filteredCharacterList, setFilteredCharacterList] = useState<CharacterInfo[]>([]);
  const [ocids, setOcids] = useState<string[]>([]);

  const characterList = useMemo(() => accountList.flatMap((account) => account.character_list), [accountList]);
  const worldOptions = useMemo(() => {
    return ["전체", ...Array.from(new Set(characterList.map((character) => character.world_name)))];
  }, [characterList]);

  const [selectedWorld, setSelectedWorld] = useState<string>("전체");
  const [selectedSort, setSelectedSort] = useState<SortOption>("레벨 낮은 순");

  const handleSelectSort = (value: string) => {
    setSelectedSort(value as SortOption);
  };

  const handleSelectWorldSelect = (value: string) => {
    setSelectedWorld(value);
  };

  useEffect(() => {
    if (characterListFetchStatus !== "success") return;
    const sorted = sortCharacterList(characterList, selectedSort);
    if (selectedWorld === "전체") {
      setFilteredCharacterList(sorted);
      return;
    }
    const filtered = sorted.filter((character) => character.world_name === selectedWorld);
    setFilteredCharacterList(filtered);
  }, [characterList, selectedSort, selectedWorld, characterListFetchStatus]);

  // useEffect(() => {
  //   if (ocids.length === 0) return;
  //   if (characterListFetchStatus !== "success") return;
  //   if (characterImages.length > 0) return;

  //   const fetchCharacterImages = async () => {
  //     const response = await fetch("/characterImage", {
  //       method: "POST",
  //       body: JSON.stringify({ ocids }),
  //     });
  //     const { data } = await response.json();
  //     setCharacterImages(data);
  //   };
  //   fetchCharacterImages();
  // }, [ocids, characterListFetchStatus, characterImages.length]);

  // useEffect(() => {
  //   if (characterImages.length === 0) return;
  //   setFilteredCharacterList(
  //     filteredCharacterList.map((character) => {
  //       const characterImage = characterImages.find((image) => image.character_name === character.character_name);
  //       return {
  //         ...character,
  //         character_image: characterImage?.character_image || "",
  //       };
  //     })
  //   );
  // }, [characterImages.length]);

  if (characterListFetchStatus === "loading" || characterListFetchStatus === "idle") {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Spinner width="5em" height="5em" color="gray" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-row items-center gap-2">
          <p className="text-sm font-bold">정렬</p>
          <SelectBox fontSize="sm" options={sortOptions.map((option) => option.label)} onSelect={handleSelectSort} />
        </div>
        <div className="flex flex-row items-center gap-2">
          <p className="text-sm font-bold">월드별</p>
          <SelectBox fontSize="sm" options={worldOptions} onSelect={handleSelectWorldSelect} />
        </div>
      </div>
      <p className="bg-slate-100 border border-slate-300 dark:border-slate-700 w-fit dark:bg-slate-800 rounded-lg px-2 py-1 text-sm">
        <span className="font-bold text-slate-700 dark:text-slate-200">{`${filteredCharacterList.length}개 캐릭터`}</span>가 존재합니다
      </p>
      <div className="grid grid-cols-5 gap-5 max-h-[1000px] overflow-y-auto max-[600px]:grid-cols-2">
        <CharacterCard characterList={filteredCharacterList} />
      </div>
    </>
  );
}
