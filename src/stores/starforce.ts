import { ItemEquipment } from "@/types/Equipment";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface StarforceState {
  targetItem: ItemEquipment | null;
}

interface StarforceAction {
  setTargetItem: (targetItem: ItemEquipment) => void;
  updateTargetItem: (targetItem: Partial<ItemEquipment>) => void;
  resetStarforceTarget: () => void;
}

export const useStarforceStore = create<StarforceState & StarforceAction>()(
  devtools((set) => ({
    targetItem: null,
    setTargetItem: (targetItem) => set({ targetItem }),
    updateTargetItem: (targetItem) => {
      set((state) => {
        if (!state.targetItem) return state;
        return {
          targetItem: { ...state.targetItem, ...targetItem },
        };
      });
    },
    resetStarforceTarget: () => set({ targetItem: null }),
  }))
);
