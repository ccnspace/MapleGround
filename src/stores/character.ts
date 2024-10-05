import { CharacterBase } from "@/types/Character";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface CharacterState {
  status: "success" | "error" | "idle";
  characterBase: CharacterBase | null;
  setCharacterBase: (data: CharacterBase | null) => void;
  setStatus: (status: "success" | "error" | "idle") => void;
}

export const useCharacterStore = create<CharacterState>()(
  devtools((set) => ({
    status: "idle",
    characterBase: null,
    setCharacterBase: (characterBase) => {
      set({ characterBase });
    },
    setStatus: (status) => {
      set({ status });
    },
  }))
);
