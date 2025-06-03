"use client";

import { useCubeStore } from "@/stores/cube";
import { useModalStore } from "@/stores/modal";
import { openModal } from "@/utils/openModal";
// import { PlainBox } from "@/components/PlainBox";
// import { InfoIcon } from "@/components/svg/InfoIcon";
// import { ReportContainer } from "./ReportContainer";
import { useEffect, useMemo, useRef, useState } from "react";

class FileUpload {
  private file: File | null;

  constructor() {
    this.file = null;
  }

  setFile(file: File | null) {
    this.file = file;
  }

  getFile() {
    return this.file;
  }

  uploadFile() {
    if (!this.file) {
      throw new Error("File is not set");
    }

    console.log(this.file);
  }
}

const useFileUpload = (cube: any) => {
  console.log("useFileUpload");
  const beforeFileUploader = useRef<FileUpload>();
  const fileUploader = useMemo(() => new FileUpload(), [cube]);

  useEffect(() => {
    console.log("before : ", beforeFileUploader.current);
    console.log(beforeFileUploader.current === fileUploader);
    beforeFileUploader.current = fileUploader;

    console.log("before : ", beforeFileUploader.current);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    fileUploader.setFile(selectedFile || null);
    fileUploader.uploadFile();
  };

  return { fileUploader, handleFileChange };
};

export default function Page() {
  const modal = useModalStore((state) => state.modal);
  const testMap = useCubeStore((state) => state.testMap);

  useEffect(() => {
    useCubeStore.getState().setCubeTargetState({ targetItem: { itemLevel: 200 } });
  }, []);

  const fileList = Array.from(testMap.values());

  const { fileUpload, handleFileChange } = useFileUpload(fileList[0]);

  return (
    <div className="flex px-5 pt-8 w-[1280px] flex-col">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={() => openModal({ type: "alert", message: "test" })}>Upload</button>
      {/* <div className="flex flex-col gap-3">
        <p className="text-2xl font-bold">과거의 나와 대결</p>
        <PlainBox>
          <div className="flex flex-col gap-2">
            <p className="flex gap-1 items-center font-medium text-slate-700 dark:text-white">
              <InfoIcon />
              사용 전 확인!
            </p>
            <p className="font-medium">
              {"• 왼쪽에서 캐릭터명을 검색한 뒤,"}{" "}
              <span className="underline underline-offset-4 decoration-2 decoration-sky-600">내 캐릭터가 설정되어 있는 상태</span>
              여야 합니다.
            </p>
            <p className="-mt-1 font-medium">
              {"• 첫 번째 캐릭터의 날짜를 두 번째보다 "}
              <span className="underline underline-offset-4 decoration-2 decoration-sky-600">과거로 설정</span>
              {"해 주세요."}
            </p>
          </div>
        </PlainBox>
      </div>
      <ReportContainer /> */}
    </div>
  );
}
