import { CharacterBase } from "@/types/Character";
import type { CharacterStat } from "@/types/CharacterStat";
import { AllEquipmentsInfo } from "@/types/Equipment";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface VersusState {
  firstPersonDate: string;
  secondPersonDate: string;
  firstPersonBase: CharacterBase | null;
  firstPersonStat: CharacterStat | null;
  firstPersonEquipment: AllEquipmentsInfo | null;
  secondPersonBase: CharacterBase | null;
  secondPersonStat: CharacterStat | null;
  secondPersonEquipment: AllEquipmentsInfo | null;
  setPersonDate: (type: "first" | "second", date: string) => void;
  setPersonStat: (type: "first" | "second", stat: CharacterStat | null) => void;
  setPersonBase: (type: "first" | "second", info: CharacterBase | null) => void;
  setPersonEquipment: (
    type: "first" | "second",
    equipment: AllEquipmentsInfo | null
  ) => void;
}

export const useVersusStore = create<VersusState>()(
  devtools((set) => ({
    firstPersonDate: "",
    secondPersonDate: "",
    firstPersonBase: null,
    firstPersonStat: null,
    firstPersonEquipment: null,
    secondPersonBase: null,
    secondPersonStat: null,
    secondPersonEquipment: null,
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
    setPersonBase: (type, info) => {
      if (type === "first") {
        set({ firstPersonBase: info });
      } else {
        set({ secondPersonBase: info });
      }
    },
    setPersonEquipment: (type, equipment) => {
      if (type === "first") {
        set({ firstPersonEquipment: equipment });
      } else {
        set({ secondPersonEquipment: equipment });
      }
    },
  }))
);
