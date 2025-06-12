"use client";

import { useRouter } from "next/navigation";
import { ThemeChanger } from "./ThemeChanger";

export const Header = () => {
  const router = useRouter();
  return (
    <header className="header flex bg-white dark:bg-black/50 justify-between items-center pr-8 shadow font-bold text-lg">
      <div className="pt-3 pb-3 pl-6 pr-3 text-md cursor-pointer" onClick={() => router.push("/")}>
        메이플<span className="text-indigo-500 dark:text-indigo-400">그라운드</span>
      </div>
      <ThemeChanger />
    </header>
  );
};
