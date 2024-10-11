import { EquipContainer } from "@/components/EquipContainer";
import { StatContainer } from "@/components/StatContainer";

export default function Page() {
  return (
    <div className="flex px-5 pt-8 w-full overflow-scroll h-[820px] gap-3">
      <EquipContainer />

      <StatContainer />
    </div>
  );
}
