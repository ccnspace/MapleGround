"use client";

import { useRouter } from "next/navigation";
import { ThemeChanger } from "./ThemeChanger";
import Image from "next/image";
import Logo from "@/images/mainLogo.png";
import { getOAuthUrl } from "@/apis/getOAuthUrl";
import NexonLoginImg from "@/images/nexonLogin.png";
import { useLoggedIn } from "@/hooks/useLoggedIn";
import { logout } from "@/apis/logout";

export const Header = () => {
  const router = useRouter();
  const { loggedInUserInfo, fetchStatus } = useLoggedIn();

  const handleLogoutClick = async () => {
    await logout();
  };

  const handleNexonLoginClick = async () => {
    const authUrl = await getOAuthUrl();
    window.location.href = authUrl;
  };

  const showLoginButton = fetchStatus === "error" && !loggedInUserInfo;
  const showLogoutButton = fetchStatus === "success" && loggedInUserInfo;

  return (
    <header className="header flex bg-white/90 dark:bg-black/50 justify-between items-center pr-8 shadow font-bold text-lg">
      <div className="pt-2 pb-2 pl-6 pr-3 text-md cursor-pointer flex items-center" onClick={() => router.push("/")}>
        <Image src={Logo} alt="logo" quality={100} width={90} height={60} className="flex" />
      </div>
      <div className="flex items-center gap-2">
        {showLoginButton && (
          <div className="flex items-center gap-2 h-[20px]">
            <div className="flex items-center justify-center cursor-pointer" onClick={handleNexonLoginClick}>
              <Image src={NexonLoginImg} alt="nexon" unoptimized height={40} />
            </div>
          </div>
        )}
        {showLogoutButton && (
          <button
            className="flex items-center gap-2 text-[16px] text-black/80 dark:text-white/80
          hover:text-black dark:hover:text-white
          rounded-md p-1"
            onClick={handleLogoutClick}
          >
            <p>로그아웃</p>
          </button>
        )}
        <ThemeChanger />
      </div>
    </header>
  );
};
