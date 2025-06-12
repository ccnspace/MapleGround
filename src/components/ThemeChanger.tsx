"use client";

import { useTheme } from "next-themes";
import { DarkIcon } from "./svg/DarkIcon";
import { LightIcon } from "./svg/LightIcon";
import { useEffect, useState } from "react";

export const ThemeChanger = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      {theme === "light" ? (
        <button onClick={() => setTheme("dark")}>
          <DarkIcon />
        </button>
      ) : (
        <button onClick={() => setTheme("light")}>
          <LightIcon />
        </button>
      )}
    </div>
  );
};
