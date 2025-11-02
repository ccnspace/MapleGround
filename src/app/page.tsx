"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EnterIcon } from "@/components/svg/EnterIcon";
import Image from "next/image";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useCharacterPowerStore } from "@/stores/characterPower";
import { useCharacterStore } from "@/stores/character";
import MainLogo from "@/images/mainLogo.png";
import { openModal } from "@/utils/openModal";
import { useNoticeModalStore } from "@/stores/noticeModal";
import { NewLabel } from "@/components/NewLabel";
import { getOAuthUrl } from "@/apis/getOAuthUrl";
import { LoginInfo } from "@/components/LoginInfo";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const router = useRouter();
  const { value: bookmarks, remove: removeAllBookmarks } = useLocalStorage("bookmark");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      router.push(`/main?name=${encodeURIComponent(nickname)}`);
    }
  };

  const handleBookmarkClick = (bookmarkName: string) => {
    router.push(`/main?name=${encodeURIComponent(bookmarkName)}`);
  };

  const handleRemoveAllClick = () => {
    openModal({
      type: "confirm",
      message: "즐겨찾기 목록을 모두 삭제하시겠습니까?",
      confirmLabel: "삭제",
      confirmCallback: () => {
        removeAllBookmarks();
      },
    });
  };

  const handleNoticeButtonClick = () => {
    useNoticeModalStore.getState().openNoticeModal();
  };

  const handleNexonLoginClick = async () => {
    const authUrl = await getOAuthUrl();
    window.location.href = authUrl;
  };

  const handleLogoutClick = async () => {
    await fetch("/logout");
  };

  useEffect(() => {
    useCharacterStore.getState().setFetchStatus("idle");
    useCharacterPowerStore.getState().setFetchStatus("idle");
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <div className="relative flex items-center mb-4">
        <button
          className="flex items-center gap-1 text-xs font-bold text-white bg-slate-800/30 hover:bg-slate-800/40
          p-1.5 rounded-md"
          onClick={handleNoticeButtonClick}
        >
          📢 업데이트 공지사항
          <NewLabel />
        </button>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* 검색 카드 */}
        <div
          className="relative flex flex-col items-center justify-center
        pt-10 pb-10 px-12 max-[600px]:p-8 bg-cyan-200/25
        backdrop-blur-sm rounded-xl shadow-2xl border border-white/20"
        >
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              <Image src={MainLogo} alt="logo" width={300} height={100} className="mb-3 z-30" quality={99} />
            </h2>
          </div>
          <h2 className="text-sm text-white/80 mb-6 max-[600px]:text-xs">캐릭터 정보 · 잠재능력 재설정 · 스타포스 시뮬레이션</h2>
          <form className="flex flex-col items-center gap-2 z-10" onSubmit={handleSubmit}>
            <div
              className="relative flex items-center rounded-lg w-64
            border-2 border-slate-300/40"
            >
              <input
                className="w-full px-3 py-2 font-normal text-white bg-slate-900 rounded-lg outline-none placeholder:text-slate-300
                focus:ring-4 focus:ring-lime-300 focus:ring-offset-0
                transition-all duration-300 shadow-lg
                focus:shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="검색할 캐릭터명 입력 후 엔터"
              />
              <button type="submit" className="absolute right-3 focus:outline-none">
                <EnterIcon />
              </button>
            </div>
          </form>
        </div>

        <LoginInfo />

        {/* 북마크 리스트 */}
        {bookmarks && bookmarks.length > 0 && (
          <div className="w-full max-w-md z-10 rounded-lg bg-white/30 p-1">
            <div className="flex items-center gap-1 mb-2">
              <h3
                className="flex w-full justify-between gap-2 items-center font-extrabold text-black/80 
                "
              >
                <span className="text-[14px]">⭐ 즐겨찾기한 캐릭터</span>
                <button
                  onClick={handleRemoveAllClick}
                  className="text-xs font-extrabold text-white/80 bg-black/30 hover:bg-black/50 p-1 rounded-md"
                >
                  모두 제거
                </button>
              </h3>
            </div>
            <div className="max-h-24 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 pr-1">
                {bookmarks.map((bookmarkName, index) => (
                  <button
                    key={`${bookmarkName}-${index}`}
                    onClick={() => handleBookmarkClick(bookmarkName)}
                    className="group relative overflow-hidden p-1 bg-slate-900/60 hover:bg-slate-900/70
                      rounded-lg border border-slate-600/50"
                  >
                    <span
                      className="relative text-xs font-medium text-white/70 group-hover:text-white 
                      truncate block"
                    >
                      {bookmarkName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
