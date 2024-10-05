import type { CharacterStat } from "@/types/CharacterStat";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface VersusState {
  firstPersonDate: string;
  secondPersonDate: string;
  firstPersonStat: CharacterStat | null;
  secondPersonStat: CharacterStat | null;
  setPersonDate: (type: "first" | "second", date: string) => void;
  setPersonStat: (type: "first" | "second", stat: CharacterStat | null) => void;
}

export const useVersusStore = create<VersusState>()(
  devtools((set) => ({
    firstPersonDate: "",
    secondPersonDate: "",
    firstPersonStat: null,
    secondPersonStat: null,
    setPersonDate: (type, date) => {
      if (type === "first") {
        set({ firstPersonDate: date });
      } else {
        set({ secondPersonDate: date });
      }
    },
    setPersonStat: (type, stat) => {
      if (type === "first") {
        set({ firstPersonStat: stat });
      } else {
        set({ secondPersonStat: stat });
      }
    },
  }))
);
