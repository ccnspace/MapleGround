import { StarforceProbability } from "@/utils/starforceUtils";
import { Divider } from "../Equip/Divider";
import { useEffect, useRef } from "react";

interface Props {
  isMaxStarforce: boolean;
  starforce: number;
  currentProbabilities: StarforceProbability;
  starforceUpgradeOptions: string;
}

export const StarforceDetail = ({ isMaxStarforce, starforce, currentProbabilities, starforceUpgradeOptions }: Props) => {
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 첫 렌더링 이후에 false로 설정
    isFirstRender.current = false;
  }, []);

  const isNewStar = (idx: number) => {
    if (isFirstRender.current) return false;
    return idx + 1 === starforce;
  };

  // 아래 확률을 소수점 둘째자리까지 보여 주게 변경
  const successRate = `${(currentProbabilities.success * 100).toFixed(2)}%`;
  const failRate = currentProbabilities.fail ? `${(currentProbabilities.fail * 100).toFixed(2)}%` : null;
  const destroyRate = currentProbabilities.destroy ? `${(currentProbabilities.destroy * 100).toFixed(2)}%` : null;

  const totalStars = 30; // 전체 별 개수
  const starsPerRow = 5;
  const groups = Math.ceil(totalStars / starsPerRow); // 6개 그룹

  // 별 문자열 배열 생성
  const starGroups = Array.from({ length: groups }, (_, i) => {
    const start = i * starsPerRow;
    return Array.from({ length: starsPerRow }, (_, j) => {
      const idx = start + j;
      return idx < starforce ? (
        <span key={idx} className={`text-yellow-300 ${isNewStar(idx) ? "animate-starBlink" : ""}`}>
          ★
        </span>
      ) : (
        <span key={idx} className="text-black/80 [text-shadow:_1px_1px_3px_rgb(255_255_255_/_15%)]">
          ★
        </span>
      );
    });
  });

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-center p-1 rounded-xl gap-5 bg-black/25">
        <div className="grid w-[50%] grid-cols-3 gap-1 text-xs fade-in">
          {starGroups.map((group, idx) => (
            <div key={idx} className="flex justify-center">
              {group}
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-full items-center justify-center p-1 rounded-xl gap-5 bg-black/25 text-white font-bold text-lg fade-in">
        <p className="text-yellow-300">⭐{starforce}</p>
        {!isMaxStarforce && (
          <>
            <p className="text-sm">{`>>>`}</p>
            <p>⭐{starforce + 1}</p>
          </>
        )}
      </div>
      <div
        className="flex rounded-md flex-grow h-[140px] bg-gradient-to-b p-3 from-black/20 to-slate-800/30
      overflow-y-scroll flex-col font-bold text-white whitespace-pre-wrap"
      >
        {isMaxStarforce ? (
          <>
            <p className="text-xl">{`${starforce}성`}</p>
            <p className="text-gray-400 text-sm">아이템이 가질 수 있는 최대 스타포스 상태</p>
          </>
        ) : (
          <>
            <p>{`성공확률: ${successRate}`}</p>
            {failRate && <p>{`실패(유지)확률: ${failRate}`}</p>}
            {destroyRate && <p>{`파괴확률: ${destroyRate}`}</p>}

            {starforceUpgradeOptions && <p className="mt-5">{`${starforceUpgradeOptions}`}</p>}
          </>
        )}
      </div>
    </div>
  );
};
