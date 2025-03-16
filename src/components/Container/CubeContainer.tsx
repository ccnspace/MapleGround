import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useThrottle } from "@/hooks/useThrottle";
import { useCubeStore } from "@/stores/cube";
import { ItemPotentialGrade } from "@/types/Equipment";
import { CubeSimulator } from "@/utils/CubeSimulator";
import Image from "next/image";
import rollCubeSound from "@/app/sound/ScrollSuccess.mp3";
import completeSound from "@/app/sound/AchievmentComplete.mp3";
import CheckBox from "../CheckBox";
import potentialImg from "@/images/potentialBg.png";

export const CubeContainer = () => {
  const targetItem = useCubeStore((state) => state.targetItem);
  const resetCube = useCubeStore((state) => state.resetCube);
  const { itemLevel, itemType, itemIcon, itemName, itemPotentialGrade, currentPotentialOptions } = targetItem || {};
  const [prevOptions, setPrevOptions] = useState<string[]>([]);
  const [newOptions, setNewOptions] = useState<string[]>([]);
  const [prevGrade, setPrevGrade] = useState<ItemPotentialGrade>();
  const [newGrade, setNewGrade] = useState<ItemPotentialGrade>();
  const [currentAttempt, setCurrentAttempt] = useState<number>(0);
  const [currentGuarantee, setCurrentGuarantee] = useState<number>(0);
  const [fadeIn, setFadeIn] = useState(false);
  const [glow, setGlow] = useState(false);

  const [isSoundChecked, setIsSoundChecked] = useState(true);
  const [isMiracleChecked, setIsMiracleChecked] = useState(false);

  const rollCubeAudio = useRef(new Audio(rollCubeSound));
  const gradeUpAudio = useRef(new Audio(completeSound));
  rollCubeAudio.current.volume = 0.5;
  gradeUpAudio.current.volume = 0.3;

  const remainGradeUpRatio = (() => {
    if (currentGuarantee === 0) return 0;
    return currentAttempt / currentGuarantee;
  })();

  const cubeSimulator = useMemo(
    () =>
      new CubeSimulator({
        itemGrade: itemPotentialGrade ?? "레어",
        itemLevel: itemLevel ?? 0,
        itemType: itemType ?? "무기",
        itemOptions: currentPotentialOptions ?? [],
      }),
    [itemPotentialGrade, itemLevel, itemType, currentPotentialOptions]
  );

  const playRollCubeAudio = useCallback(() => {
    if (isSoundChecked) {
      rollCubeAudio.current.pause();
      rollCubeAudio.current.currentTime = 0;
      rollCubeAudio.current.play();
    }
  }, [isSoundChecked]);

  const playGradeUpAudio = useCallback(() => {
    if (isSoundChecked) {
      gradeUpAudio.current.play();
    }
  }, [isSoundChecked]);

  const handleRollCubeClick = useThrottle(() => {
    // simulator 동작
    cubeSimulator.rollCube();

    playRollCubeAudio();

    const { prevOptions, currentOptions, prevGrade, currentGrade, currentAttempt, currentGuarantee } = cubeSimulator.getItemState();

    setPrevOptions(prevOptions);
    setNewOptions(currentOptions);

    setPrevGrade(prevGrade);
    setNewGrade(currentGrade);

    setCurrentAttempt(currentAttempt);
    setCurrentGuarantee(currentGuarantee);

    if (prevGrade !== currentGrade) {
      playGradeUpAudio();
    }
  }, 500);

  useEffect(() => {
    setFadeIn(true);

    const timer = setTimeout(() => {
      setFadeIn(false);
    }, 500);

    return () => {
      setFadeIn(false);
      clearTimeout(timer);
    };
  }, [newOptions]);

  useEffect(() => {
    if (!newGrade) return;
    if (prevGrade === newGrade) return;

    setGlow(true);
    setTimeout(() => {
      setGlow(false);
    }, 1000);
  }, [prevGrade, newGrade]);

  useEffect(() => {
    if (!currentPotentialOptions) return;

    setPrevGrade(itemPotentialGrade);
    setPrevOptions(currentPotentialOptions);
  }, [itemPotentialGrade, currentPotentialOptions]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const inputKey = e.key;
      if (inputKey === "d") {
        handleRollCubeClick();
      }
    };

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [handleRollCubeClick]);

  useEffect(() => {
    cubeSimulator.setMiracleTime(isMiracleChecked);
  }, [cubeSimulator, isMiracleChecked]);

  if (!targetItem) return null;

  return (
    <>
      <div
        style={{ zIndex: 1002 }}
        className={`fixed top-[30%] left-[50%] text-white flex rounded-lg
             bg-black/80 border ${isMiracleChecked ? "border-lime-300/60" : "border-white/30"} p-2 align-center 
             justify-center w-[312px] ${glow ? "cube-glow" : ""}`}
      >
        <div className="flex p-1 flex-col items-center gap-2">
          {isMiracleChecked ? (
            <p className="text-sm font-bold text-lime-400">✨✨ 지금은 미라클 타임!! ✨✨</p>
          ) : (
            <p className="text-sm font-bold">아이템의 잠재능력을 재설정합니다.</p>
          )}
          <div className="flex flex-col p-1 rounded-lg bg-gray-300 gap-2">
            <div className="relative flex flex-col gap-2 items-center justify-center w-[280px] h-[124px] rounded-md bg-slate-700">
              <Image className="rounded-md" src={potentialImg} alt="potential-bg" layout="fill" objectFit="cover" objectPosition="center" />
              {itemIcon && (
                <div style={{ zIndex: 1000 }} className="mt-7 mb-5">
                  <Image
                    style={{ imageRendering: "pixelated" }}
                    src={itemIcon}
                    alt={itemName || "cube-target"}
                    unoptimized
                    width={40}
                    height={40}
                  />
                </div>
              )}
              <div className="flex border border-slate-800 bg-slate-800 w-[260px] relative h-3.5 rounded-sm">
                <p
                  className="absolute mx-auto text-xs font-extralight text-white"
                  style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                >{`${currentAttempt} / ${currentGuarantee}`}</p>
                <div
                  style={{ width: `${remainGradeUpRatio * 100}%`, transition: "width 0.5s ease" }}
                  className="flex bg-gradient-to-r from-sky-400 to-blue-600 h-3 rounded-sm"
                />
              </div>
            </div>
            <div className="flex flex-col w-[280px] rounded-md bg-sky-500">
              <p className="text-sm px-1 pt-1 pb-0.5 font-bold [text-shadow:_1px_2px_4px_rgb(0_0_0/_0.4)]">BEFORE</p>
              <div className="flex flex-col bg-slate-900 m-1 p-1 text-sm rounded-md min-h-[88px]">
                <p className="flex justify-center text-yellow-300 font-light">{prevGrade}</p>
                {prevOptions?.map((option, idx) => (
                  <p key={idx} className={`font-medium text-sm ${fadeIn ? "fade-in" : ""}`}>
                    {option}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex flex-col w-[280px] rounded-md bg-sky-500">
              <p className="text-sm px-1 pt-1 pb-0.5 font-bold [text-shadow:_1px_2px_4px_rgb(0_0_0/_0.4)]">AFTER</p>
              <div className="flex flex-col bg-slate-900 m-1 p-1 text-sm rounded-md min-h-[88px]">
                <p className="flex justify-center text-yellow-300 font-light">{newGrade}</p>
                {newOptions?.map((option, idx) => (
                  <p key={idx} className={`font-medium text-sm ${fadeIn ? "fade-in" : ""}`}>
                    {option}
                  </p>
                ))}
              </div>
            </div>
            <button
              onClick={handleRollCubeClick}
              className="flex justify-center border-2 border-white/50 bg-gradient-to-r from-lime-300 to-lime-400 hover:from-lime-400 hover:to-lime-500 text-sm font-bold text-black rounded-md p-1"
            >
              <p className="flex">한 번 더 재설정하기(혹은 [D]키 입력)</p>
            </button>
            <CheckBox label={"큐브 사운드 재생"} checked={isSoundChecked} onChange={setIsSoundChecked} />
            <CheckBox label={"미라클 타임"} checked={isMiracleChecked} onChange={setIsMiracleChecked} />
          </div>
        </div>
      </div>
      <div
        style={{ zIndex: 1001 }}
        onClick={resetCube}
        className="fixed z-50 top-0 left-0 w-full h-full flex justify-center items-center opacity-50 bg-black"
      />
    </>
  );
};
