import { Spinner } from "./svg/Spinner";
import Image from "next/image";
import NexonLoginImg from "@/images/nexonLogin.png";
import { getOAuthUrl } from "@/apis/getOAuthUrl";
import { logout } from "@/apis/logout";
import { useLoggedInStore } from "@/stores/loggedIn";

export const LoginInfo = () => {
  const fetchStatus = useLoggedInStore((state) => state.fetchStatus);

  const handleNexonLoginClick = async () => {
    const authUrl = await getOAuthUrl();
    window.location.href = authUrl;
  };

  const handleLogoutClick = async () => {
    await logout();
  };

  if (fetchStatus === "idle" || fetchStatus === "loading") {
    return (
      <div className="flex items-center justify-center h-[80px]">
        <Spinner width="2em" height="2em" color="white" />
      </div>
    );
  }

  if (fetchStatus === "success") {
    return (
      <div
        className="flex flex-col items-center gap-2 h-[80px] w-full max-w-md py-2.5 bg-slate-800/80
        backdrop-blur-sm rounded-xl shadow-2xl border border-slate-800"
      >
        <p className="text-sm max-[600px]:text-sm text-white">
          🔐 현재 <span className="font-bold text-cyan-300">넥슨 계정</span>으로 로그인되어 있습니다.
        </p>
        <div className="flex items-center gap-2 font-bold">
          <button
            className="flex items-center cursor-pointer text-[14px] gap-2 text-black
            bg-gradient-to-r from-sky-400 to-green-400 rounded-md
            hover:from-sky-500 hover:to-green-500
          py-1 px-2"
          >
            <p>↗️ 마이메이플</p>
          </button>
          <button
            onClick={handleLogoutClick}
            className="flex items-center cursor-pointer text-[14px] gap-2 
            bg-white/60 dark:bg-black/30 rounded-md hover:bg-white/70 dark:hover:bg-black/40
          py-1 px-2"
          >
            <p>로그아웃</p>
          </button>
        </div>
      </div>
    );
  }

  if (fetchStatus === "error") {
    return (
      <div className="flex items-center gap-2 h-[80px]">
        <div className="flex items-center justify-center cursor-pointer" onClick={handleNexonLoginClick}>
          <Image src={NexonLoginImg} alt="nexon" unoptimized />
        </div>
      </div>
    );
  }

  return null;
};
