import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface CharacterImageState {
  characterImages: { character_name: string; character_image: string }[];
  setCharacterImages: (characterImages: { character_name: string; character_image: string }[]) => void;
}

export const useCharacterImageStore = create<CharacterImageState>()(
  devtools((set) => ({
    characterImages: [],
    setCharacterImages: (characterImages) => set({ characterImages }),
  }))
);
