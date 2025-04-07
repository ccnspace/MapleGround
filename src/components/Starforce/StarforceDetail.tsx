import { StarforceProbability } from "@/utils/starforceUtils";
import { Divider } from "../Equip/Divider";

interface Props {
  isMaxStarforce: boolean;
  starforce: number;
  currentProbabilities: StarforceProbability;
  starforceUpgradeOptions: string;
}

export const StarforceDetail = ({ isMaxStarforce, starforce, currentProbabilities, starforceUpgradeOptions }: Props) => {
  // 아래 확률을 소수점 둘째자리까지 보여 주게 변경
  const successRate = `${(currentProbabilities.success * 100).toFixed(2)}%`;
  const failRate = `${(currentProbabilities.fail * 100).toFixed(2)}%`;
  const destroyRate = currentProbabilities.destroy ? `${(currentProbabilities.destroy * 100).toFixed(2)}%` : null;

  return (
    <div className="flex flex-col font-bold text-white whitespace-pre-wrap">
      {isMaxStarforce ? (
        <>
          <p className="text-xl">{`${starforce}성`}</p>
          <p className="text-gray-400 text-sm">아이템이 가질 수 있는 최대 스타포스 상태</p>
        </>
      ) : (
        <>
          <p>{`${starforce}성 > ${starforce + 1}성`}</p>
          <p>{`성공확률: ${successRate}`}</p>
          <p>{`실패(유지)확률: ${failRate}`}</p>
          {destroyRate && <p>{`파괴확률: ${destroyRate}`}</p>}

          {starforceUpgradeOptions && <p className="mt-5">{`${starforceUpgradeOptions}`}</p>}
        </>
      )}
    </div>
  );
};
