"use client";

import { useModalStore } from "@/stores/modal";
import { PropsWithChildren } from "react";
import { DimmedLayer } from "./DimmedLayer";
import { useShallow } from "zustand/shallow";

export type ModalProps = {
  type: "alert" | "confirm";
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmCallback?: () => void;
  cancelCallback?: () => void;
};

type ModalButtonProps = {
  onClick?: () => void;
};
const ModalButton = ({
  onClick,
  children,
}: PropsWithChildren<ModalButtonProps>) => {
  return (
    <button
      onClick={onClick}
      className="flex rounded-md text-black text-base w-16 justify-center font-bold
      px-1 pt-1 pb-1 bg-slate-200
      hover:bg-slate-300
      "
    >
      {children}
    </button>
  );
};

export const Modal = () => {
  const modal = useModalStore(useShallow((state) => state.modal));

  const {
    type,
    message,
    confirmCallback,
    cancelCallback,
    cancelLabel = "취소",
    confirmLabel = "확인",
  } = modal || {};

  const handleCancelClick = () => {
    cancelCallback?.();
    useModalStore.getState().closeModal();
  };
  const handleConfirmClick = () => {
    confirmCallback?.();
    useModalStore.getState().closeModal();
  };

  if (!modal) return null;

  return (
    <>
      <div
        className="flex shrink-0 w-[350px] z-50 absolute left-[45%] top-1/3 flex-col
         bg-white dark:bg-[#2c2e38] shadow rounded-lg gap-2 text-center
      px-3 pt-6 pb-6"
      >
        <p className="flex whitespace-pre-wrap text-[18px] pt-2 pb-2 justify-center font-medium">
          {message}
        </p>
        <div className="flex flex-row gap-2 justify-center">
          {type === "confirm" && (
            <ModalButton onClick={handleCancelClick}>{cancelLabel}</ModalButton>
          )}
          <ModalButton onClick={handleConfirmClick}>{confirmLabel}</ModalButton>
        </div>
      </div>
      <DimmedLayer />
    </>
  );
};
