import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useStarforceStore } from "@/stores/starforce";
import CheckBox from "../CheckBox";
import Image from "next/image";
import { NormalContainer } from "@/components/Equip/normal/Container";
import { type StarforceResult, StarforceSimulator } from "@/utils/StarforceSimulator";
import { ItemEquipment } from "@/types/Equipment";
import { getStarforceUpgradeOptions, StarforceProbability } from "@/utils/starforceUtils";
import { StarforceDetail } from "@/components/Starforce/StarforceDetail";
import { StarforceResultLabel } from "@/components/Starforce/StarforceResultLabel";
import { formatKoreanNumber } from "@/utils/formatKoreanNum";
import { useThrottle } from "@/hooks/useThrottle";
import { SelectBox } from "../SelectBox";
import { StarforceRecords } from "../Starforce/StarforceRecords";
import { openModal } from "@/utils/openModal";
import { useModalStore } from "@/stores/modal";
import { RadioButtonGroup } from "../RadioButtonGroup";

const MVP_OPTIONS = ["실버(메소 3%↓)", "골드(메소 5%↓)", "레드(메소 10%↓)"];
const getMaxStarforce = (baseEquipmentLevel: number) => {
  if (baseEquipmentLevel <= 94) return 5;
  if (baseEquipmentLevel <= 107) return 8;
  if (baseEquipmentLevel <= 117) return 10;
  if (baseEquipmentLevel <= 127) return 15;
  if (baseEquipmentLevel <= 137) return 20;
  return 30;
};
const getAutoModeOptions = (baseEquipmentLevel: number) => {
  if (baseEquipmentLevel <= 94) return [3, 4, 5].map((force) => `${force}성`);
  if (baseEquipmentLevel <= 107) return [5, 6, 7, 8].map((force) => `${force}성`);
  if (baseEquipmentLevel <= 117) return [6, 7, 8, 9, 10].map((force) => `${force}성`);
  if (baseEquipmentLevel <= 127) return [10, 11, 12, 13, 14, 15].map((force) => `${force}성`);
  if (baseEquipmentLevel <= 137) return [15, 16, 17, 18, 19, 20].map((force) => `${force}성`);
  return [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((force) => `${force}성`);
};

export type StarforceRecord = {
  initialStarforce: number;
  targetStarforce: number;
  attempts: number;
  destroyCount: number;
  accumulatedCost: number;
};

const StarforceContainer = ({ targetItem }: { targetItem: ItemEquipment }) => {
  const simulator = useMemo(() => new StarforceSimulator({ item: targetItem }), [targetItem]);

  const resetStarforceTarget = useStarforceStore((state) => state.resetStarforceTarget);

  const [currentTarget, setCurrentTarget] = useState<ItemEquipment | null>(null);
  const [currentStarforce, setCurrentStarforce] = useState(0);
  const [prevStarforce, setPrevStarforce] = useState(0);
  const [currentCost, setCurrentCost] = useState(0);
  const [currentProbabilities, setCurrentProbabilities] = useState<StarforceProbability | null>(null);
  const [accumulatedCost, setAccumulatedCost] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [destroyCount, setDestroyCount] = useState(0);

  const formattedCurrentCost = useMemo(() => formatKoreanNumber(currentCost), [currentCost]);

  const isMaxStarforce = useMemo(() => {
    if (!currentTarget) return false;
    const { item_base_option } = currentTarget;
    return currentStarforce >= getMaxStarforce(item_base_option.base_equipment_level);
  }, [currentTarget, currentStarforce]);

  const autoModeOptions = useMemo(() => getAutoModeOptions(targetItem.item_base_option.base_equipment_level), [targetItem]);

  // 자동 모드
  const [isAutoModePlaying, setIsAutoModePlaying] = useState(false);
  const [isAutoModeChecked, setIsAutoModeChecked] = useState(false);
  const [autoModeOption, setAutoModeOption] = useState<string>(autoModeOptions[0].split("성")[0]);
  const hasAccomplished = useRef(false);
  const initialStarforce = useRef<number>(0);
  const [autoModeRestartOption, setAutoModeRestartOption] = useState<"stop" | "toZero" | "toOriginal">("stop");

  const handleAutoModeRestartChange = (value: string) => {
    setAutoModeRestartOption(value as "stop" | "toZero" | "toOriginal");
  };

  // 스타캐치
  const [isStarforceCatchChecked, setIsStarforceCatchChecked] = useState(false);
  // 샤이닝 스타포스
  const [isShiningStarforceChecked, setIsShiningStarforceChecked] = useState(false);
  // 파괴방지
  const [isDestroyProtectionChecked, setIsDestroyProtectionChecked] = useState(false);
  // 5-10-15성에서 강화 시도 100%
  const [isStarforceCatch100Checked, setIsStarforceCatch100Checked] = useState(false);
  // 썬데이
  const [isSundayChecked, setIsSundayChecked] = useState(false);
  // PC방 할인
  const [isPcDiscountChecked, setIsPcDiscountChecked] = useState(false);
  // MVP 할인
  const [isMvpDiscountChecked, setIsMvpDiscountChecked] = useState(false);
  const [mvpOption, setMvpOption] = useState(MVP_OPTIONS[0]);
  const [discountRate, setDiscountRate] = useState(0);
  // 스타포스 증가옵션
  const starforceUpgradeOptions = useMemo(() => {
    const { statUpgradeOptions, powerUpgradeOptions } = getStarforceUpgradeOptions({
      itemLevel: targetItem.item_base_option.base_equipment_level,
      itemSlot: targetItem.item_equipment_slot,
      starforce: currentStarforce,
    });

    const statResult = statUpgradeOptions !== 0 ? `STAT : +${statUpgradeOptions}` : "";
    const powerResult = powerUpgradeOptions !== 0 ? `공격력 : +${powerUpgradeOptions}` : "";
    const magicResult = powerUpgradeOptions !== 0 ? `마력 : +${powerUpgradeOptions}` : "";
    const results = [statResult, powerResult, magicResult].filter(Boolean).join("\n");

    return results;
  }, [targetItem, currentStarforce]);

  const [records, setRecords] = useState<StarforceRecord[]>([]);

  const starforceButtonLabel = useMemo(() => {
    if (isAutoModePlaying) {
      return "OFF";
    }
    return "강화(Space)";
  }, [isAutoModePlaying]);

  const handleSelect = (option: string) => {
    setAutoModeOption(option.split("성")[0]);
  };

  const updateStarforceState = useCallback(() => {
    const { item, cost, probabilities, prevStarforce } = simulator.getState();
    setCurrentStarforce(parseInt(item.starforce));
    setPrevStarforce(prevStarforce);
    setCurrentCost(cost);
    setCurrentProbabilities(probabilities);
  }, [simulator]);

  // 초기화
  useEffect(() => {
    const { item, cost, probabilities } = simulator.getState();
    setCurrentStarforce(parseInt(item.starforce));
    setCurrentCost(cost);
    setCurrentProbabilities(probabilities);
    setCurrentTarget(item);
  }, [simulator]);

  // 샤타포스 적용
  useEffect(() => {
    simulator.setShiningStarforce(isShiningStarforceChecked);
    updateStarforceState();
  }, [isShiningStarforceChecked, updateStarforceState]);

  // 스타캐치 적용
  useEffect(() => {
    simulator.applySuccessRateIncrease(isStarforceCatchChecked ? 0.05 : 0);
    updateStarforceState();
  }, [isStarforceCatchChecked, updateStarforceState]);

  // 파괴방지 (15~17성 단계에서 가능)
  useEffect(() => {
    simulator.setDestroyProtection(isDestroyProtectionChecked);
    updateStarforceState();
  }, [isDestroyProtectionChecked, updateStarforceState]);

  // 5-10-15성에서 강화 시도 100%
  useEffect(() => {
    simulator.setStarforceCatch100(isStarforceCatch100Checked);
    updateStarforceState();
  }, [isStarforceCatch100Checked, updateStarforceState]);

  // 할인 적용
  useEffect(() => {
    const sundayDiscount = isSundayChecked ? 0.3 : 0;
    const pcDiscount = isPcDiscountChecked ? 0.05 : 0;
    const mvpDiscount = (() => {
      if (isMvpDiscountChecked) {
        if (mvpOption === MVP_OPTIONS[0]) return 0.03;
        if (mvpOption === MVP_OPTIONS[1]) return 0.05;
        if (mvpOption === MVP_OPTIONS[2]) return 0.1;
      }
      return 0;
    })();

    const discountInfo = { sundayDiscount, pcDiscount, mvpDiscount };
    simulator.applyCostDiscount(discountInfo);
    updateStarforceState();

    const discountRatio = simulator.getState().discountRatio;
    setDiscountRate((1 - discountRatio) * 100);
  }, [isSundayChecked, isPcDiscountChecked, isMvpDiscountChecked, mvpOption, updateStarforceState]);

  const { item_name, item_icon } = targetItem ?? {};
  const [result, setResult] = useState<StarforceResult | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const showBadge = currentStarforce >= 22;
  const [optionFoldLabel, setOptionFoldLabel] = useState("🡹 시뮬레이터 옵션 접기");
  const [isOptionFolded, setIsOptionFolded] = useState(false);

  const handleOptionFold = () => {
    setIsOptionFolded((prev) => !prev);
    setOptionFoldLabel(isOptionFolded ? "🡹 시뮬레이터 옵션 접기" : "🡻 시뮬레이터 옵션 펼치기");
  };

  // const handleMouseOverOnImage = () => {
  //   setShowDetail(true);
  // };

  // const handleMouseLeaveOnImage = () => {
  //   setShowDetail(false);
  // };

  const resetDestroyCount = () => {
    setDestroyCount(0);
    simulator.resetDestroyCount();
  };

  const resetAttempts = () => {
    setAttempts(0);
    simulator.resetAttempts();
  };

  const resetAccumulatedCost = () => {
    setAccumulatedCost(0);
    simulator.resetAccumulatedCost();
  };

  const resetAllUserStarforceState = () => {
    resetDestroyCount();
    resetAttempts();
    resetAccumulatedCost();
  };

  const initializeStarforce = () => {
    const input = prompt("아이템에 설정할 스타포스 수치를 입력해주세요.");
    if (!input) return;

    const inputStarforce = parseInt(input);

    if (isNaN(inputStarforce)) {
      openModal({
        type: "confirm",
        message: `숫자를 입력해주세요.`,
      });
      return;
    }

    if (inputStarforce >= 30) {
      openModal({
        type: "confirm",
        message: `30성 이상은 설정할 수 없습니다.`,
      });
      return;
    }

    if (inputStarforce < 0) {
      openModal({
        type: "confirm",
        message: `0 이상의 숫자를 입력해주세요.`,
      });
      return;
    }

    simulator.setStarforce(inputStarforce);
    const { item, cost, probabilities, discountRatio } = simulator.getState();
    setCurrentStarforce(parseInt(item.starforce));
    setCurrentCost(cost);
    setCurrentProbabilities(probabilities);
    setDiscountRate((1 - discountRatio) * 100);
    resetAllUserStarforceState();
  };

  const resetStarforceToZero = () => {
    simulator.setStarforce(0);
    const { item, cost, probabilities, discountRatio } = simulator.getState();
    setCurrentStarforce(parseInt(item.starforce));
    setCurrentCost(cost);
    setCurrentProbabilities(probabilities);
    setDiscountRate((1 - discountRatio) * 100);
    resetAllUserStarforceState();
  };

  const doStarforce = useCallback(() => {
    if (isAutoModePlaying && hasAccomplished.current) return;

    simulator.simulate();
    const { item, cost, probabilities, result, accumulatedCost, attempts, destroyCount, discountRatio, prevStarforce } =
      simulator.getState();

    setPrevStarforce(prevStarforce);
    setCurrentStarforce(parseInt(item.starforce));
    setCurrentCost(cost);
    setCurrentProbabilities(probabilities);
    setResult(result);
    setAccumulatedCost(accumulatedCost);
    setAttempts(attempts);
    setDestroyCount(destroyCount);
    setDiscountRate((1 - discountRatio) * 100);

    if (timerRef.current) {
      clearTimeout(timerRef.current);

      if (!isAutoModePlaying) {
        setResult(null);
      }
      setTimeout(() => {
        setResult(result); // 짧은 지연 후 새로운 결과로 설정
      }, 0);
    }
    const newTimer = setTimeout(() => setResult(null), 1000);
    timerRef.current = newTimer;

    if (isAutoModePlaying && autoModeOption) {
      const targetStarforce = autoModeOption;
      if (parseInt(item.starforce) >= parseInt(targetStarforce)) {
        setIsAutoModePlaying(false);
        setRecords((prev) => [
          ...prev,
          {
            initialStarforce: initialStarforce.current,
            targetStarforce: parseInt(targetStarforce),
            attempts,
            destroyCount,
            accumulatedCost,
          },
        ]);
        hasAccomplished.current = true;
        resetAllUserStarforceState();
      }
    }
  }, [simulator, isAutoModePlaying, autoModeOption, isMaxStarforce]);

  const handleClickStarforceButton = () => {
    if (isAutoModePlaying) {
      setIsAutoModePlaying(false);
      return;
    }

    if (isMaxStarforce) {
      openModal({
        type: "confirm",
        message: `이미 최대 스타포스 수치입니다.`,
      });
      return;
    }

    if (isAutoModeChecked) {
      if (currentStarforce >= parseInt(autoModeOption)) {
        openModal({
          type: "alert",
          message: `현재 스타포스 수치가 목표치 이상입니다.`,
        });
        return;
      }
      setIsAutoModePlaying(true);
      return;
    }

    doStarforce();
  };

  const throttleDoStarforce = useThrottle(handleClickStarforceButton, 200);

  /** 스타포스 강화 키 이벤트 핸들러 */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAutoModePlaying) return;
      if (e.code === "Space") {
        e.preventDefault();
        throttleDoStarforce();
      } else if (e.key === "Escape") {
        if (useModalStore.getState().modal) return;
        resetStarforceTarget();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [throttleDoStarforce, isAutoModePlaying]);

  // 자동 모드
  const autoModeTimer = useRef<NodeJS.Timeout>();
  // 자동모드 재시작
  const restartTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isAutoModePlaying) {
      const delay = 0;
      initialStarforce.current = parseInt(simulator.getState().item.starforce);
      autoModeTimer.current = setInterval(() => {
        doStarforce();
      }, delay);
    } else {
      clearTimeout(autoModeTimer.current);
    }
    return () => clearTimeout(autoModeTimer.current);
  }, [isAutoModePlaying, doStarforce]);

  useEffect(() => {
    if (autoModeRestartOption === "stop" || !isAutoModeChecked) {
      clearTimeout(restartTimer.current);
    } else {
      if (!isAutoModePlaying && hasAccomplished.current) {
        restartTimer.current = setTimeout(() => {
          // console.log("targetItem : ", targetItem.starforce);
          const targetStarforce = autoModeRestartOption === "toZero" ? 0 : parseInt(targetItem.starforce);

          // console.log("targetStarforce", targetStarforce, "autoModeOption", autoModeOption);

          if (targetStarforce >= parseInt(autoModeOption)) {
            openModal({
              type: "alert",
              message: `기존의 스타포스 수치보다 목표치를 높게 설정해 주세요.\n기존 스타포스 수치: ${targetItem.starforce}성\n목표 스타포스 수치: ${autoModeOption}성`,
            });
          } else {
            simulator.setStarforce(targetStarforce);

            const { item } = simulator.getState();
            setCurrentStarforce(parseInt(item.starforce));
            setPrevStarforce(parseInt(item.starforce));
            setIsAutoModePlaying(true);
          }
        }, 600);
      }
    }
    hasAccomplished.current = false;
    return () => clearTimeout(restartTimer.current);
  }, [autoModeRestartOption, currentStarforce, autoModeOption, targetItem.starforce, isAutoModePlaying, isAutoModeChecked]);

  useEffect(() => {
    // 자동 모드 옵션이 변경되면 유저의 모든 스타포스 상태를 초기화
    if (autoModeOption) {
      resetAllUserStarforceState();
    }
  }, [autoModeOption]);

  if (!targetItem) return null;

  return (
    <>
      <div
        style={{ zIndex: 1002 }}
        className="starforce_container max-[600px]:scale-[0.75] flex fixed top-[5%] left-[35%]
      max-[600px]:top-[-120px] max-[600px]:left-0 max-[600px]:w-full"
      >
        <div
          className={`flex flex-col items-center gap-1 rounded-lg
             bg-[#293541]/80 p-2 border border-white/20 align-center 
             w-[480px]`}
        >
          <div className="flex flex-row gap-1 w-full justify-between">
            <span className="flex items-center gap-1 font-bold text-[#d6fc48]">STARFORCE</span>
            <button
              onClick={resetStarforceTarget}
              className="flex text-xs px-2 justify-center items-center
               bg-slate-800 hover:bg-slate-900 rounded-md font-bold text-white"
            >
              닫기
            </button>
          </div>
          <div className="relative flex flex-col p-0.5 w-full rounded-lg gap-1">
            <div className="flex flex-col p-1 w-full rounded-lg bg-[#293541]/80 gap-1">
              <div className="flex flex-col gap-2  m-1 ">
                <div
                  className="relative flex flex-col gap-2 items-center justify-center w-full h-[160px] rounded-md
             bg-[linear-gradient(to_bottom,rgba(152,192,202,0.25)_6%,rgba(65,81,85,0.5)_20%,rgba(65,81,85,0.4)_100%)] p-2.5 border border-white/20"
                >
                  <div className="relative flex items-center justify-center border border-white/20 bg-gradient-to-b from-[#223a49] to-[#43839c] rounded-md p-1 w-[120px] h-[120px]">
                    <div className="flex w-[100px] h-[100px] items-center justify-center border-dashed border-white border-2 rounded-md">
                      {item_icon && (
                        <Image
                          src={item_icon}
                          className="m-3.5"
                          style={{ imageRendering: "pixelated" }}
                          alt={"스타포스 아이템"}
                          width={90}
                          height={90}
                          unoptimized
                        />
                      )}
                    </div>
                    {showBadge && (
                      <div
                        className="absolute border border-t-transparent border-b-yellow-300 border-l-yellow-300 border-r-yellow-300
                      text-xs top-[0%] left-[3%] bg-black rounded-b-md p-1
                      drop-shadow-[0_0_10px_rgba(0,0,0,0.3)]
                  text-yellow-300 font-bold"
                      >
                        22성+
                      </div>
                    )}
                  </div>
                </div>
                {currentProbabilities && (
                  <StarforceDetail
                    isMaxStarforce={isMaxStarforce}
                    starforce={currentStarforce}
                    prevStarforce={prevStarforce}
                    currentProbabilities={currentProbabilities}
                    starforceUpgradeOptions={starforceUpgradeOptions}
                  />
                )}
              </div>
              <div className="flex flex-col bg-black/30 rounded-md mx-1 mt-1 p-1">
                <button className="flex p-1 rounded-md text-sm text-lime-200 justify-center" onClick={handleOptionFold}>
                  {optionFoldLabel}
                </button>
                <div style={{ display: isOptionFolded ? "none" : "block" }}>
                  {/** 확률 메뉴 */}
                  <div className="flex flex-row flew-grow w-full bg-white/10 rounded-md">
                    <div className="flex text-white m-1 w-[50%] bg-gradient-to-b from-slate-800/60 to-black/50 rounded-md p-2">
                      <CheckBox
                        checked={isStarforceCatchChecked}
                        disabled={isAutoModePlaying}
                        label="스타캐치"
                        onChange={() => setIsStarforceCatchChecked((prev) => !prev)}
                      />
                    </div>
                    <div className="flex text-white m-1 w-[50%] bg-gradient-to-b from-slate-800/60 to-black/50 rounded-md p-2">
                      <CheckBox
                        labelStyle={{ fontWeight: "bold" }}
                        checked={isDestroyProtectionChecked}
                        disabled={isAutoModePlaying}
                        label="파괴방지"
                        onChange={() => setIsDestroyProtectionChecked((prev) => !prev)}
                      />
                    </div>
                  </div>
                  {/** 확률 메뉴 2*/}
                  <div className="flex flex-row flew-grow w-full bg-white/10 rounded-md">
                    <div className="flex text-white m-1 w-[50%] bg-gradient-to-b from-slate-800/60 to-black/50 rounded-md p-2">
                      <CheckBox
                        labelStyle={{ fontWeight: "bold" }}
                        checked={isShiningStarforceChecked}
                        disabled={isAutoModePlaying}
                        label="21성 이하 파괴 30%↓"
                        onChange={() => setIsShiningStarforceChecked((prev) => !prev)}
                      />
                    </div>
                    <div className="flex text-white m-1 w-[50%] bg-gradient-to-b from-slate-800/60 to-black/50 rounded-md p-2">
                      <CheckBox
                        labelStyle={{ fontWeight: "bold" }}
                        checked={isStarforceCatch100Checked}
                        disabled={isAutoModePlaying}
                        label="5-10-15성에서 강화 시도 100%"
                        onChange={() => setIsStarforceCatch100Checked((prev) => !prev)}
                      />
                    </div>
                  </div>
                  {/** 할인 메뉴 */}
                  <div className="flex flex-row flew-grow w-full bg-white/10 rounded-md">
                    <div className="flex items-center text-white m-1 w-[35%] bg-gradient-to-b from-slate-800/60 to-black/50 rounded-md p-2">
                      <CheckBox
                        labelStyle={{ fontWeight: "bold" }}
                        checked={isSundayChecked}
                        disabled={isAutoModePlaying}
                        label="메소 30%↓"
                        onChange={() => setIsSundayChecked((prev) => !prev)}
                      />
                    </div>
                    <div className="flex items-center gap-1 m-1 w-[35%] bg-gradient-to-b from-slate-800/60 to-black/50 rounded-md p-2">
                      <CheckBox
                        labelStyle={{ fontWeight: "bold" }}
                        checked={isMvpDiscountChecked}
                        disabled={isAutoModePlaying}
                        onChange={() => setIsMvpDiscountChecked((prev) => !prev)}
                      />
                      <SelectBox
                        style={{ maxWidth: "160px" }}
                        disabled={!isMvpDiscountChecked || isAutoModePlaying}
                        options={MVP_OPTIONS}
                        onSelect={(option) => setMvpOption(option)}
                      />
                    </div>
                    <div className="flex items-center text-white m-1 w-[30%] bg-gradient-to-b from-slate-800/60 to-black/50 rounded-md p-1">
                      <CheckBox
                        labelStyle={{ fontWeight: "bold" }}
                        checked={isPcDiscountChecked}
                        disabled={isAutoModePlaying}
                        label="PC방(메소 5%↓)"
                        onChange={() => setIsPcDiscountChecked((prev) => !prev)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-row flew-grow w-full bg-white/10 rounded-md">
                    <div className="flex items-center m-1 w-full bg-gradient-to-b from-slate-800/60 to-black/50 rounded-md p-2">
                      <div className="text-white">
                        <CheckBox
                          labelStyle={{ fontWeight: "bold" }}
                          label="자동 모드⚡"
                          disabled={isAutoModePlaying}
                          checked={isAutoModeChecked}
                          onChange={() => setIsAutoModeChecked((prev) => !prev)}
                        />
                      </div>
                      <div className="flex flex-col gap-2 ml-[40px]">
                        <div className="flex items-center">
                          <SelectBox
                            style={{ maxWidth: "160px" }}
                            disabled={!isAutoModeChecked || isAutoModePlaying}
                            options={autoModeOptions}
                            onSelect={handleSelect}
                          />
                          <span className={`text-xs text-white ml-1 ${!isAutoModeChecked ? "opacity-50" : ""}`}>달성까지 자동 강화</span>
                        </div>
                        <div className={`flex flex-col ml-1 gap-0.5 ${!isAutoModeChecked ? "opacity-50" : ""}`}>
                          <p className="text-xs text-white">↪ 달성 완료 후</p>
                          <div className="flex items-center gap-2 text-white">
                            <RadioButtonGroup
                              name="autoModeRestart"
                              defaultvalue="stop"
                              options={[
                                { label: "종료", value: "stop" },
                                { label: "0성부터 재시작", value: "toZero" },
                                { label: "기존 수치부터 재시작", value: "toOriginal" },
                              ]}
                              onChange={handleAutoModeRestartChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row flew-grow w-full">
                <div
                  className="flex m-1 w-full items-center justify-between
                bg-[linear-gradient(to_top,rgba(152,192,202,0.15)_6%,rgba(65,81,85,0.5)_20%,rgba(65,81,85,0.4)_100%)]
                rounded-md p-2"
                >
                  <p className="text-sm font-bold text-white">사용 재화 🪙 {formattedCurrentCost}</p>
                  <p className="text-xs font-bold text-red-200">🔻할인율: {discountRate.toFixed(2)}%</p>
                </div>
              </div>
              <div className="flex flex-row justify-center text-white">
                <button
                  onClick={throttleDoStarforce}
                  className="flex items-center
                  border border-white/20
                  enabled:bg-gradient-to-b from-slate-700/50 to-cyan-400/50
                  hover:from-slate-700/70 hover:to-cyan-400/70
                rounded-md p-0.5 m-1 w-[120px] justify-center text-md font-bold"
                >
                  {starforceButtonLabel}
                </button>
                <button
                  disabled={isAutoModePlaying}
                  className="flex items-center disabled:bg-gray-600/70 disabled:text-white/20
                  enabled:bg-gradient-to-b from-[#b6b6b6] to-[#868686]
                  enabled:hover:bg-gradient-to-b hover:from-[#979797] hover:to-[#6b6b6b]
                rounded-md p-0.5 m-1 w-[120px] justify-center text-md font-bold"
                  onClick={initializeStarforce}
                >
                  {"↻ 초기화"}
                </button>
                <button
                  disabled={isAutoModePlaying}
                  className="flex items-center disabled:bg-gray-600/70 disabled:text-white/20
                  enabled:bg-gradient-to-b from-[#b6b6b6] to-[#868686]
                  enabled:hover:bg-gradient-to-b hover:from-[#979797] hover:to-[#6b6b6b]
                rounded-md p-0.5 m-1 w-[120px] justify-center text-md font-bold"
                  onClick={() => {
                    openModal({
                      type: "confirm",
                      message: "0성으로 초기화 하시겠습니까?",
                      confirmCallback: resetStarforceToZero,
                      confirmLabel: "초기화",
                      cancelLabel: "취소",
                    });
                  }}
                >
                  {"↻ 0성으로"}
                </button>
                <button
                  className="flex items-center bg-gradient-to-b from-[#b6b6b6] to-[#868686]
                  hover:bg-gradient-to-b hover:from-[#979797] hover:to-[#6b6b6b]
                rounded-md p-0.5 m-1 w-[120px] justify-center text-md font-bold"
                  onClick={resetStarforceTarget}
                >
                  {"X 닫기"}
                </button>
              </div>
              <p className="flex mt-1 mb-1 border-b-2 border-dotted border-b-white/20" />
              <div className="flex flex-row flex-grow gap-2 m-0.5">
                <div className="flex bg-slate-900/70 w-[65%] rounded-md p-1">
                  <p className="text-xs p-1 text-white">🪙 누적 메소: {formatKoreanNumber(accumulatedCost)}</p>
                </div>
                <div className="flex bg-slate-900/70 w-[35%] rounded-md p-1">
                  <p className="text-xs p-1 text-white">☝️ 시도: {attempts}회</p>
                </div>
              </div>
            </div>
            <StarforceResultLabel result={result} isAutoModePlaying={isAutoModePlaying} />
          </div>
        </div>
        <StarforceRecords
          records={records}
          clearRecords={() => {
            setRecords([]);
            resetDestroyCount();
          }}
          destroyCount={destroyCount}
        />
      </div>
      <div
        style={{ zIndex: 1001 }}
        onClick={resetStarforceTarget}
        className="fixed z-50 top-0 left-0 w-full h-full flex justify-center items-center opacity-50 bg-black"
      />
    </>
  );
};

export default StarforceContainer;
