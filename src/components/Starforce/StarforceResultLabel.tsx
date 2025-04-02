import type { StarforceResult } from "@/utils/StarforceSimulator";
import { useMemo } from "react";

interface ResultProps {
  result: StarforceResult | null;
  isAutoModePlaying: boolean;
}

const Success = () => (
  <p
    className="px-3 text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-300 to-red-500
    text-[60px] font-extrabold drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] italic"
  >
    SUCCESS
  </p>
);

const Fail = () => (
  <p
    className="px-3 text-transparent bg-clip-text bg-gradient-to-b from-white via-red-600 to-black
    text-[60px] font-extrabold drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] italic"
  >
    FAIL
  </p>
);

const Destroyed = () => (
  <p
    className=" px-3 text-transparent bg-clip-text bg-gradient-to-b from-gray-100 via-gray-400 to-gray-900
    text-[60px] font-extrabold drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] italic"
  >
    DESTROYED
  </p>
);

export const StarforceResultLabel = ({ result, isAutoModePlaying }: ResultProps) => {
  if (!result) return null;

  return (
    <div
      style={{ transform: "translate(-50%, -40%)" }}
      className={`absolute top-[40%] left-[50%] bg-gradient-to-r from-black to-transparent
        ${isAutoModePlaying && "opacity-25"}
        ${!isAutoModePlaying && "starforce-fade-in"}`}
    >
      {result === "success" && <Success />}
      {result === "fail" && <Fail />}
      {result === "destroy" && <Destroyed />}
    </div>
  );
};
