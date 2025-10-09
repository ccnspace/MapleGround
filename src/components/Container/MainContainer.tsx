"use client";

import dynamic from "next/dynamic";
import { memo } from "react";
import { EquipContainer } from "@/components/Container/EquipContainer";
import { AbilityContainer } from "@/components/Container/AbilityContainer";
import { StatContainer } from "@/components/Container/StatContainer";
import { PetEquipContainer } from "@/components/Container/PetEquipContainer";
import { Spinner } from "../svg/Spinner";
import { useCharacterStore } from "@/stores/character";
import { useCubeStore } from "@/stores/cube";
import { useStarforceStore } from "@/stores/starforce";
import { useTheme } from "next-themes";
import { DimmedLayer } from "../DimmedLayer";
import { SetEffectContainer } from "./SetEffectContainer";
import { ContainerWrapper } from "./ContainerWrapper";
import { UnionContainer } from "./UnionContainer";

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

const BottomGridContainer = memo(() => (
  <div className="col-span-2">
    <ChartContainer />
  </div>
));

BottomGridContainer.displayName = "BottomGridContainer";

export const MainContainer = () => {
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);
  const cubeTargetItem = useCubeStore((state) => state.targetItem);
  const starforceTargetItem = useStarforceStore((state) => state.targetItem);
  const { theme } = useTheme();

  if (fetchStatus !== "success") {
    return (
      <div className="main_loading w-[1366px] h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <Spinner width="6em" height="6em" color={theme === "dark" ? "white" : "#616161"} />
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse font-medium tracking-wide">정보를 불러오는 중입니다</p>
      </div>
    );
  }

  return (
    <div className="main_container w-[1366px] gap-4">
      <StatContainer />
      <EquipContainer />
      <RightSideGridContainer />
      <BottomGridContainer />
      {cubeTargetItem && <CubeContainer />}
      {starforceTargetItem && <StarforceContainer targetItem={starforceTargetItem} />}
    </div>
  );
};
