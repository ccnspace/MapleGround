import type { ModalProps } from "@/components/Modal";
import { useModalStore } from "@/stores/modal";

type Params = Omit<ModalProps, "type"> & { type?: ModalProps["type"] };

/** 모달을 여는 함수. 기본적으로 alert modal로 동작한다. */
export const openModal = ({ type = "alert", ...rest }: Params) => {
  useModalStore.getState().setModal({ type, ...rest });
};
