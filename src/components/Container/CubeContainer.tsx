import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useShallow } from "zustand/react/shallow";
import { useThrottle } from "@/hooks/useThrottle";
import { useCubeStore } from "@/stores/cube";
import { CubeSimulator } from "@/utils/CubeSimulator";
import potentialImg from "@/images/potentialBg.png";
import { useCubeSimulation } from "@/hooks/useCubeSimulation";
import { isFullyContainedInArray } from "@/utils/arrayUtils";
import { NOT_SELECTED, POTENTIAL_CUBE, ADDITIONAL_POTENTIAL_CUBE } from "@/consts/Cube";
import { usePotentialInfo } from "@/hooks/usePotentialInfo";
import { Divider } from "../Equip/Divider";
import { CubeDisplay } from "../Cube/CubeDisplay";
import { SettingContainer } from "../Cube/SettingContainer";
import { CubeSetting } from "../Cube/CubeSetting";
import { AutoResetMode } from "../Cube/AutoResetMode";
import { Record } from "../Cube/Record";
import { GradeUpInfo } from "../Cube/GradeUpInfo";

const MAX_SPEED_STEP = 5;

export const CubeContainer = () => {
  const { targetItem, cubeType, resetCube } = useCubeStore(
    useShallow((state) => ({
      targetItem: state.targetItem,
      cubeType: state.cubeType,
      resetCube: state.resetCube,
    }))
  );

  const cubeTitle = cubeType === "potential" ? POTENTIAL_CUBE : ADDITIONAL_POTENTIAL_CUBE;

  const {
    itemLevel,
    itemType,
    itemIcon,
    itemName,
    itemPotentialGrade,
    additionalPotentialGrade,
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

  const [glow, setGlow] = useState(false);
  const [isMiracleChecked, setIsMiracleChecked] = useState(false);
  const [gradeUpInfos, setGradeUpInfos] = useState<string[]>([]);

  /** 스피드 모드 state */
  const { firstOptions, secondOptions, thirdOptions } = usePotentialInfo({ cubeType, itemType, itemLevel, grade: "레전드리" });
  const [firstSpeedOption, setFirstSpeedOption] = useState(firstOptions[0]);
  const [secondSpeedOption, setSecondSpeedOption] = useState(secondOptions[0]);
  const [thirdSpeedOption, setThirdSpeedOption] = useState(thirdOptions[0]);
  const [isSpeedMode, setSpeedMode] = useState(false);
  const [speedStep, setSpeedStep] = useState(1);
  const speedTimer = useRef<NodeJS.Timeout>();
  const speedLabel = speedStep === MAX_SPEED_STEP ? "속도 - 5단계(MAX)" : `속도 - ${speedStep}단계`;
  const speedOptions = useMemo(
    () => [firstSpeedOption, secondSpeedOption, thirdSpeedOption],
    [firstSpeedOption, secondSpeedOption, thirdSpeedOption]
  );
  const isAllNotSelected = speedOptions.every((item) => item === NOT_SELECTED);

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
    setPrevOptions(currentOptions);
  }, [cubeSimulator, setPrevOptions]);

  const handleClearRecords = useCallback(() => {
    setRecords([]);
  }, []);

  /** 스피드 옵션 */
  const handleUpSpeed = useCallback(() => {
    if (speedStep === MAX_SPEED_STEP) return;
    setSpeedStep((prev) => prev + 1);
  }, [speedStep]);

  const handleDownSpeed = useCallback(() => {
    if (speedStep === 1) return;
    setSpeedStep((prev) => prev - 1);
  }, [speedStep]);

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
  const initialGrade = cubeType === "potential" ? itemPotentialGrade : additionalPotentialGrade;
  const initialOptions = cubeType === "potential" ? currentPotentialOptions : currentAdditionalOptions;
  useEffect(() => {
    if (!initialGrade || !initialOptions) return;

    setPrevGrade(initialGrade);
    setPrevOptions(initialOptions);
  }, [initialGrade, initialOptions]);

  /** 등업될 때 UI 효과 */
  useEffect(() => {
    if (!prevGrade || !afterGrade) return;
    if (prevGrade === afterGrade) return;

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
  }, [handleRollCubeClick]);

  useEffect(() => {
    cubeSimulator.setMiracleTime(isMiracleChecked);
    const gradeUpInfos = cubeSimulator.getCurrentGradeUpInfo().map((item, idx) => {
      const gradeName = ["레어→에픽", "에픽→유니크", "유니크→레전드리"][idx];
      return `${gradeName}: ${(item.chance * 100).toFixed(4)}%`;
    });
    setGradeUpInfos(gradeUpInfos);
  }, [isMiracleChecked]);

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
            <p className="text-sm font-bold text-lime-400">{`✨ 지금은 미라클 타임!! (${cubeTitle})✨`}</p>
          ) : (
            <p className="text-sm font-bold">
              <span className="text-cyan-400">{cubeTitle}</span>을 재설정합니다.
            </p>
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
            <CubeDisplay label="BEFORE" cubeType={cubeType} grade={prevGrade} options={prevOptions} />
            <CubeDisplay
              label="AFTER"
              cubeType={cubeType}
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
        <SettingContainer>
          <CubeSetting
            isSoundEnabled={isSoundEnabled}
            setIsSoundEnabled={setIsSoundEnabled}
            isMiracleChecked={isMiracleChecked}
            setIsMiracleChecked={setIsMiracleChecked}
            isSpeedMode={isSpeedMode}
          />
          <Divider />
          <AutoResetMode
            speedLabel={speedLabel}
            isSpeedMode={isSpeedMode}
            firstOptions={firstOptions}
            secondOptions={secondOptions}
            thirdOptions={thirdOptions}
            speedStep={speedStep}
            isAllNotSelected={isAllNotSelected}
            setSpeedMode={setSpeedMode}
            setFirstSpeedOption={setFirstSpeedOption}
            setSecondSpeedOption={setSecondSpeedOption}
            setThirdSpeedOption={setThirdSpeedOption}
            handleUpSpeed={handleUpSpeed}
            handleDownSpeed={handleDownSpeed}
          />
          <Divider />
          <Record records={records} clearRecords={handleClearRecords} />
          <Divider />
          <GradeUpInfo gradeUpInfos={gradeUpInfos} cubeTitle={cubeTitle} />
        </SettingContainer>
      </div>
      <div
        style={{ zIndex: 1001 }}
        onClick={resetCube}
        className="fixed z-50 top-0 left-0 w-full h-full flex justify-center items-center opacity-50 bg-black"
      />
    </>
  );
};
