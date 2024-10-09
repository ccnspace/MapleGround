import type { CharacterAttributes } from "@/apis/getCharacterAttributes";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type CharacterState = {
  fetchStatus: "success" | "error" | "idle";
  characterAttributes: CharacterAttributes | null;
};

type CharacterAction = {
  setFetchStatus: (status: "success" | "error" | "idle") => void;
  setCharacterAttributes: (data: CharacterAttributes) => void;
  resetCharacterData: () => void;
};

const initialState: CharacterState = {
  fetchStatus: "idle",
  characterAttributes: null,
};

export const useCharacterStore = create<CharacterState & CharacterAction>()(
  devtools((set) => ({
    ...initialState,
    setCharacterAttributes: (characterAttributes) => {
      set({ characterAttributes });
    },
    setFetchStatus: (fetchStatus) => {
      set({ fetchStatus });
    },
    resetCharacterData: () => {
      set({ ...initialState });
    },
  }))
);
