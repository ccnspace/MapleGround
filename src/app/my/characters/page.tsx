"use client";

import type { AccountInfo, CharacterInfo } from "@/types/CharacterList";
import { useEffect, useState } from "react";
import Image from "next/image";
import personShadow from "@/images/0.png";
import { SelectBox } from "@/components/SelectBox";
import { useCharacterList } from "@/hooks/useCharacterList";
import { LoadingContainer } from "@/components/Container/LoadingContainer";
import { Spinner } from "@/components/svg/Spinner";

const CharacterCard = ({ characterList }: { characterList: CharacterInfo[] }) => {
  return (
    <>
      {characterList.map((character) => (
        <div
          key={character.ocid}
          className="flex flex-col gap-2 bg-slate-200 dark:bg-slate-800 rounded-lg p-3
        cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-200
        "
        >
          <div className="flex flex-row items-center justify-center gap-4">
            <div className="flex items-center justify-center">
              <Image src={personShadow} alt={character.character_name} width={60} height={60} />
            </div>
            <div className="flex flex-col text-sm items-end">
              <p>{character.world_name}</p>
              <p>{`Lv. ${character.character_level}`}</p>
              <p>{character.character_class}</p>
            </div>
          </div>
          <div
            className="flex items-center justify-center flex-row gap-2 text-sm font-bold
            bg-slate-400/70 dark:bg-slate-600 rounded-lg p-1
          "
          >
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
  const { characterList, fetchStatus } = useCharacterList();
  const [filteredCharacterList, setFilteredCharacterList] = useState<CharacterInfo[]>([]);

  const handleSelectSort = (value: string) => {
    const sorted = sortCharacterList(filteredCharacterList, value as SortOption);
    setFilteredCharacterList(sorted);
  };

  useEffect(() => {
    if (fetchStatus !== "success") return;
    setFilteredCharacterList(
      sortCharacterList(
        characterList.flatMap((account) => account.character_list),
        "레벨 낮은 순"
      )
    );
  }, [characterList]);

  if (fetchStatus === "loading" || fetchStatus === "idle") {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Spinner width="5em" height="5em" color="gray" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <p className="text-sm">정렬</p>
        <SelectBox options={sortOptions.map((option) => option.label)} onSelect={handleSelectSort} />
      </div>
      <div className="grid grid-cols-5 gap-5 max-[600px]:grid-cols-2">
        <CharacterCard characterList={filteredCharacterList} />
      </div>
    </>
  );
}
