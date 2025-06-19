"use client";

import { useTheme } from "next-themes";
import { DarkIcon } from "./svg/DarkIcon";
import { LightIcon } from "./svg/LightIcon";

export const ThemeChanger = () => {
  const { setTheme } = useTheme();

  return (
    <div className="flex items-center">
      <button className="dark:hidden flex" onClick={() => setTheme("dark")}>
        <DarkIcon />
      </button>
      <button className="hidden dark:flex" onClick={() => setTheme("light")}>
        <LightIcon />
      </button>
    </div>
  );
};
