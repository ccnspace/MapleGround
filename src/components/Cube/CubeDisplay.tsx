import type { ItemPotentialGrade } from "@/types/Equipment";
import type { CubeType } from "@/utils/CubeSimulator";
import { useEffect, useState } from "react";

interface CubeDisplayProps {
  cubeType: CubeType;
  grade?: ItemPotentialGrade;
  options: string[];
  label: string;
  showSelectButton?: boolean;
  onSelect?: () => void;
}

const GRADE_BACKGROUNDS = {
  레어: "bg-sky-500",
  에픽: "bg-purple-600",
  유니크: "bg-yellow-500",
  레전드리: "bg-lime-500",
} as const;

export const CubeDisplay = ({ cubeType, grade, options, label, showSelectButton, onSelect }: CubeDisplayProps) => {
  const [fadeIn, setFadeIn] = useState(false);

  /** 잠재능력 재설정 UI 효과 */
  useEffect(() => {
    setFadeIn(true);

    const timer = setTimeout(() => {
      setFadeIn(false);
    }, 500);

    return () => {
      setFadeIn(false);
      clearTimeout(timer);
    };
  }, [options]);

  return (
    <div className="flex flex-col w-[280px] rounded-md bg-sky-400">
      <div className="flex flex-row items-center justify-between">
        <p className="text-sm px-1 pt-1 pb-0.5 font-bold [text-shadow:_1px_2px_4px_rgb(0_0_0/_0.4)]">{label}</p>
        {showSelectButton && (
          <button
            onClick={onSelect}
            className="text-sm px-2.5 mr-2 rounded-md font-bold text-black cursor-pointer
              bg-gradient-to-b from-yellow-300 to-yellow-400
              hover:from-yellow-400 hover:to-yellow-500"
          >
            선택
          </button>
        )}
      </div>
      <div className="flex flex-col gap-0.5 bg-gradient-to-br from-slate-800 to-slate-900 m-1 text-sm rounded-md min-h-[96px]">
        {grade && <p className={`flex justify-center mb-1 font-medium rounded-tl-md rounded-tr-md ${GRADE_BACKGROUNDS[grade]}`}>{grade}</p>}
        {options?.map((option, idx) => (
          <p key={idx} className={`font-medium px-2 text-sm ${fadeIn ? "fade-in" : ""}`}>
            {cubeType === "additional" ? `+ ${option}` : option}
          </p>
        ))}
      </div>
    </div>
  );
};
