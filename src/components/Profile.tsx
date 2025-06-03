"use client";

import { Spinner } from "./svg/Spinner";
import Image from "next/image";
import { Badge } from "./Badge";
import { BackIcon } from "./svg/BackIcon";
import { useCharacterStore } from "@/stores/character";
import { useShallow } from "zustand/shallow";
import { CharacterAttributes } from "@/apis/getCharacterAttributes";
import { useModalStore } from "@/stores/modal";
import { useCharacterPowerStore } from "@/stores/characterPower";
import { useRouter } from "next/navigation";

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
        <Image src={character_image} alt="character" unoptimized width={120} height={120} style={{ width: 120, height: 120 }} />
        <div className="flex flex-col gap-1.5 justify-center min-w-[100px]">
          <p className="text-slate-100 text-sm">
            <Badge bgColor="lime" text={"이름"} />
            <span className="underline underline-offset-4 decoration-2 decoration-lime-300 text-lime-300">{character_name}</span>
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
      <div className="relative w-full h-6 bg-slate-700 rounded-lg overflow-hidden">
        <p
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          className="absolute mx-auto text-sm font-bold text-white [text-shadow:_2px_1px_3px_rgb(0_0_0_/_50%)]"
        >
          {`${character_exp_rate}%`}
        </p>
        <div style={{ width: `${character_exp_rate}%` }} className="flex bg-gradient-to-r from-cyan-500 to-blue-500 h-6 rounded-s-lg" />
      </div>
      <div className="flex -mt-1">
        <p className="text-slate-300 text-xs font-light">{`${currentDate} 데이터`}</p>
      </div>
    </div>
  );
};

export const ProfileWrapper = () => {
  const router = useRouter();
  const { fetchStatus, characterAttributes, resetCharacterData } = useCharacterStore(
    useShallow((state) => ({
      fetchStatus: state.fetchStatus,
      characterAttributes: state.characterAttributes,
      resetCharacterData: state.resetCharacterData,
    }))
  );

  const hasProfile = characterAttributes && fetchStatus === "success";
  const isSearchError = fetchStatus === "error";

  const bgColor = !hasProfile ? "bg-slate-800" : "bg-slate-800 border-2 border-slate-600";

  const resetProfile = () => {
    if (!characterAttributes) {
      resetCharacterData();
      router.push("/");
      return;
    }
    useModalStore.getState().setModal({
      type: "confirm",
      message: "설정된 캐릭터를 초기화 하시겠어요?",
      confirmCallback: () => {
        router.push("/");
      },
    });
  };

  return (
    <div
      className={`profile flex flex-col gap-3 items-center justify-center
     font-medium rounded-lg relative
      mx-5 mt-6 mb-4 px-3 pt-2 pb-2 h-56 
     ${bgColor}`}
    >
      {fetchStatus === "loading" && <Spinner />}
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
