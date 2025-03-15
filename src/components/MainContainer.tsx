"use client";

import { EquipContainer } from "@/components/EquipContainer";
import { AbilityContainer } from "@/components/AbilityContainer";
import { StatContainer } from "@/components/StatContainer";
import { PetEquipContainer } from "@/components/PetEquipContainer";
import { ChartContainer } from "@/components/ChartContainer";
import { ExpContainer } from "./ExpContainer";
import { DimmedLayer } from "./DimmedLayer";
import { useLoadingStore } from "@/stores/loading";

export const MainContainer = () => {
  const isLoading = useLoadingStore((state) => state.isLoading);

  return (
    <div className="main_container flex flex-col gap-5 px-5 pt-8 pb-8 overflow-y-auto">
      <div className="flex gap-5 h-auto">
        <StatContainer />
        <EquipContainer />
        <div className="flex flex-col gap-5">
          <AbilityContainer />
          <PetEquipContainer />
        </div>
      </div>
      <div className="flex gap-5">
        <ChartContainer />
        {/* <ExpContainer /> */}
      </div>
      {isLoading && <DimmedLayer spinner />}
    </div>
  );
};
