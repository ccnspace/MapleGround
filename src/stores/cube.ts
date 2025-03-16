import type { ItemPotentialGrade } from "@/types/Equipment";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface CubeState {
  targetItem: {
    itemPotentialGrade: ItemPotentialGrade;
    itemLevel: number;
    itemType: string;
    itemIcon: string;
    itemName: string;
    currentPotentialOptions?: string[];
  } | null;
}

interface CubeAction {
  setCubeTargetItem: (item: CubeState) => void;
  resetCube: () => void;
}

export const useCubeStore = create<CubeState & CubeAction>()(
  devtools((set) => ({
    targetItem: null,
    setCubeTargetItem: (item) => set(item),
    resetCube: () => set({ targetItem: null }),
  }))
);
