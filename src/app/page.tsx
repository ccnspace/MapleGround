import { EquipContainer } from "@/components/EquipContainer";
import { AbilityContainer } from "@/components/AbilityContainer";
import { StatContainer } from "@/components/StatContainer";
import { PetEquipContainer } from "@/components/PetEquipContainer";
import { GraphContainer } from "@/components/GraphContainer";

export default function Page() {
  return (
    <div className="flex flex-col gap-5 px-5 pt-8 pb-8 w-full overflow-auto h-fit min-h-[800px]">
      <div className="flex gap-5 h-auto">
        <StatContainer />
        <EquipContainer />
        <div className="flex flex-col gap-5">
          <AbilityContainer />
          <PetEquipContainer />
        </div>
      </div>
      <div className="flex gap-5">
        <GraphContainer />
        <GraphContainer />
      </div>
    </div>
  );
}
