"use client";

import { ReactElement } from "react";
import Link from "next/link";
import { ProfileWrapper } from "./Profile";
import { useCharacterStore } from "@/stores/character";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export type SideBarItemType = {
  icon: ReactElement | string;
  title: string;
  src: string;
  isUpdated?: boolean;
};

const BookmarkSection = () => {
  const { value: bookmarks } = useLocalStorage("bookmark");
  if (!bookmarks || bookmarks.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 mx-5 p-3 rounded-lg bg-slate-100 dark:bg-black/30 max-h-60 overflow-y-auto">
      <div className="flex items-center gap-1 mb-1 px-1">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-400">즐겨찾기한 캐릭터</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">({bookmarks.length})</span>
      </div>
      <ul className="flex flex-col gap-1.5 p-2">
        {bookmarks.map((name, index) => (
          <li key={`${name}-${index}`}>
            <Link
              href={`/main?name=${encodeURIComponent(name)}`}
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/50 dark:bg-black/40 hover:bg-white/70 dark:hover:bg-black/60 transition-all duration-200"
            >
              <span className="text-sm">⭐</span>
              <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white truncate">
                {name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const SideBar = () => {
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);
  const isSuccess = fetchStatus === "success";

  if (!isSuccess) return null;

  return (
    <div className="sidebar flex-shrink-0 w-96 font-bold text-md">
      <ProfileWrapper />
      <BookmarkSection />
    </div>
  );
};
