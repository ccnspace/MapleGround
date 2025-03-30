import { SelectBox } from "../SelectBox";
import type { Dispatch, SetStateAction } from "react";
const MAX_SPEED_STEP = 5;

interface AutoResetModeProps {
  speedLabel: string;
  isSpeedMode: boolean;
  firstOptions: string[];
  secondOptions: string[];
  thirdOptions: string[];
  speedStep: number;
  isAllNotSelected: boolean;
  setSpeedMode: Dispatch<SetStateAction<boolean>>;
  setFirstSpeedOption: (option: string) => void;
  setSecondSpeedOption: (option: string) => void;
  setThirdSpeedOption: (option: string) => void;
  handleUpSpeed: () => void;
  handleDownSpeed: () => void;
}

export const AutoResetMode = ({
  speedLabel,
  isSpeedMode,
  setSpeedMode,
  firstOptions,
  secondOptions,
  thirdOptions,
  setFirstSpeedOption,
  setSecondSpeedOption,
  setThirdSpeedOption,
  handleUpSpeed,
  handleDownSpeed,
  speedStep,
  isAllNotSelected,
}: AutoResetModeProps) => (
  <div className="flex items-center justify-center flex-col gap-0.5 text-black dark:text-white">
    <div
      className="flex flex-row justify-between items-center text-sm w-full font-bold mb-1
      bg-white/20 p-1 rounded-md text-white"
    >
      ⚡자동 재설정 모드
      <p
        className="flex justify-center text-xs px-1.5 pt-0.5 pb-0.5
        text-yellow-300 font-bold"
      >
        🏃{speedLabel}
      </p>
    </div>
    <p style={{ fontSize: "12px" }} className="flex mb-1 font-light text-white/90">
      순서 관계없이 선택한 옵션이 나올 때까지 재설정
    </p>
    <SelectBox disabled={isSpeedMode} options={firstOptions} onSelect={setFirstSpeedOption}></SelectBox>
    <SelectBox disabled={isSpeedMode} options={secondOptions} onSelect={setSecondSpeedOption}></SelectBox>
    <SelectBox disabled={isSpeedMode} options={thirdOptions} onSelect={setThirdSpeedOption}></SelectBox>
    <div className="flex flex-row w-[100%] gap-1.5 justify-center items-center">
      <button
        className="text-white font-bold w-[70%] text-xs p-1 mt-1.5 rounded-md flex
        justify-center bg-gradient-to-tr from-sky-600 to-blue-700
        hover:bg-gradient-to-tr hover:from-sky-800 hover:to-blue-900"
        onClick={() => {
          if (isAllNotSelected) {
            alert("적어도 한 개 이상 선택해야 합니다.");
            return;
          }
          setSpeedMode((prev) => !prev);
        }}
      >
        <p>{isSpeedMode ? "OFF" : "⚡START"}</p>
      </button>
      <button
        disabled={speedStep === MAX_SPEED_STEP}
        className="relative text-white font-bold w-[10%] text-xs p-0.5 mt-1.5 rounded-md flex
        justify-center items-center
        disabled:bg-gray-800 disabled:text-white/50
        enabled:bg-gradient-to-tr from-yellow-400 to-yellow-600
        enabled:hover:bg-gradient-to-tr hover:from-yellow-600 hover:to-yellow-700"
        onClick={handleUpSpeed}
      >
        <p>{"▲"}</p>
      </button>
      <button
        disabled={speedStep === 1}
        className="relative text-white font-bold w-[10%] text-xs p-0.5 mt-1.5 rounded-md flex
        justify-center items-center
        disabled:bg-gray-800 disabled:text-white/50
        enabled:bg-gradient-to-tr from-yellow-400 to-yellow-600
        enabled:hover:bg-gradient-to-tr hover:from-yellow-600 hover:to-yellow-700"
        onClick={handleDownSpeed}
      >
        <p>{"▼"}</p>
      </button>
    </div>
  </div>
);
