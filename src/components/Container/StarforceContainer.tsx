import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useStarforceStore } from "@/stores/starforce";
import CheckBox from "../CheckBox";
import Image from "next/image";
import { NormalContainer } from "@/components/Equip/normal/Container";
import { type StarforceResult, StarforceSimulator } from "@/utils/StarforceSimulator";
import { ItemEquipment } from "@/types/Equipment";
import { StarforceProbability } from "@/utils/starforceUtils";
import { StarforceDetail } from "@/components/Starforce/StarforceDetail";
import { StarforceResultLabel } from "@/components/Starforce/StarforceResultLabel";
import { formatKoreanNumber } from "@/utils/formatKoreanNum";
import { useThrottle } from "@/hooks/useThrottle";

export const StarforceContainer = ({ targetItem }: { targetItem: ItemEquipment }) => {
  const resetStarforceTarget = useStarforceStore((state) => state.resetStarforceTarget);

  const [currentTarget, setCurrentTarget] = useState<ItemEquipment | null>(null);
  const [currentStarforce, setCurrentStarforce] = useState(0);
  const [currentCost, setCurrentCost] = useState(0);
  const [currentProbabilities, setCurrentProbabilities] = useState<StarforceProbability | null>(null);
  const [costDiscount, setCostDiscount] = useState(1);
  const [destroyReduction, setDestroyReduction] = useState(1);
  const [accumulatedCost, setAccumulatedCost] = useState(0);

  const simulator = useMemo(
    () =>
      new StarforceSimulator({
        item: targetItem,
        costDiscount,
        destroyReduction,
      }),
    [targetItem, costDiscount, destroyReduction]
  );

  useEffect(() => {
    const { item, cost, probabilities } = simulator.getState();
    setCurrentStarforce(parseInt(item.starforce));
    setCurrentCost(cost);
    setCurrentProbabilities(probabilities);
    setCurrentTarget(item);
  }, [simulator]);

  const { item_name, item_icon } = targetItem ?? {};
  const [result, setResult] = useState<StarforceResult | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseOverOnImage = () => {
    setShowDetail(true);
  };

  const handleMouseLeaveOnImage = () => {
    setShowDetail(false);
  };

  const doStarforce = useCallback(() => {
    simulator.simulate();
    const { item, cost, probabilities, result, accumulatedCost } = simulator.getState();

    setCurrentStarforce(parseInt(item.starforce));
    setCurrentCost(cost);
    setCurrentProbabilities(probabilities);
    setResult(result);
    setAccumulatedCost(accumulatedCost);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      setResult(null);
      setTimeout(() => {
        setResult(result); // 짧은 지연 후 새로운 결과로 설정
      }, 0);
    }
    const newTimer = setTimeout(() => setResult(null), 1000);
    timerRef.current = newTimer;
  }, [simulator]);

  const throttleDoStarforce = useThrottle(doStarforce, 200);

  /** 스타포스 강화 키 이벤트 핸들러 */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "d") {
        throttleDoStarforce();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [throttleDoStarforce]);

  if (!targetItem) return null;

  return (
    <>
      <div style={{ zIndex: 1002 }} className="flex fixed top-[30%] left-[40%]">
        <div
          className={`flex flex-col items-center gap-1 text-white rounded-lg
             bg-black/70 p-2 border border-white/30 align-center 
             justify-center w-[480px]`}
        >
          <p className="text-sm font-medium">
            <span className="text-yellow-400">스타포스</span>
          </p>
          <div className="relative flex flex-col p-1 w-full rounded-lg bg-gradient-to-b from-gray-200 to-gray-300 gap-1">
            <div className="flex flex-col p-1 w-full rounded-lg bg-gradient-to-b from-[#4e413e] to-[#493d34] gap-1">
              <p className="flex fade-in justify-center rounded-md bg-[#2e2521] p-1 m-1">
                <span className="text-yellow-400">메소</span>를 사용하여 장비를 강화합니다.
              </p>
              <div className="flex flex-row">
                <div
                  onMouseOver={handleMouseOverOnImage}
                  onMouseLeave={handleMouseLeaveOnImage}
                  className="flex items-center justify-center bg-gradient-to-b from-[#3ac4ee] to-[#007a99] rounded-md p-1 w-[156px] h-[156px] m-1"
                >
                  <div className="flex items-center justify-center border-dashed border-white border-2 rounded-md">
                    {item_icon && (
                      <Image
                        src={item_icon}
                        className="m-3.5"
                        style={{ imageRendering: "pixelated" }}
                        alt={"스타포스 아이템"}
                        width={100}
                        height={100}
                        unoptimized
                      />
                    )}
                  </div>
                  {currentTarget && showDetail && (
                    <div
                      className="absolute top-[20%] left-[6%] flex flex-col min-w-80 max-w-80 bg-slate-950/90 dark:bg-[#121212]/90
          border border-gray-700 rounded-lg px-5 pt-3 pb-4"
                    >
                      <NormalContainer item={currentTarget} enableItemMenu={false} />
                    </div>
                  )}
                </div>
                <div className="flex flex-grow overflow-y-scroll bg-gradient-to-b from-[#3b302b] to-[#302622] rounded-md p-3 m-1">
                  {currentProbabilities && (
                    <StarforceDetail starforce={currentStarforce} currentCost={currentCost} currentProbabilities={currentProbabilities} />
                  )}
                </div>
              </div>
              <div className="flex flex-row flew-grow w-full">
                <div className="flex m-1 w-full bg-gradient-to-b from-[#3b302b] to-[#302622] rounded-md p-2">
                  <CheckBox label="스타캐치 해제" />
                </div>
                <div className="flex m-1 w-full bg-gradient-to-b from-[#3b302b] to-[#302622] rounded-md p-2">
                  <CheckBox label="파괴방지" />
                </div>
                <div className="flex m-1 w-full bg-gradient-to-b from-[#3b302b] to-[#302622] rounded-md p-2">
                  <CheckBox label="자동 모드" />
                </div>
              </div>
              <div className="flex m-1 w-full bg-gradient-to-b from-[#3b302b] to-[#302622] rounded-md p-2">
                <p className="text-sm font-bold">🪙 필요한 메소: {formatKoreanNumber(currentCost)} 메소</p>
              </div>
              <div className="flex flex-row justify-center">
                <button
                  onClick={throttleDoStarforce}
                  className="flex bg-gradient-to-b from-[#8fb843] to-[#73b12c]
                  hover:bg-gradient-to-b hover:from-[#7ea338] hover:to-[#578621]
                rounded-md p-0.5 m-1 w-[120px] justify-center text-lg font-bold"
                >
                  {"+ 강화(D키)"}
                </button>
                <button
                  className="flex bg-gradient-to-b from-[#b6b6b6] to-[#868686]
                  hover:bg-gradient-to-b hover:from-[#979797] hover:to-[#6b6b6b]
                rounded-md p-0.5 m-1 w-[120px] justify-center text-lg font-bold"
                  onClick={resetStarforceTarget}
                >
                  {"↻ 취소"}
                </button>
              </div>
              <div className="flex bg-slate-900 rounded-md m-1">
                <p className="text-xs p-1">💸 소모 메소량: {formatKoreanNumber(accumulatedCost)} 메소</p>
              </div>
            </div>
            <StarforceResultLabel result={result} />
          </div>
        </div>
      </div>
      <div
        style={{ zIndex: 1001 }}
        onClick={resetStarforceTarget}
        className="fixed z-50 top-0 left-0 w-full h-full flex justify-center items-center opacity-50 bg-black"
      />
    </>
  );
};
