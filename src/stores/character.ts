import type { CharacterAllInfo } from "@/apis/getCharacterAllInfo";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type CharacterState = {
  fetchStatus: "success" | "error" | "idle";
  characterAllInfo: CharacterAllInfo | null;
};

type CharacterAction = {
  setFetchStatus: (status: "success" | "error" | "idle") => void;
  setCharacterAllInfo: (allInfo: CharacterAllInfo) => void;
  resetCharacterData: () => void;
};

const initialState: CharacterState = {
  fetchStatus: "idle",
  characterAllInfo: null,
};

export const useCharacterStore = create<CharacterState & CharacterAction>()(
  devtools((set) => ({
    ...initialState,
    setCharacterAllInfo: (characterAllInfo) => {
      set({ characterAllInfo });
    },
    setFetchStatus: (fetchStatus) => {
      set({ fetchStatus });
    },
    resetCharacterData: () => {
      set({ ...initialState });
    },
  }))
);
