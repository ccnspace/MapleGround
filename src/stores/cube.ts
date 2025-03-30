import type { ItemPotentialGrade } from "@/types/Equipment";
import { CubeType } from "@/utils/CubeSimulator";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface CubeState {
  targetItem: {
    itemPotentialGrade: ItemPotentialGrade | null;
    additionalPotentialGrade: ItemPotentialGrade | null;
    currentPotentialOptions: string[];
    currentAdditionalOptions: string[];
    itemLevel: number;
    itemType: string;
    itemIcon: string;
    itemName: string;
  } | null;
  cubeType: CubeType;
}

interface CubeAction {
  setCubeTargetState: (item: CubeState) => void;
  resetCube: () => void;
}

export const useCubeStore = create<CubeState & CubeAction>()(
  devtools((set) => ({
    targetItem: null,
    cubeType: "potential",
    setCubeTargetState: (item) => set(item),
    resetCube: () => set({ targetItem: null }),
  }))
);
