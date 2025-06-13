"use client";

import { useRouter } from "next/navigation";
import { ThemeChanger } from "./ThemeChanger";
import Image from "next/image";
import Logo from "@/images/groundLogo_light.png";
import Logo_dark from "@/images/groundLogo_dark.png";

export const Header = () => {
  const router = useRouter();

  return (
    <header className="header flex bg-white dark:bg-black/50 justify-between items-center pr-8 shadow font-bold text-lg">
      <div className="pt-3 pb-3 pl-6 pr-3 text-md cursor-pointer" onClick={() => router.push("/")}>
        <Image src={Logo_dark} alt="logo" width={120} height={100} className="hidden dark:block" />
        <Image src={Logo} alt="logo" width={120} height={100} className="block dark:hidden" />
      </div>
      <ThemeChanger />
    </header>
  );
};
