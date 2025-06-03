"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { EnterIcon } from "@/components/svg/EnterIcon";
import Image from "next/image";
import CharacterImg from "@/images/0.png";
import MainBg from "@/images/mainBg.jpg";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      router.push(`/main?name=${encodeURIComponent(nickname)}`);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 w-full h-full">
        <Image src={MainBg} alt="background" fill priority className="object-cover" quality={100} />
        {/* 배경 오버레이 */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/50" />
      </div>

      {/* 검색 카드 */}
      <div className="relative flex flex-col items-center justify-center p-10 bg-slate-800/90 backdrop-blur-xs rounded-lg shadow-2xl border border-slate-700/70">
        <Image
          src={CharacterImg}
          alt=""
          width={90}
          height={160}
          priority
          className="absolute opacity-20 -z-0"
          style={{ width: 90, height: 150 }}
        />
        <div className="text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            MapleDot
          </h2>
        </div>
        <h2 className="text-sm text-white/70 mb-6">캐릭터 정보 · 잠재능력 재설정 · 스타포스 시뮬레이션</h2>
        <form className="flex flex-col items-center gap-4 z-10" onSubmit={handleSubmit}>
          <div className="relative flex items-center rounded-lg w-64">
            <input
              className="w-full px-3 py-2 font-normal text-white bg-slate-900 rounded-lg outline-none placeholder:text-slate-400
                focus:ring-2 focus:ring-indigo-500/80 focus:ring-offset-0
                transition-all duration-300 shadow-lg
                focus:shadow-[0_0_15px_rgba(99,102,241,0.1)]"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="캐릭터명을 입력하세요"
            />
            <button type="submit" className="absolute right-3 focus:outline-none">
              <EnterIcon />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
