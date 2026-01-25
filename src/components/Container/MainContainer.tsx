"use client";

import dynamic from "next/dynamic";
import { memo } from "react";
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

const RightSideGridContainer = memo(() => (
  <div className="right_sideBar grid">
    <AbilityContainer />
    <SetEffectContainer />
    <UnionContainer />
  </div>
));

RightSideGridContainer.displayName = "RightSideGridContainer";

const BottomGridContainer = memo(({ nickname }: { nickname: string }) => (
  <div className="col-span-2">
    <ChartContainer nickname={nickname} />
  </div>
));

BottomGridContainer.displayName = "BottomGridContainer";

export const MainContainer = () => {
  const nickname = useNickname();
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);
  const cubeTargetItem = useCubeStore((state) => state.targetItem);
  const starforceTargetItem = useStarforceStore((state) => state.targetItem);

  if (fetchStatus !== "success" || !nickname) {
    return <LoadingContainer />;
  }

  return (
    <div className="main_container w-[1366px] gap-4">
      <StatContainer />
      <EquipContainer />
      <RightSideGridContainer />
      <BottomGridContainer nickname={nickname} />
      {cubeTargetItem && <CubeContainer />}
      {starforceTargetItem && <StarforceContainer targetItem={starforceTargetItem} />}
    </div>
  );
};
