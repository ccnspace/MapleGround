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

export const MainContainer = () => {
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);
  const cubeTargetItem = useCubeStore((state) => state.targetItem);

  return (
    <div className="main_container w-[1280px] gap-4">
      {cubeTargetItem && <CubeContainer />}
      <StatContainer />
      <EquipContainer />
      <div className="grid gap-4">
        <AbilityContainer />
        <PetEquipContainer />
        <EquipSetContainer />
      </div>
      <div className="col-span-2">
        <ChartContainer />
      </div>
      <ExpContainer />
      {fetchStatus === "loading" && <DimmedLayer spinner />}
    </div>
  );
};
