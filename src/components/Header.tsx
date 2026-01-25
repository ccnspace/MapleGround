"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useNickname } from "@/hooks/useNickname";
import { ThemeChanger } from "./ThemeChanger";
import Logo from "@/images/mainLogo.png";

interface NavItem {
  label: string;
  pathname: string;
  isUpdated: boolean;
  requiresNickname: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "메인", pathname: "/main", isUpdated: false, requiresNickname: true },
  { label: "과거vs현재", pathname: "/main/vs", isUpdated: false, requiresNickname: true },
  { label: "경험치 효율 계산", pathname: "/main/exp", isUpdated: true, requiresNickname: false },
  { label: "해방날짜 계산", pathname: "/main/weapon", isUpdated: true, requiresNickname: true },
  { label: "주간보스 정산", pathname: "/main/boss", isUpdated: false, requiresNickname: true },
];

const UpdatedBadge = () => (
  <span className="h-3.5 w-3 flex items-center justify-center text-[9px] font-bold text-white bg-red-500 rounded-full">N</span>
);

interface HeaderNavItemProps {
  label: string;
  pathname: string;
  nickname?: string | null;
  isUpdated: boolean;
}

const HeaderNavItem = ({ label, pathname, nickname, isUpdated }: HeaderNavItemProps) => {
  const currentPath = usePathname();
  const isActive = currentPath === pathname;
  const href = nickname ? `${pathname}?name=${nickname}` : pathname;

  const baseClassName = "flex items-center";
  const activeClassName = "font-bold text-black dark:text-white underline underline-offset-8";
  const inactiveClassName =
    "font-medium text-color-400 hover:text-black dark:hover:text-white hover:[text-shadow:_0_0_0.5px_currentColor,_0_0_0.5px_currentColor]";

  return (
    <li className="list-none flex items-center gap-1">
      {isActive ? (
        <span className={`${baseClassName} ${activeClassName}`}>{label}</span>
      ) : (
        <Link className={`${baseClassName} ${inactiveClassName}`} href={href}>
          {label}
        </Link>
      )}
      {isUpdated && <UpdatedBadge />}
    </li>
  );
};

const HeaderMenuList = () => {
  const nickname = useNickname({ isEnableErrorModal: false });

  return (
    <ul className="flex text-[15px] gap-6">
      {NAV_ITEMS.filter((item) => !item.requiresNickname || nickname).map((item) => (
        <HeaderNavItem key={item.pathname} label={item.label} pathname={item.pathname} nickname={nickname} isUpdated={item.isUpdated} />
      ))}
    </ul>
  );
};

export const Header = () => {
  const router = useRouter();

  return (
    <header className="header px-2 flex bg-white dark:bg-color-950/80 justify-between items-center pr-8 shadow font-bold text-lg">
      <div className="flex items-center gap-6">
        <div className="pt-2 pb-2 pl-6 pr-3 text-md cursor-pointer flex items-center" onClick={() => router.push("/")}>
          <Image src={Logo} alt="logo" quality={100} width={90} height={60} className="flex" />
        </div>
        <HeaderMenuList />
      </div>
      <ThemeChanger />
    </header>
  );
};
