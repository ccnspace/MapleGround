"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EnterIcon } from "@/components/svg/EnterIcon";
import Image from "next/image";
import CharacterImg from "@/images/0.png";
import MainBg from "@/images/mainBg.jpg";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useCharacterPowerStore } from "@/stores/characterPower";
import { useCharacterStore } from "@/stores/character";
import Logo from "@/images/groundLogo_dark.png";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const router = useRouter();
  const { value: bookmarks } = useLocalStorage("bookmark");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      router.push(`/main?name=${encodeURIComponent(nickname)}`);
    }
  };

  const handleBookmarkClick = (bookmarkName: string) => {
    router.push(`/main?name=${encodeURIComponent(bookmarkName)}`);
  };

  useEffect(() => {
    useCharacterStore.getState().setFetchStatus("idle");
    useCharacterPowerStore.getState().setFetchStatus("idle");
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 w-full h-full">
        <Image src={MainBg} alt="background" fill priority className="object-cover" quality={100} />
        {/* 배경 오버레이 */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/50" />
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* 검색 카드 */}
        <div
          className="relative flex flex-col items-center justify-center
          p-12 max-[600px]:p-8 bg-slate-800/80
        backdrop-blur-sm rounded-xl shadow-2xl border border-white/20"
        >
          <Image
            src={CharacterImg}
            alt=""
            width={100}
            height={170}
            priority
            className="absolute opacity-20 z-0"
            style={{ width: 100, height: 170, imageRendering: "pixelated" }}
          />
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              <Image src={Logo} alt="logo" width={300} height={100} className="mb-3" />
            </h2>
          </div>
          <h2 className="text-md text-white/80 mb-6 max-[600px]:text-xs">캐릭터 정보 · 잠재능력 재설정 · 스타포스 시뮬레이션</h2>
          <form className="flex flex-col items-center gap-4 z-10" onSubmit={handleSubmit}>
            <div
              className="relative flex items-center rounded-lg w-64
            border-2 border-slate-300/80"
            >
              <input
                className="w-full px-3 py-2 font-normal text-white bg-slate-900 rounded-lg outline-none placeholder:text-slate-300
                focus:ring-2 focus:ring-indigo-500/80 focus:ring-offset-0
                transition-all duration-300 shadow-lg
                focus:shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="캐릭터명 입력 후 엔터"
              />
              <button type="submit" className="absolute right-3 focus:outline-none">
                <EnterIcon />
              </button>
            </div>
          </form>
          {/* 북마크 리스트 */}
          {bookmarks && bookmarks.length > 0 && (
            <div className="mt-8 w-full max-w-md z-10">
              <div className="flex items-center gap-1 mb-4">
                ⭐<h3 className="text-sm font-medium text-white/80">즐겨찾기</h3>
              </div>
              <div className="max-h-24 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 pr-1">
                  {bookmarks.map((bookmarkName, index) => (
                    <button
                      key={`${bookmarkName}-${index}`}
                      onClick={() => handleBookmarkClick(bookmarkName)}
                      className="group relative overflow-hidden px-3 py-2 bg-slate-900/60 backdrop-blur-sm rounded-lg border border-slate-600/50
                      hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-purple-600/20
                      hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/10
                      transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 to-purple-600/0 
                      group-hover:from-indigo-600/10 group-hover:to-purple-600/10 transition-all duration-300"
                      />
                      <span className="relative text-sm font-medium text-white/90 group-hover:text-white truncate block">
                        {bookmarkName}
                      </span>
                      <div
                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 
                      group-hover:w-full transition-all duration-300"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 간단 공지 카드 */}
        <div
          className="relative flex flex-col items-center w-[300px] py-4 px-2 gap-2
         bg-slate-700/70 backdrop-blur-xs rounded-lg shadow-2xl 
         max-h-[160px] overflow-y-auto
         "
        >
          <p className="text-sm font-bold text-white">📢 업데이트 내역</p>
          <ul className="flex flex-col gap-2 items-baseline w-full">
            <li className="flex flex-col gap-1">
              <p className="text-xs text-white/70 rounded-md px-1 py-0.5 bg-slate-400/40 w-fit">2025.10.09</p>
              <p className="text-xs text-white/70">
                - 적용 중인 세트 효과를 보여주는 영역이 추가되었습니다.
                <br />- 경험치 효율 계산기와 무기 해방 날짜 계산기를 페이지로 분리하였습니다. 사이드바에서 만나보세요!
              </p>
            </li>
            <li className="flex flex-col gap-1">
              <p className="text-xs text-white/70 rounded-md px-1 py-0.5 bg-slate-400/40 w-fit">2025.10.08</p>
              <p className="text-xs text-white/70">- 캐릭터 이미지 크기가 전반적으로 어색하게 출력되는 문제를 수정했습니다.</p>
            </li>
            <li className="flex flex-col gap-1">
              <p className="text-xs text-white/70 rounded-md px-1 py-0.5 bg-slate-400/40 w-fit">2025.06.29</p>
              <p className="text-xs text-white/70">- 과거 vs 현재 비교 시 아이템 옵션 가중치가 잘못 적용되는 문제를 수정했습니다.</p>
            </li>
            <li className="flex flex-col gap-1">
              <p className="text-xs text-white/70 rounded-md px-1 py-0.5 bg-slate-400/40 w-fit">2025.06.25</p>
              <p className="text-xs text-white/70">- [신규] 과거 vs 현재 비교 컨텐츠가 추가되었습니다!</p>
            </li>
            <li className="flex flex-col gap-1">
              <p className="text-xs text-white/70 rounded-md px-1 py-0.5 bg-slate-400/40 w-fit">2025.06.23</p>
              <p className="text-xs text-white/70">
                - 에픽던전 2단계 배수가 잘못 적혀 있는 문제를 수정했습니다.
                <br />- 제네시스 해방 날짜 계산의 보유 어둠의 흔적을 입력하다가 지울 때 발생하는 버그를 수정했습니다.
              </p>
            </li>
            <li className="flex flex-col gap-1">
              <p className="text-xs text-white/70 rounded-md px-1 py-0.5 bg-slate-400/40 w-fit">2025.06.20</p>
              <p className="text-xs text-white/70">
                - 엠블렘 잠재능력 데이터를 업데이트했습니다. 잠재능력 시뮬레이터에서 즐겨 주세요!
                <br />- 잠재능력 데이터의 표기 방식을 최신화했습니다.
              </p>
            </li>
            <li className="flex flex-col gap-1">
              <p className="text-xs text-white/70 rounded-md px-1 py-0.5 bg-slate-400/40 w-fit">2025.06.15</p>
              <p className="text-xs text-white/70">
                - 스타포스 시뮬레이터 자동 모드 체크 해제 시에도 종료되도록 수정됩니다.
                <br />- 스타포스 시뮬레이터 자동 모드에서 성공했는데도 가끔 Success 라벨이 나오지 않는 이슈를 수정했습니다.
              </p>
            </li>
            <li className="flex flex-col gap-1">
              <p className="text-xs text-white/70 rounded-md px-1 py-0.5 bg-slate-400/40 w-fit">2025.06.13</p>
              <p className="text-xs text-white/70">- 모바일에서 시뮬레이터가 제대로 보이지 않는 이슈를 수정했습니다.</p>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
