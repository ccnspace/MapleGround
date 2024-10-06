import type { CharacterAllInfo } from "@/apis/getCharacterAllInfo";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface VersusState {
  firstPersonDate: string;
  secondPersonDate: string;
  firstPersonInfo: CharacterAllInfo | null;
  secondPersonInfo: CharacterAllInfo | null;
  setPersonDate: (type: "first" | "second", date: string) => void;
  setPersonInfo: (
    type: "first" | "second",
    allInfo: CharacterAllInfo | null
  ) => void;
}

export const useVersusStore = create<VersusState>()(
  devtools((set) => ({
    firstPersonDate: "",
    secondPersonDate: "",
    firstPersonInfo: null,
    secondPersonInfo: null,
    setPersonDate: (type, date) => {
      if (type === "first") {
        set({ firstPersonDate: date });
      } else {
        set({ secondPersonDate: date });
      }
    },
    setPersonInfo: (type, allInfo) => {
      if (type === "first") {
        set({ firstPersonInfo: allInfo });
      } else {
        set({ secondPersonInfo: allInfo });
      }
    },
  }))
);
