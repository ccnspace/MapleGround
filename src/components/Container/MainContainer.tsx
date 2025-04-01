"use client";

import { EquipContainer } from "@/components/Container/EquipContainer";
import { AbilityContainer } from "@/components/Container/AbilityContainer";
import { StatContainer } from "@/components/StatContainer";
import { PetEquipContainer } from "@/components/Container/PetEquipContainer";
import { ChartContainer } from "@/components/Container/ChartContainer";
import { DimmedLayer } from "../DimmedLayer";
import { useCharacterStore } from "@/stores/character";
import { ExpContainer } from "./ExpContainer";
import { EquipSetContainer } from "./EquipSetContainer";
import { useCubeStore } from "@/stores/cube";
import { CubeContainer } from "./CubeContainer";
import { memo } from "react";
import { useStarforceStore } from "@/stores/starforce";
import { StarforceContainer } from "./StarforceContainer";

const RightSideGridContainer = memo(() => (
  <div className="grid gap-4">
    <AbilityContainer />
    <PetEquipContainer />
    <EquipSetContainer />
  </div>
));

RightSideGridContainer.displayName = "RightSideGridContainer";

const BottomGridContainer = memo(() => (
  <>
    <div className="col-span-2">
      <ChartContainer />
    </div>
    <ExpContainer />
  </>
));

BottomGridContainer.displayName = "BottomGridContainer";

export const MainContainer = () => {
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);
  const cubeTargetItem = useCubeStore((state) => state.targetItem);
  const starforceTargetItem = useStarforceStore((state) => state.targetItem);

  return (
    <div className="main_container w-[1280px] gap-4">
      <StatContainer />
      <EquipContainer />
      <RightSideGridContainer />
      <BottomGridContainer />
      {fetchStatus === "loading" && <DimmedLayer spinner />}
      {cubeTargetItem && <CubeContainer />}
      {starforceTargetItem && <StarforceContainer />}
    </div>
  );
};
