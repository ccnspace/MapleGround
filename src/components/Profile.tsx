"use client";

import { FormEvent, useState } from "react";
import { EnterIcon } from "./svg/EnterIcon";
import { Spinner } from "./svg/Spinner";
import Image from "next/image";
import { Badge } from "./Badge";
import { BackIcon } from "./svg/BackIcon";
import CharacterImg from "@/images/0.png";
import { useCharacterStore } from "@/stores/character";
import { useShallow } from "zustand/shallow";
import { CharacterAttributes, getCharacterAttributes } from "@/apis/getCharacterAttributes";
import { useModalStore } from "@/stores/modal";
import { useLoadingStore } from "@/stores/loading";

const EmptyAltText = () => {
  return (
    <>
      <span
        className="underline
      decoration-2 underline-offset-4
      decoration-indigo-400 text-white"
      >
        캐릭터명
      </span>
      을 검색하세요!
    </>
  );
};

// FIXME: setter를 useState 대신 상태관리 라이브러리 혹은 context 활용
type EmptyProfileProps = {
  setLoading: (loading: boolean) => void;
};
const ProfileSearch = ({ setLoading }: EmptyProfileProps) => {
  const [inputValue, setValue] = useState("");
  const { setCharacterAttributes, setFetchStatus, resetCharacterData } = useCharacterStore(
    useShallow((state) => ({
      setCharacterAttributes: state.setCharacterAttributes,
      setFetchStatus: state.setFetchStatus,
      resetCharacterData: state.resetCharacterData,
    }))
  );

  const requestCharacterInfo = async (nickname: string) => {
    try {
      useLoadingStore.getState().setLoading(true);
      const response = await getCharacterAttributes(nickname);
      setCharacterAttributes(response);
      setFetchStatus("success");
    } catch (e) {
      resetCharacterData();
      setFetchStatus("error");
    } finally {
      setLoading(false);
      useLoadingStore.getState().setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    setLoading(true);
    e.preventDefault();
    requestCharacterInfo(inputValue);
  };

  return (
    <form name="searchProfile" className="flex items-center flex-col gap-2 z-10" onSubmit={handleSubmit}>
      <p className="text-base text-slate-200">
        <EmptyAltText />
      </p>
      <div className="flex items-center rounded w-3/4 text-white bg-slate-700 px-2 pt-1 pb-1">
        <input
          className="font-normal bg-transparent outline-none w-full"
          value={inputValue}
          onChange={(e) => setValue(e.target.value)}
        ></input>
        <EnterIcon />
      </div>
    </form>
  );
};

type ProfileProps = {
  characterAttributes: CharacterAttributes;
};
const Profile = ({ characterAttributes }: ProfileProps) => {
  const { character_class, character_level, character_guild_name, character_name, character_image, character_exp_rate, world_name } =
    characterAttributes.basic;

  const currentDate = new Date().toLocaleString("ko-kr", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="flex text-base items-center flex-col gap-3">
      <div className="flex flex-row gap-2">
        <Image src={character_image} alt="character" unoptimized width={120} height={120} />
        <div className="flex flex-col gap-1.5 justify-center min-w-[100px]">
          <p className="text-slate-100 text-sm">
            <Badge bgColor="lime" text={"이름"} />
            <span
              className="underline underline-offset-4
          decoration-2 decoration-lime-300 text-lime-300"
            >
              {character_name}
            </span>
          </p>
          <p className="text-slate-100 text-sm">
            <Badge bgColor="cyan" text={"레벨"} />
            {character_level}
          </p>
          <p className="text-slate-100 text-sm">
            <Badge bgColor="pink" text={"직업"} />
            {character_class}
          </p>
          <p className="text-slate-100 text-sm">
            <Badge bgColor="blue" text={"월드"} />
            {world_name}
          </p>
          <p className="text-slate-100 text-sm">
            <Badge bgColor="indigo" text={"길드"} />
            {character_guild_name ?? "(없음)"}
          </p>
        </div>
      </div>
      <div className="flex bg-slate-600 w-[240px] relative h-6 rounded-lg">
        <p
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          className="absolute mx-auto text-sm font-bold
           text-white
           [text-shadow:_2px_1px_3px_rgb(0_0_0_/_50%)]"
        >{`${character_exp_rate}%`}</p>
        <div style={{ width: `${character_exp_rate}%` }} className={`flex bg-gradient-to-r from-cyan-500 to-blue-500 h-6 rounded-s-lg`} />
      </div>
      <div className="flex -mt-1">
        <p className="text-slate-300 text-xs font-light">{`${currentDate} 데이터`}</p>
      </div>
    </div>
  );
};

export const ProfileWrapper = () => {
  const [isLoading, setLoading] = useState(false);
  const { fetchStatus, characterAttributes, resetCharacterData } = useCharacterStore(
    useShallow((state) => ({
      fetchStatus: state.fetchStatus,
      characterAttributes: state.characterAttributes,
      setFetchStatus: state.setFetchStatus,
      resetCharacterData: state.resetCharacterData,
    }))
  );

  const isEmptyProfile = !characterAttributes && fetchStatus === "idle" && !isLoading;
  const hasProfile = fetchStatus && characterAttributes && !isLoading;
  const isSearchError = fetchStatus === "error";

  const bgColor = !hasProfile ? "bg-slate-800" : "bg-slate-900 border-2 border-slate-600";

  const resetProfile = () => {
    if (!characterAttributes) {
      resetCharacterData();
      return;
    }
    useModalStore.getState().setModal({
      type: "confirm",
      message: "설정된 캐릭터를 초기화 하시겠어요?",
      confirmCallback: () => {
        resetCharacterData();
      },
    });
  };

  return (
    <div
      className={`flex flex-col gap-3 items-center justify-center
     font-medium rounded-lg relative
      mx-5 mt-6 mb-4 px-3 pt-2 pb-2 h-56 
     ${bgColor}`}
    >
      {isLoading && <Spinner />}
      {isEmptyProfile && (
        <>
          <ProfileSearch setLoading={setLoading} />
          <Image src={CharacterImg} alt="" width={110} className="absolute opacity-5 -z-0" />
        </>
      )}
      {isSearchError && <p className="text-white text-base">검색결과가 없습니다.</p>}
      {hasProfile && <Profile characterAttributes={characterAttributes} />}
      {(hasProfile || isSearchError) && (
        <div className="absolute right-0 top-0 px-3 pt-3 hover:cursor-pointer" onClick={resetProfile}>
          <BackIcon />
        </div>
      )}
    </div>
  );
};
