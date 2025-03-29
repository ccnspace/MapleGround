import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useThrottle } from "@/hooks/useThrottle";
import { useCubeStore } from "@/stores/cube";
import { CubeSimulator, CubeType, getAdditionalOptionPool, getItemOptionPool } from "@/utils/CubeSimulator";
import Image from "next/image";
import CheckBox from "../CheckBox";
import potentialImg from "@/images/potentialBg.png";
import { Divider } from "../Equip/Divider";
import { SelectBox } from "../SelectBox";
import { convertItemLevel } from "@/utils/convertItemLevel";
import { useShallow } from "zustand/react/shallow";
import { useCubeSimulation } from "@/hooks/useCubeSimulation";
import { CubeDisplay } from "../Cube/CubeDisplay";
import { isFullyContainedInArray } from "@/utils/arrayUtils";

const MAX_SPEED_STEP = 5;
const NOT_SELECTED = "선택 안 함";

const getItemOptionPoolByType = (type: CubeType, itemType: string, itemLevel: number | undefined) => {
  const convertedItemLevel = convertItemLevel(itemLevel);
  if (type === "potential") return getItemOptionPool(itemType, "레전드리", convertedItemLevel);
  return getAdditionalOptionPool(itemType, "레전드리", convertedItemLevel);
};

export const CubeContainer = () => {
  const { targetItem, cubeType, resetCube } = useCubeStore(
    useShallow((state) => ({
      targetItem: state.targetItem,
      cubeType: state.cubeType,
      resetCube: state.resetCube,
    }))
  );

  const {
    itemLevel,
    itemType,
    itemIcon,
    itemName,
    itemPotentialGrade = "레어",
    additionalPotentialGrade = "레어",
    currentPotentialOptions = [],
    currentAdditionalOptions = [],
  } = targetItem || {};

  const cubeSimulator = useMemo(
    () =>
      new CubeSimulator({
        initItemGrade: itemPotentialGrade ?? "레어",
        initItemOptions: currentPotentialOptions,
        initAdditionalGrade: additionalPotentialGrade ?? "레어",
        initAdditionalOptions: currentAdditionalOptions,
        itemLevel: itemLevel ?? 0,
        itemType: itemType ?? "무기",
        cubeType,
      }),
    [itemPotentialGrade, itemLevel, additionalPotentialGrade, currentAdditionalOptions, cubeType, itemType, currentPotentialOptions]
  );

  const {
    prevOptions,
    newOptions,
    prevGrade,
    afterGrade,
    currentAttempt,
    currentGuarantee,
    isSoundEnabled,
    prevAttempt,
    setIsSoundEnabled,
    rollCube,
    setPrevOptions,
    setPrevGrade,
    resetCurrentAttempt,
  } = useCubeSimulation(cubeSimulator);

  const { firstLine, secondLine, thirdLine } = useMemo(() => {
    if (!cubeType || !itemType) return { firstLine: [], secondLine: [], thirdLine: [] };
    return getItemOptionPoolByType(cubeType, itemType, itemLevel);
  }, [cubeType, itemType, itemLevel]);

  const firstOptions = useMemo(() => [NOT_SELECTED, ...firstLine.map((option) => option.name)], [firstLine]);
  const secondOptions = useMemo(() => [NOT_SELECTED, ...secondLine.map((option) => option.name)], [secondLine]);
  const thirdOptions = useMemo(() => [NOT_SELECTED, ...thirdLine.map((option) => option.name)], [thirdLine]);

  const [glow, setGlow] = useState(false);
  const [isMiracleChecked, setIsMiracleChecked] = useState(false);
  const [gradeUpInfos, setGradeUpInfos] = useState<string[]>([]);

  const cubeTitle = cubeType === "potential" ? "잠재능력" : "에디셔널 잠재능력";

  /** 스피드 모드 state */
  const [firstSpeedOption, setFirstSpeedOption] = useState(firstOptions[0]);
  const [secondSpeedOption, setSecondSpeedOption] = useState(secondOptions[0]);
  const [thirdSpeedOption, setThirdSpeedOption] = useState(thirdOptions[0]);
  const [isSpeedMode, setSpeedMode] = useState(false);
  const speedTimer = useRef<NodeJS.Timeout>();
  const [speedStep, setSpeedStep] = useState(1);
  const speedLabel = speedStep === MAX_SPEED_STEP ? "속도 - 5단계(MAX)" : `속도 - ${speedStep}단계`;
  const speedOptions = useMemo(
    () => [firstSpeedOption, secondSpeedOption, thirdSpeedOption],
    [firstSpeedOption, secondSpeedOption, thirdSpeedOption]
  );

  /** 기록실 */
  const [records, setRecords] = useState<string[]>([]);

  const remainGradeUpRatio = useMemo(() => {
    if (currentGuarantee === 0) return 0;
    return currentAttempt / currentGuarantee;
  }, [currentAttempt, currentGuarantee]);

  const showAfterButton = prevGrade === afterGrade;

  const handleRollCubeClick = useThrottle(rollCube, 500);

  const handleAfterButtonClick = useCallback(() => {
    const { currentOptions } = cubeSimulator.getItemState();
    cubeSimulator.setPrevOptions(currentOptions);
    setPrevOptions(currentOptions);
  }, [cubeSimulator, setPrevOptions]);

  const reRollPotential = useCallback(() => {
    rollCube();

    const { currentOptions: newOptions } = cubeSimulator.getItemState();

    if (isSpeedMode) {
      const filteredOptions = [...speedOptions].filter((item) => item !== NOT_SELECTED);
      if (!filteredOptions.length) return;

      const isFullyMatched = isFullyContainedInArray(filteredOptions, newOptions);

      if (isFullyMatched && prevAttempt.current !== currentAttempt) {
        setSpeedMode(false);
        setRecords((prev) => [...prev, `${newOptions.join("/")} - ${currentAttempt}번만에 획득`]);
        resetCurrentAttempt();
      }
    }
  }, [isSpeedMode, speedOptions, currentAttempt, rollCube, resetCurrentAttempt]);

  /** 초기 데이터 init */
  useEffect(() => {
    const grade = cubeType === "potential" ? itemPotentialGrade : additionalPotentialGrade;
    const options = cubeType === "potential" ? currentPotentialOptions : currentAdditionalOptions;

    if (!grade || !options) return;

    setPrevGrade(grade);
    setPrevOptions(options);
  }, [cubeType, itemPotentialGrade, additionalPotentialGrade, currentPotentialOptions, currentAdditionalOptions]);

  /** 등업될 때 UI 효과 */
  useEffect(() => {
    if (!afterGrade || prevGrade === afterGrade) return;

    const { failedAttempts } = cubeSimulator.getItemState();
    const gradeIndex = ["레어", "에픽", "유니크"].findIndex((item) => item === prevGrade);
    const attempts = failedAttempts[gradeIndex] + 1;

    setRecords((prev) => [...prev, `${prevGrade}->${afterGrade} ${attempts}번만에 등급 업!`]);
    setGlow(true);
    setTimeout(() => setGlow(false), 1000);
  }, [prevGrade, afterGrade]);

  /** 키 이벤트 핸들러 */
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "d") handleRollCubeClick();
      else if (e.key === "Escape") resetCube();
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [handleRollCubeClick, resetCube]);

  useEffect(() => {
    cubeSimulator.setMiracleTime(isMiracleChecked);
    const gradeUpInfos = cubeSimulator.getCurrentGradeUpInfo().map((item, idx) => {
      const gradeName = ["레어→에픽", "에픽→유니크", "유니크→레전드리"][idx];
      return `${gradeName}: ${(item.chance * 100).toFixed(4)}%`;
    });
    setGradeUpInfos(gradeUpInfos);
  }, [cubeSimulator, isMiracleChecked]);

  /** 스피드 옵션 */
  const handleUpSpeed = () => {
    if (speedStep === MAX_SPEED_STEP) return;
    setSpeedStep((prev) => prev + 1);
  };

  const handleDownSpeed = () => {
    if (speedStep === 1) return;
    setSpeedStep((prev) => prev - 1);
  };

  const isAllNotSelected = speedOptions.every((item) => item === NOT_SELECTED);

  useEffect(() => {
    if (isSpeedMode) {
      setIsSoundEnabled(false);
      const delay = speedStep < 5 ? Math.floor(500 / (speedStep * 5)) : 0;
      speedTimer.current = setInterval(() => {
        reRollPotential();
      }, delay);
    } else {
      clearTimeout(speedTimer.current);
    }
    return () => clearTimeout(speedTimer.current);
  }, [isSpeedMode, speedStep, reRollPotential]);

  useEffect(() => {
    // 스피드 모드 시작될 때 시도횟수 초기화
    if (isSpeedMode && speedOptions) {
      resetCurrentAttempt();
    }
  }, [isSpeedMode, speedOptions]);

  if (!targetItem) return null;

  return (
    <>
      <div style={{ zIndex: 1002 }} className="flex fixed top-[30%] left-[40%]">
        <div
          className={`flex p-1 flex-col items-center gap-2 text-white rounded-lg
             bg-black/70 border ${isMiracleChecked ? "border-lime-300/70" : "border-white/30"} p-2 align-center 
             justify-center w-[312px] ${glow ? "cube-glow" : ""}`}
        >
          {isMiracleChecked ? (
            <p className="text-sm font-bold text-lime-400">✨✨ 지금은 미라클 타임!! ✨✨</p>
          ) : (
            <p className="text-sm font-bold">{`아이템의 ${cubeTitle}을 재설정합니다.`}</p>
          )}
          <div className="flex flex-col p-1 rounded-lg bg-gradient-to-b from-gray-200 to-gray-300 gap-2">
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

            <CubeDisplay label="BEFORE" grade={prevGrade} options={prevOptions} />
            <CubeDisplay
              label="AFTER"
              grade={afterGrade}
              options={newOptions}
              showSelectButton={showAfterButton}
              onSelect={handleAfterButtonClick}
            />
            <button
              disabled={isSpeedMode}
              onClick={handleRollCubeClick}
              className="flex justify-center border-2 border-white/50
               disabled:gray-200 disabled:text-gray-400
               enabled:bg-gradient-to-r from-lime-300 to-lime-400 hover:from-lime-400 hover:to-lime-500
               text-sm font-bold text-black rounded-md p-1"
            >
              <p className="flex">한 번 더 재설정하기(혹은 [D]키 입력)</p>
            </button>
          </div>
        </div>
        {/* 큐브 유틸리티 영역 */}
        <div
          className={`flex p-2 flex-col gap-1 text-white rounded-lg
             bg-black/70 border border-white/30 w-[300px]`}
        >
          <div className="flex p-1 flex-col gap-1">
            <p className="text-sm font-bold mb-1 bg-white/20 p-1 rounded-md">⚙️ 기본 설정</p>
            <div className="flex gap-2 justify-center ">
              <CheckBox label={"큐브 사운드 재생"} checked={isSoundEnabled} onChange={setIsSoundEnabled} disabled={isSpeedMode} />
              <CheckBox label={"미라클 타임"} checked={isMiracleChecked} onChange={setIsMiracleChecked} disabled={isSpeedMode} />
            </div>
            <Divider />
            <div className="flex items-center justify-center flex-col gap-0.5 text-black dark:text-white">
              <p
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
              </p>
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
                hover:bg-gradient-to-tr hover:from-sky-800 hover:to-blue-900
                "
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
                enabled:hover:bg-gradient-to-tr hover:from-yellow-600 hover:to-yellow-700
                "
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
                enabled:hover:bg-gradient-to-tr hover:from-yellow-600 hover:to-yellow-700
                "
                  onClick={handleDownSpeed}
                >
                  <p>{"▼"}</p>
                </button>
              </div>
            </div>
            <Divider />
            <div className="flex flex-col">
              <p
                className="flex flex-row justify-between items-center text-sm w-full font-bold mb-1
               bg-white/20 p-1 rounded-md text-white"
              >
                ⏱️ 기록실
                <button
                  onClick={() => setRecords([])}
                  className="flex justify-center text-xs px-1.5 pt-0.5 pb-0.5
                  bg-slate-700 hover:bg-slate-900 rounded-md p-0.5 font-bold"
                >
                  ↻초기화
                </button>
              </p>
              <div className="flex break-words overflow-y-scroll h-[72px] flex-col gap-1 bg-black/60 rounded-md p-2 text-xs text-white">
                {records.map((item, idx) => (
                  <p key={idx}>·{item}</p>
                ))}
              </div>
            </div>
            <Divider />
            <div className="flex justify-center">
              <div className="flex flex-col min-w-[214px] gap-0.5 text-xs bg-gradient-to-br from-slate-500 to-slate-600 rounded-md p-1.5">
                <p className="font-bold">{`🎲 ${cubeTitle} 등급 상승 확률`}</p>
                {gradeUpInfos.map((item, idx) => (
                  <p key={idx} className="font-light">
                    · {item}
                  </p>
                ))}
              </div>
            </div>
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
