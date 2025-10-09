import { ModalProps } from "@/components/Modal";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ModalState {
  isModalOpen: boolean;
  openNoticeModal: () => void;
  closeNoticeModal: () => void;
}

export const useNoticeModalStore = create<ModalState>()(
  devtools((set) => ({
    isModalOpen: false,
    openNoticeModal: () => {
      set({ isModalOpen: true });
    },
    closeNoticeModal: () => {
      set({ isModalOpen: false });
    },
  }))
);
