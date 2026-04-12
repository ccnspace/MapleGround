"use client";

import dynamic from "next/dynamic";
import { EquipContainer } from "@/components/Container/EquipContainer";
import { AbilityContainer } from "@/components/Container/AbilityContainer";
import { StatContainer } from "@/components/Container/StatContainer";
import { useCharacterStore } from "@/stores/character";
import { useCubeStore } from "@/stores/cube";
import { useStarforceStore } from "@/stores/starforce";
import { DimmedLayer } from "../DimmedLayer";
import { SetEffectContainer } from "./SetEffectContainer";
import { ContainerWrapper } from "./ContainerWrapper";
import { UnionContainer } from "./UnionContainer";
import { LoadingContainer } from "./LoadingContainer";
import { HeroPowerCard } from "./HeroPowerCard";
import { useNickname } from "@/hooks/useNickname";

const ChartContainer = dynamic(() => import("./ChartContainer"), {
  ssr: false,
  loading: () => (
    <ContainerWrapper className="w-full h-[400px] gap-0.5">
      <p
        className="flex font-extrabold text-base px-2 pt-0.5
      border-l-4 border-l-indigo-400
     "
      >
        전투력 추이
      </p>
    </ContainerWrapper>
  ),
});
const StarforceContainer = dynamic(() => import("./StarforceContainer"), { ssr: false, loading: () => <DimmedLayer spinner /> });
const CubeContainer = dynamic(() => import("./CubeContainer"), { ssr: false, loading: () => <DimmedLayer spinner /> });

export const MainContainer = () => {
  const nickname = useNickname();
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);
  const cubeTargetItem = useCubeStore((state) => state.targetItem);
  const starforceTargetItem = useStarforceStore((state) => state.targetItem);

  if (fetchStatus !== "success" || !nickname) {
    return <LoadingContainer />;
  }

  return (
    <div className="main_container w-[1366px]">
      <HeroPowerCard />
      <div className="[grid-area:equip] relative z-10 flex flex-row gap-4 max-[600px]:flex-col">
        <div className="flex-1 min-w-0 relative z-10">
          <EquipContainer />
        </div>
        <div className="w-[380px] shrink-0 flex flex-col max-[600px]:w-full relative z-0">
          <StatContainer />
        </div>
      </div>
      <div className="[grid-area:stat] min-h-0 flex flex-col gap-4">
        <div className="flex-1 min-h-0">
          <SetEffectContainer />
        </div>
        <div className="flex-1 min-h-0">
          <AbilityContainer />
        </div>
      </div>
      <div className="[grid-area:abil]">
        <UnionContainer />
      </div>
      <div className="[grid-area:chart]">
        <ChartContainer nickname={nickname} />
      </div>
      {cubeTargetItem && <CubeContainer />}
      {starforceTargetItem && <StarforceContainer targetItem={starforceTargetItem} />}
    </div>
  );
};
