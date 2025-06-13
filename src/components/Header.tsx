"use client";

import { useRouter } from "next/navigation";
import { ThemeChanger } from "./ThemeChanger";
import Logo from "@/images/groundLogo.png";
import Image from "next/image";

export const Header = () => {
  const router = useRouter();
  return (
    <header className="header flex bg-white dark:bg-black/50 justify-between items-center pr-8 shadow font-bold text-lg">
      <div className="pt-3 pb-3 pl-6 pr-3 text-md cursor-pointer" onClick={() => router.push("/")}>
        <Image src={Logo} alt="logo" width={120} height={100} />
      </div>
      <ThemeChanger />
    </header>
  );
};
