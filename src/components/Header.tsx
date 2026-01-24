"use client";

import { useRouter } from "next/navigation";
import { ThemeChanger } from "./ThemeChanger";
import Image from "next/image";
import Logo from "@/images/mainLogo.png";
import Link from "next/link";
import { useNickname } from "@/hooks/useNickname";
import { usePathname } from "next/navigation";

const UpdatedBadge = () => {
  return <span className="h-3.5 w-3 flex items-center justify-center text-[9px] font-bold text-white bg-red-500 rounded-full">N</span>;
};

const HeaderNavItem = ({
  children,
  pathname,
  nickname,
  isUpdated,
}: {
  children: React.ReactNode;
  pathname: string;
  nickname: string;
  isUpdated: boolean;
}) => {
  const currentPath = usePathname();
  const isActive = currentPath === pathname;
  return (
    <li className="list-none flex items-center gap-1">
      {isActive ? (
        <>
          <span className="font-bold text-black dark:text-white underline underline-offset-8 flex items-center gap-1">{children}</span>
          {isUpdated && <UpdatedBadge />}
        </>
      ) : (
        <>
          <Link
            className="flex items-center font-medium text-color-400 hover:text-black dark:hover:text-white hover:[text-shadow:_0_0_0.5px_currentColor,_0_0_0.5px_currentColor]"
            href={`${pathname}?name=${nickname}`}
          >
            {children}
          </Link>
          {isUpdated && <UpdatedBadge />}
        </>
      )}
    </li>
  );
};

const HeaderMenuList = () => {
  const nickname = useNickname();
  return (
    <ul className="flex text-[15px] gap-6">
      <HeaderNavItem pathname={"/main"} nickname={nickname} isUpdated={false}>
        메인
      </HeaderNavItem>
      <HeaderNavItem pathname={"/main/vs"} nickname={nickname} isUpdated={false}>
        과거vs현재
      </HeaderNavItem>
      <HeaderNavItem pathname={"/main/exp"} nickname={nickname} isUpdated={true}>
        경험치 효율 계산
      </HeaderNavItem>
      <HeaderNavItem pathname={"/main/weapon"} nickname={nickname} isUpdated={true}>
        해방날짜 계산
      </HeaderNavItem>
      <HeaderNavItem pathname={"/main/boss"} nickname={nickname} isUpdated={false}>
        주간보스 정산
      </HeaderNavItem>
    </ul>
  );
};

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="header px-2 flex bg-white dark:bg-color-950/80 justify-between items-center pr-8 shadow font-bold text-lg">
      <div className="flex items-center gap-6">
        <div className="pt-2 pb-2 pl-6 pr-3 text-md cursor-pointer flex items-center" onClick={() => router.push("/")}>
          <Image src={Logo} alt="logo" quality={100} width={90} height={60} className="flex" />
        </div>
        {!isHome && <HeaderMenuList />}
      </div>
      <ThemeChanger />
    </header>
  );
};
