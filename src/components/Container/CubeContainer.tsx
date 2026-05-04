import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useShallow } from "zustand/react/shallow";
import { useThrottle } from "@/hooks/useThrottle";
import { useCubeStore } from "@/stores/cube";
import { CubeSimulator } from "@/utils/CubeSimulator";
import { useCubeSimulation } from "@/hooks/useCubeSimulation";
import { matchesAutoResetTarget } from "@/utils/cubeOptionMatcher";
import { NOT_SELECTED, POTENTIAL_CUBE, ADDITIONAL_POTENTIAL_CUBE } from "@/consts/Cube";
import { usePotentialInfo } from "@/hooks/usePotentialInfo";
import { Divider } from "../Equip/Divider";
import { CubeDisplay } from "../Cube/CubeDisplay";
import { SettingContainer } from "../Cube/SettingContainer";
import { CubeSetting } from "../Cube/CubeSetting";
import { AutoResetMode } from "../Cube/AutoResetMode";
import { Record } from "../Cube/Record";
import { GradeUpInfo } from "../Cube/GradeUpInfo";
import { formatKoreanNumber } from "@/utils/formatKoreanNum";

const MAX_SPEED_STEP = 5;

const CubeContainer = () => {
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
    mesoCost,
    setIsSoundEnabled,
    rollCube,
    setPrevOptions,
    setPrevGrade,
    resetCurrentAttempt,
    setMesoCost,
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

  const showAfterButton = !!afterGrade && prevGrade === afterGrade;

  const mesoCostLabel = useMemo(() => {
    const formattedMesoCost = formatKoreanNumber(mesoCost);
    return `🪙 ${formattedMesoCost} 메소 소모`;
  }, [mesoCost]);

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

    const { currentOptions: newOptions, currentAttempt } = cubeSimulator.getItemState();

    if (isSpeedMode) {
      const filteredOptions = [...speedOptions].filter((item) => item !== NOT_SELECTED);
      if (!filteredOptions.length) return;

      // 같은 옵션 종류에 더 좋은 수치가 나온 경우도 매칭으로 인정 (예: 사용자 STR +10% vs 결과 STR +13%).
      const isFullyMatched = matchesAutoResetTarget(filteredOptions, newOptions);

      if (isFullyMatched) {
        setSpeedMode(false);
        setRecords((prev) => [...prev, `${newOptions.join("/")} - ${currentAttempt}번만에 획득`]);
        resetCurrentAttempt();
      }
    }
  }, [isSpeedMode, speedOptions, rollCube, resetCurrentAttempt]);

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
      if (e.code === "Space") {
        e.preventDefault();
        handleRollCubeClick();
      } else if (e.key === "Escape") resetCube();
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
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
    // 스피드 모드 시작될 때 시도횟수 및 메소 소모량 초기화
    if (isSpeedMode && speedOptions) {
      resetCurrentAttempt();
      setMesoCost(0);
    }
  }, [isSpeedMode, speedOptions]);

  if (!targetItem) return null;

  return (
    <>
      <div
        style={{ zIndex: 1002 }}
        className="cube_container flex fixed top-[20%] left-[36%]
      max-[600px]:top-[-90px] max-[600px]:left-0 max-[600px]:w-full
      "
      >
        <div
          className={`flex p-1 flex-col items-center gap-2 text-white rounded-lg
             bg-[#293541]/80 border ${isMiracleChecked ? "border-lime-300/70" : "border-white/20"} p-2 align-center 
             justify-center w-[360px] ${glow ? "cube-glow" : ""}`}
        >
          <div className="flex flex-row gap-1 w-full justify-between">
            <span className="flex items-center gap-1 font-bold text-[#d6fc48]">
              {cubeTitle}
              {isMiracleChecked && <span className="text-[#d6fc48] text-xs">{` | 미라클 타임`}</span>}
            </span>
            <button
              onClick={resetCube}
              className="flex text-xs px-2 justify-center items-center
               bg-slate-800 hover:bg-slate-900 rounded-md font-bold"
            >
              닫기
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <div
              className="relative flex flex-col gap-1.5 items-center justify-center w-[340px] h-[180px] rounded-md
             bg-[linear-gradient(to_bottom,rgba(152,192,202,0.25)_6%,rgba(65,81,85,0.5)_20%,rgba(65,81,85,0.4)_100%)] p-2.5 border border-white/20"
            >
              <div className="relative flex items-center justify-center border border-white/20 bg-gradient-to-b from-[#223a49] to-[#43839c] rounded-md p-1 w-[120px] h-[120px]">
                <div className="flex w-[100px] h-[100px] items-center justify-center border-dashed border-white border-2 rounded-md">
                  {itemIcon && (
                    <div style={{ zIndex: 1000 }}>
                      <Image
                        style={{ imageRendering: "pixelated" }}
                        src={itemIcon}
                        className="m-3.5"
                        alt={itemName || "cube-target"}
                        unoptimized
                        width={64}
                        height={64}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-0.5 items-center justify-between w-full">
                <div className="flex border border-slate-800 bg-black/50 w-[276px] relative h-2.5 rounded-lg">
                  <div
                    style={{ width: `${remainGradeUpRatio * 100}%`, transition: "width 0.5s ease" }}
                    className="flex bg-gradient-to-r from-sky-500 to-sky-300 h-2 rounded-lg"
                  />
                </div>
                <p className="flex text-[10px] font-extralight text-white">{`${currentAttempt} / ${currentGuarantee}`}</p>
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
            <div className="text-xs flex items-center bg-slate-900/50 rounded-md p-1 text-white/90">{mesoCostLabel}</div>
            <button
              disabled={isSpeedMode}
              onClick={handleRollCubeClick}
              className="flex justify-center border border-white/10
               disabled:gray-200 disabled:text-gray-400
               enabled:bg-gradient-to-t from-slate-900/50 to-[#386e7e]/60 hover:from-slate-900/70 hover:to-[#386e7e]/70
               text-sm font-bold text-white rounded-md p-2"
            >
              <p className="flex">재설정하기(혹은 Space 키)</p>
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

export default CubeContainer;
