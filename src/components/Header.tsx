"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { useNickname } from "@/hooks/useNickname";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ThemeChanger } from "./ThemeChanger";
import Logo from "@/images/mainLogo.png";

const HamburgerIcon = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex flex-col justify-center items-center w-8 h-8 gap-1.5 min-[1001px]:hidden"
    aria-label="메뉴 열기"
  >
    <span
      className={`block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 transition-transform duration-300 ${
        isOpen ? "rotate-45 translate-y-2" : ""
      }`}
    />
    <span className={`block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`} />
    <span
      className={`block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 transition-transform duration-300 ${
        isOpen ? "-rotate-45 -translate-y-2" : ""
      }`}
    />
  </button>
);

interface NavItem {
  label: string;
  pathname: string;
  isUpdated: boolean;
  requiresNickname: boolean;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "메인", pathname: "/main", isUpdated: false, requiresNickname: true },
  { label: "과거vs현재", pathname: "/main/vs", isUpdated: false, requiresNickname: true },
  { label: "경험치 효율 계산", pathname: "/main/exp", isUpdated: true, requiresNickname: false },
  { label: "해방날짜 계산", pathname: "/main/weapon", isUpdated: true, requiresNickname: true },
  { label: "마이메이플", pathname: "/main/myMaple", isUpdated: false, requiresNickname: true, disabled: true },
  { label: "주간보스 정산", pathname: "/main/boss", isUpdated: false, requiresNickname: true, disabled: true },
];

const UpdatedBadge = () => (
  <span className="h-3.5 w-3 flex items-center justify-center text-[9px] font-bold text-white bg-red-500 rounded-full">N</span>
);

interface HeaderNavItemProps {
  label: string;
  pathname: string;
  nickname?: string | null;
  isUpdated: boolean;
  disabled?: boolean;
}

const HeaderNavItem = ({ label, pathname, nickname, isUpdated, disabled }: HeaderNavItemProps) => {
  const currentPath = usePathname();
  const isActive = currentPath === pathname;
  const href = nickname ? `${pathname}?name=${nickname}` : pathname;

  const baseClassName = "flex items-center";
  const activeClassName = "font-bold text-black dark:text-white underline underline-offset-8";
  const inactiveClassName =
    "font-medium text-color-400 hover:text-black dark:hover:text-white hover:[text-shadow:_0_0_0.5px_currentColor,_0_0_0.5px_currentColor]";
  const disabledClassName = "opacity-50 cursor-not-allowed pointer-events-none";

  return (
    <li className="list-none flex items-center gap-1">
      {isActive || disabled ? (
        <span className={`${baseClassName} ${isActive ? activeClassName : inactiveClassName} ${disabled ? disabledClassName : ""}`}>
          {label}
        </span>
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
    <ul className="hidden min-[1001px]:flex text-[15px] gap-6">
      {NAV_ITEMS.filter((item) => !item.requiresNickname || nickname).map((item) => (
        <HeaderNavItem
          key={item.pathname}
          label={item.label}
          pathname={item.pathname}
          nickname={nickname}
          isUpdated={item.isUpdated}
          disabled={item.disabled}
        />
      ))}
    </ul>
  );
};

const MobileDropdownItem = ({ item, nickname, onClose }: { item: NavItem; nickname: string | null; onClose: () => void }) => {
  const currentPath = usePathname();
  const isActive = currentPath === item.pathname;
  const href = nickname ? `${item.pathname}?name=${nickname}` : item.pathname;

  if (item.disabled) {
    return (
      <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed flex items-center justify-between">
        <span>{item.label}</span>
        {item.isUpdated && <UpdatedBadge />}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        onClick={onClose}
        className={`block px-4 py-3 text-sm transition-colors ${
          isActive
            ? "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-bold"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <span className="flex items-center justify-between">
          <span>{item.label}</span>
          {item.isUpdated && <UpdatedBadge />}
        </span>
      </Link>
    </li>
  );
};

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const nickname = useNickname({ isEnableErrorModal: false });

  const handleClose = useCallback(() => setIsOpen(false), []);
  useClickOutside(menuRef, handleClose);

  const filteredItems = NAV_ITEMS.filter((item) => !item.requiresNickname || nickname);

  return (
    <div ref={menuRef} className="relative min-[1001px]:hidden">
      <HamburgerIcon isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <ul className="absolute top-12 left-0 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 fade-in">
          {filteredItems.map((item) => (
            <MobileDropdownItem key={item.pathname} item={item} nickname={nickname} onClose={handleClose} />
          ))}
        </ul>
      )}
    </div>
  );
};

export const Header = () => {
  const router = useRouter();

  return (
    <header className="header px-2 flex bg-white dark:bg-color-950/80 justify-between items-center pr-8 max-[600px]:pr-4 shadow font-bold text-lg">
      <div className="flex items-center gap-6 max-[600px]:gap-3">
        <div
          className="pt-2 pb-2 pl-6 pr-3 max-[600px]:pl-2 max-[600px]:pr-1 text-md cursor-pointer flex items-center"
          onClick={() => router.push("/")}
        >
          <Image src={Logo} alt="logo" quality={100} width={90} height={60} className="flex max-[600px]:w-16 max-[600px]:h-auto" />
        </div>
        <MobileMenu />
        <HeaderMenuList />
      </div>
      <ThemeChanger />
    </header>
  );
};
