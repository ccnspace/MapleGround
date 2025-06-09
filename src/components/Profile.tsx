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
import { useNickname } from "@/hooks/useNickname";
import { useRouter } from "next/navigation";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type ProfileProps = {
  characterAttributes: CharacterAttributes;
};

const Profile = ({ characterAttributes }: ProfileProps) => {
  const { character_class, character_level, character_guild_name, character_name, character_image, character_exp_rate, world_name } =
    characterAttributes.basic;

  const fetchDate = new Date(characterAttributes.fetchDate);

  const currentDate = fetchDate.toLocaleString("ko-kr", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const router = useRouter();

  const handleRefresh = () => {
    useModalStore.getState().setModal({
      type: "confirm",
      message: "전체 데이터를 최신화 하시겠어요?",
      confirmCallback: () => {
        if (!character_name) return;

        const { setFetchStatus, resetCharacterData } = useCharacterStore.getState();
        const { setFetchStatus: setCharacterPowerFetchStatus, resetCharacterPower } = useCharacterPowerStore.getState();

        setFetchStatus("loading");
        setCharacterPowerFetchStatus("loading");
        resetCharacterData(character_name);
        resetCharacterPower(character_name);

        location.href = `/main?name=${character_name}`;
      },
    });
  };

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
      <div className="flex flex-col gap-2 -mt-1">
        <p className="text-slate-100 text-xs font-medium">{`${currentDate} 데이터`}</p>
        <button className="text-slate-100 bg-slate-700 px-1 py-1 rounded-md text-sm font-bold hover:bg-slate-600" onClick={handleRefresh}>
          {`⟳ 전체 데이터 최신화`}
        </button>
      </div>
    </div>
  );
};

export const ProfileWrapper = () => {
  const router = useRouter();
  const nickname = useNickname();
  const { fetchStatus, characterAttributes, resetCharacterData } = useCharacterStore(
    useShallow((state) => ({
      fetchStatus: state.fetchStatus,
      characterAttributes: state.characterAttributes?.[nickname],
      resetCharacterData: state.resetCharacterData,
    }))
  );

  const hasProfile = characterAttributes && fetchStatus === "success";
  const isSearchError = fetchStatus === "error";
  const bgColor = !hasProfile ? "bg-slate-800" : "bg-slate-800 border-2 border-slate-600";

  const { value: bookmark, set: setBookmark } = useLocalStorage("bookmark");

  const hasBookmarked = bookmark && !!bookmark.includes(nickname);
  const bookmarkLabel = hasBookmarked ? "★ 북마크중" : "★ 북마크하기";

  const handleChangeBookmark = () => {
    if (!nickname) return;
    if (hasBookmarked) {
      const newBookmark = bookmark.filter((name) => name !== nickname);
      setBookmark(newBookmark);
    } else {
      setBookmark([...(bookmark ?? []), nickname]);
    }
  };

  const resetProfile = () => {
    if (!characterAttributes) {
      router.push("/");
      return;
    }
    useModalStore.getState().setModal({
      type: "confirm",
      message: "다른 캐릭터를 검색하시겠어요?",
      confirmCallback: () => {
        router.push("/");
      },
    });
  };

  return (
    <>
      <div
        className={`profile flex flex-col gap-3 items-center justify-center
     font-medium rounded-lg relative
      mx-5 mt-6 mb-4 px-3 pt-6 pb-1 h-72 
     ${bgColor}`}
      >
        <div className="absolute left-0 top-0 px-3 pt-1.5 hover:cursor-pointer" onClick={handleChangeBookmark}>
          <span
            className={`bg-slate-600 hover:bg-slate-500 rounded-md px-1.5 py-1
            text-sm ${hasBookmarked ? "text-yellow-300" : "text-slate-400"}`}
          >
            {bookmarkLabel}
          </span>
        </div>
        {isSearchError && <p className="text-white text-base">검색결과가 없습니다.</p>}
        {hasProfile && <Profile characterAttributes={characterAttributes} />}
        {(hasProfile || isSearchError) && (
          <div className="absolute right-0 top-0 px-3 pt-3 hover:cursor-pointer" onClick={resetProfile}>
            <BackIcon />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 bg-slate-100 dark:bg-slate-500/10 rounded-lg p-3 mx-5">
        <p className="text-slate-800 dark:text-slate-200 text-xs font-medium">{`ⓘ 최근 데이터 조회 시간보다 30분 이상 지난 경우 데이터가 갱신됩니다.`}</p>
        <p className="text-slate-800 dark:text-slate-200 text-xs font-medium">{`ⓘ [전체 데이터 최신화] 버튼을 누르면 모든 데이터를 현재 시각 기준으로 갱신합니다.`}</p>
      </div>
    </>
  );
};
