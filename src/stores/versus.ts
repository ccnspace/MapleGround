import type { CharacterAttributes } from "@/apis/getCharacterAttributes";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface VersusState {
  firstPersonDate: string;
  secondPersonDate: string;
  firstPersonInfo: CharacterAttributes | null;
  secondPersonInfo: CharacterAttributes | null;
  setPersonDate: (type: "first" | "second", date: string) => void;
  setPersonInfo: (
    type: "first" | "second",
    data: CharacterAttributes | null
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
