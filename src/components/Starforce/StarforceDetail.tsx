import { StarforceProbability } from "@/utils/starforceUtils";

interface Props {
  starforce: number;
  currentCost: number;
  currentProbabilities: StarforceProbability;
}

export const StarforceDetail = ({ starforce, currentCost, currentProbabilities }: Props) => {
  // 아래 확률을 소수점 둘째자리까지 보여 주게 변경
  const successRate = `${(currentProbabilities.success * 100).toFixed(2)}%`;
  const failRate = `${(currentProbabilities.fail * 100).toFixed(2)}%`;
  const destroyRate = currentProbabilities.destroy ? `${(currentProbabilities.destroy * 100).toFixed(2)}%` : null;

  return (
    <div className="flex flex-col font-bold">
      <p>{`${starforce}성 > ${starforce + 1}성`}</p>
      <p>{`성공확률: ${successRate}`}</p>
      <p>{`실패(유지)확률: ${failRate}`}</p>
      {destroyRate && <p>{`파괴확률: ${destroyRate}`}</p>}
      {/* <p>{`현재 비용: ${currentCost}원`}</p> */}
    </div>
  );
};
