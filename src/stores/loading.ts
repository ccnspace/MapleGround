import { ModalProps } from "@/components/Modal";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface LoadingState {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

export const useLoadingStore = create<LoadingState>()(
  devtools((set) => ({
    isLoading: false,
    setLoading: (isLoading) => {
      set({ isLoading }, false, "isLoading");
    },
  }))
);
