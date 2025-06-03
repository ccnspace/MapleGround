"use client";

import { EquipContainer } from "@/components/Container/EquipContainer";
import { AbilityContainer } from "@/components/Container/AbilityContainer";
import { StatContainer } from "@/components/Container/StatContainer";
import { PetEquipContainer } from "@/components/Container/PetEquipContainer";
import { ChartContainer } from "@/components/Container/ChartContainer";
import { Spinner } from "../svg/Spinner";
import { useCharacterStore } from "@/stores/character";
import { ExpContentContainer } from "./ExpContentContainer";
import { useCubeStore } from "@/stores/cube";
import { CubeContainer } from "./CubeContainer";
import { memo } from "react";
import { useStarforceStore } from "@/stores/starforce";
import { StarforceContainer } from "./StarforceContainer";
import { useTheme } from "next-themes";

const RightSideGridContainer = memo(() => (
  <div className="grid gap-4" style={{ gridRow: "span 2" }}>
    <AbilityContainer />
    <PetEquipContainer />
    <ExpContentContainer />
  </div>
));

RightSideGridContainer.displayName = "RightSideGridContainer";

const BottomGridContainer = memo(() => (
  <>
    <div className="col-span-2">
      <ChartContainer />
    </div>
    {/* <ExpContainer /> */}
  </>
));

BottomGridContainer.displayName = "BottomGridContainer";

export const MainContainer = () => {
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);
  const cubeTargetItem = useCubeStore((state) => state.targetItem);
  const starforceTargetItem = useStarforceStore((state) => state.targetItem);
  const { theme } = useTheme();

  if (fetchStatus === "loading" || fetchStatus === "error") {
    return (
      <div className="w-[1280px] h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <Spinner width="6em" height="6em" color={theme === "dark" ? "white" : "#616161"} />
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse font-medium tracking-wide">정보를 불러오는 중입니다</p>
      </div>
    );
  }

  return (
    <div className="main_container w-[1280px] gap-4">
      <StatContainer />
      <EquipContainer />
      <RightSideGridContainer />
      <BottomGridContainer />
      {cubeTargetItem && <CubeContainer />}
      {starforceTargetItem && <StarforceContainer targetItem={starforceTargetItem} />}
    </div>
  );
};
