"use client";

import { useRouter } from "next/navigation";
import { ThemeChanger } from "./ThemeChanger";
import Image from "next/image";
import Logo from "@/images/mainLogo.png";

export const Header = () => {
  const router = useRouter();

  return (
    <header className="header flex bg-white/90 dark:bg-black/50 justify-between items-center pr-8 shadow font-bold text-lg">
      <div className="pt-2 pb-2 pl-6 pr-3 text-md cursor-pointer flex items-center" onClick={() => router.push("/")}>
        <Image src={Logo} alt="logo" quality={100} width={90} height={60} className="flex" />
      </div>
      <ThemeChanger />
    </header>
  );
};
