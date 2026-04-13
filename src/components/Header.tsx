"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
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
  // 메뉴 바로 아래에 겹쳐 뜨는 사각 말풍선 꼬리표 (PC 헤더 전용).
  tag?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "메인", pathname: "/main", isUpdated: false, requiresNickname: true },
  { label: "메이플 유니온", pathname: "/main/union", isUpdated: true, requiresNickname: true, tag: "빠른 자동 배치!" },
  { label: "주간보스 정산", pathname: "/main/boss", isUpdated: true, requiresNickname: false },
  { label: "과거vs현재", pathname: "/main/vs", isUpdated: false, requiresNickname: true },
  { label: "경험치 효율 계산", pathname: "/main/exp", isUpdated: false, requiresNickname: false },
  { label: "해방날짜 계산", pathname: "/main/weapon", isUpdated: true, requiresNickname: true, tag: "자세한 클리어 날짜 계산" },
  { label: "마이메이플", pathname: "/main/myMaple", isUpdated: false, requiresNickname: true, disabled: true },
];

// 꼬리표 닫음 상태 저장 (localStorage) — 메뉴별 마지막 닫은 시각(epoch ms). 만료 4주.
const NAV_TAGS_DISMISSED_KEY = "header-nav-tags-dismissed-v1";
const NAV_TAG_DISMISS_EXPIRY_MS = 4 * 7 * 24 * 60 * 60 * 1000;

type DismissedMap = Record<string /* pathname */, number /* dismissedAt */>;

const loadDismissedTags = (): DismissedMap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(NAV_TAGS_DISMISSED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    // 만료된 항목은 읽으면서 pruning → 다음 persist 시 사라짐.
    const now = Date.now();
    const valid: DismissedMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "number" && now - v < NAV_TAG_DISMISS_EXPIRY_MS) valid[k] = v;
    }
    return valid;
  } catch {
    return {};
  }
};

const persistDismissedTags = (map: DismissedMap) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NAV_TAGS_DISMISSED_KEY, JSON.stringify(map));
  } catch {
    // storage 꽉 차거나 비활성 — 무시
  }
};

// 꼬리표 — 중립톤(어두운 slate). 위쪽 삼각 꼭지(▲) 는 별도 span 의 border trick 으로 확실히 렌더.
// 본체는 pointer-events-none 으로 메뉴 클릭 영역을 가리지 않고, X 버튼만 pointer-events-auto 로 클릭 허용.
const NavItemTag = ({ text, onClose }: { text: string; onClose: () => void }) => (
  <span
    className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+6px)] z-10
      inline-flex items-center gap-1.5 px-2 py-1 rounded text-[12px] font-semibold whitespace-nowrap leading-none
      bg-slate-700 text-slate-100 dark:bg-slate-200 dark:text-slate-800
      shadow-sm pointer-events-none select-none"
  >
    <span
      aria-hidden
      className="absolute left-1/2 -translate-x-1/2 text-slate-700 dark:text-slate-200"
      style={{
        top: "-5px",
        width: 0,
        height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderBottom: "5px solid currentColor",
      }}
    />
    <span>{text}</span>
    <button
      type="button"
      aria-label="꼬리표 닫기"
      title="닫기 (4주간 숨김)"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClose();
      }}
      className="pointer-events-auto -mr-0.5 w-3.5 h-3.5 inline-flex items-center justify-center
        rounded-full text-[10px] leading-none
        text-slate-200/80 dark:text-slate-700/80
        hover:bg-black/25 dark:hover:bg-black/15
        hover:text-white dark:hover:text-black transition-colors"
    >
      ✕
    </button>
  </span>
);

const UpdatedBadge = () => (
  <span className="h-3.5 w-3 flex items-center justify-center text-[9px] font-bold text-white bg-red-500 rounded-full">N</span>
);

interface HeaderNavItemProps {
  label: string;
  pathname: string;
  nickname?: string | null;
  isUpdated: boolean;
  disabled?: boolean;
  tag?: string;
  onDismissTag?: () => void;
}

const HeaderNavItem = ({ label, pathname, nickname, isUpdated, disabled, tag, onDismissTag }: HeaderNavItemProps) => {
  const currentPath = usePathname();
  const isActive = currentPath === pathname;
  const href = nickname ? `${pathname}?name=${nickname}` : pathname;

  const baseClassName = "flex items-center";
  const activeClassName = "font-bold text-black dark:text-white underline underline-offset-8";
  const inactiveClassName =
    "font-medium text-color-400 hover:text-black dark:hover:text-white hover:[text-shadow:_0_0_0.5px_currentColor,_0_0_0.5px_currentColor]";
  const disabledClassName = "opacity-50 cursor-not-allowed pointer-events-none";

  return (
    <li className="list-none relative flex items-center gap-1">
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
      {tag && !disabled && onDismissTag && <NavItemTag text={tag} onClose={onDismissTag} />}
    </li>
  );
};

const HeaderMenuList = () => {
  const nickname = useNickname({ isEnableErrorModal: false });

  // 꼬리표 닫음 상태 — 클라이언트에서만 로드 (SSR hydration mismatch 방지).
  // hasMounted 플래그로 hydration 완료 전까지 꼬리표 자체를 렌더하지 않아, "나타났다 사라지는" flash 를 제거.
  const [hasMounted, setHasMounted] = useState(false);
  const [dismissedTags, setDismissedTags] = useState<DismissedMap>({});
  useEffect(() => {
    const loaded = loadDismissedTags();
    setDismissedTags(loaded);
    // 만료 pruning 결과를 즉시 스토리지에도 반영
    persistDismissedTags(loaded);
    setHasMounted(true);
  }, []);

  const handleDismissTag = (pathname: string) => {
    setDismissedTags((prev) => {
      const next = { ...prev, [pathname]: Date.now() };
      persistDismissedTags(next);
      return next;
    });
  };

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
          tag={hasMounted && !dismissedTags[item.pathname] ? item.tag : undefined}
          onDismissTag={() => handleDismissTag(item.pathname)}
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
