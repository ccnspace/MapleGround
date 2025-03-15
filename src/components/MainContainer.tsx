"use client";

import { EquipContainer } from "@/components/EquipContainer";
import { AbilityContainer } from "@/components/AbilityContainer";
import { StatContainer } from "@/components/StatContainer";
import { PetEquipContainer } from "@/components/PetEquipContainer";
import { ChartContainer } from "@/components/ChartContainer";
import { DimmedLayer } from "./DimmedLayer";
import { useCharacterStore } from "@/stores/character";
import { ExpContainer } from "./ExpContainer";

export const MainContainer = () => {
  const fetchStatus = useCharacterStore((state) => state.fetchStatus);

  return (
    <div className="main_container w-[1280px] gap-4">
      <StatContainer />
      <EquipContainer />
      <div className="grid gap-4">
        <AbilityContainer />
        <PetEquipContainer />
        <PetEquipContainer />
      </div>
      <div className="col-span-2">
        <ChartContainer />
      </div>
      <ExpContainer />
      {fetchStatus === "loading" && <DimmedLayer spinner />}
    </div>
  );
};
