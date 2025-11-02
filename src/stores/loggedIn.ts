import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { LoggedInUserInfo } from "@/apis/getUserInfoByOAuth";

interface LoggedInState {
  fetchStatus: "success" | "error" | "idle" | "loading";
  loggedInUserInfo: LoggedInUserInfo | null;
  setFetchStatus: (fetchStatus: "success" | "error" | "idle" | "loading") => void;
  setLoggedInUserInfo: (loggedInUserInfo: LoggedInUserInfo | null) => void;
}

export const useLoggedInStore = create<LoggedInState>()(
  devtools((set) => ({
    fetchStatus: "idle",
    loggedInUserInfo: null,
    setFetchStatus: (fetchStatus) => set({ fetchStatus }),
    setLoggedInUserInfo: (loggedInUserInfo) => set({ loggedInUserInfo }),
  }))
);
