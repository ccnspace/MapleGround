import { useCubeStore } from "@/stores/cube";
import { ItemPotentialGrade } from "@/types/Equipment";
import { CubeSimulator } from "@/utils/CubeSimulator";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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

  const remainGradeUpRatio = (() => {
    if (currentGuarantee === 0) return 0;
    return currentAttempt / currentGuarantee;
  })();

  useEffect(() => {
    if (!currentPotentialOptions) return;

    setPrevGrade(itemPotentialGrade);
    setPrevOptions(currentPotentialOptions);
  }, [currentPotentialOptions]);

  const cubeSimulator = useRef(
    new CubeSimulator({
      itemGrade: itemPotentialGrade ?? "레어",
      itemLevel: itemLevel ?? 0,
      itemType: itemType ?? "무기",
      itemOptions: currentPotentialOptions ?? [],
    })
  );

  const handleRollCubeClick = () => {
    cubeSimulator.current.rollCube();
    const { prevOptions, currentOptions, prevGrade, currentGrade, currentAttempt, currentGuarantee } = cubeSimulator.current.getItemState();

    setPrevOptions(prevOptions);
    setNewOptions(currentOptions);
    setPrevGrade(prevGrade);
    setNewGrade(currentGrade);
    setCurrentAttempt(currentAttempt);
    setCurrentGuarantee(currentGuarantee);
  };

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

  if (!targetItem) return null;

  return (
    <>
      <div
        style={{ zIndex: 1002 }}
        className={`fixed top-[30%] left-[50%] text-white flex rounded-lg
             bg-black/80 border border-white/30 p-2 align-center 
             justify-center w-[312px] ${glow ? "cube-glow" : ""}`}
      >
        <div className="flex p-1 flex-col items-center gap-2">
          <p className="text-sm font-bold">아이템의 잠재능력을 재설정합니다.</p>
          <div className="flex flex-col p-1 rounded-lg bg-gray-300 gap-2">
            <div className="flex flex-col gap-2 items-center justify-center w-[280px] h-[90px] rounded-md bg-slate-700">
              {itemIcon && (
                <div>
                  <Image
                    style={{ imageRendering: "pixelated" }}
                    src={itemIcon}
                    alt={itemName || "cube-target"}
                    unoptimized
                    width={48}
                    height={48}
                  />
                </div>
              )}
              <div className="flex border border-sky-700/50 bg-slate-800 w-[260px] relative h-3.5 rounded-sm">
                <p
                  className="absolute mx-auto text-xs font-extralight text-white"
                  style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                >{`${currentAttempt} / ${currentGuarantee}`}</p>
                <div
                  style={{ width: `${remainGradeUpRatio * 100}%` }}
                  className="flex bg-gradient-to-r from-sky-500 to-blue-600 h-3.5 rounded-sm"
                />
              </div>
            </div>
            <div className="flex flex-col w-[280px] rounded-md bg-sky-500">
              <p className="text-sm p-1 font-bold [text-shadow:_1px_2px_4px_rgb(0_0_0/_0.4)]">BEFORE</p>
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
              <p className="text-sm p-1 font-bold [text-shadow:_1px_2px_4px_rgb(0_0_0/_0.4)]">AFTER</p>
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
              className="flex justify-center border border-lime-500 bg-lime-400 hover:bg-lime-500 text-sm font-bold text-black rounded-md p-1"
            >
              <p className="flex">한 번 더 재설정하기</p>
            </button>
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
