import { CharacterBase } from "@/types/Character";
import { CharacterStat } from "@/types/CharacterStat";
import { AllEquipmentsInfo } from "@/types/Equipment";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type CharacterState = {
  status: "success" | "error" | "idle";
  characterBase: CharacterBase | null;
  characterEquipments: AllEquipmentsInfo | null;
  characterStats: CharacterStat | null;
};

type CharacterAction = {
  setCharacterBase: (data: CharacterBase | null) => void;
  setCharacterEquipments: (data: AllEquipmentsInfo | null) => void;
  setCharacterStats: (data: CharacterStat | null) => void;
  setStatus: (status: "success" | "error" | "idle") => void;
  resetCharacterData: () => void;
};

const initialState: CharacterState = {
  status: "idle",
  characterBase: null,
  characterEquipments: null,
  characterStats: null,
};

export const useCharacterStore = create<CharacterState & CharacterAction>()(
  devtools((set) => ({
    ...initialState,
    setCharacterBase: (characterBase) => {
      set({ characterBase });
    },
    setCharacterEquipments(characterEquipments) {
      set({ characterEquipments });
    },
    setCharacterStats(characterStats) {
      set({ characterStats });
    },
    setStatus: (status) => {
      set({ status });
    },
    resetCharacterData: () => {
      set({ ...initialState });
    },
  }))
);
