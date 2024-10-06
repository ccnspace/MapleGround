import { ModalProps } from "@/components/Modal";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ModalState {
  modal: ModalProps | null;
  setModal: (modal: ModalProps) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>()(
  devtools((set) => ({
    modal: null,
    setModal: (modal) => {
      set({ modal });
    },
    closeModal: () => {
      set({ modal: null });
    },
  }))
);
