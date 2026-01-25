import { AndroidEquipment } from "@/types/AndroidEquipment";
import { CSSProperties, memo, useContext, useRef } from "react";
import { EquipActionContext } from "@/components/Container/EquipContainer";
import { useClickOutside } from "@/hooks/useClickOutside";
import Image from "next/image";
import { EquipDetailCard } from "../EquiqDetailCard";

const commonEquipStyle = `equip_wrapper flex hover:bg-slate-400/60 dark:hover:bg-white/40 relative justify-center
  items-center bg-slate-300 dark:bg-[#4f515a] w-16 h-16 max-[600px]:w-12 max-[600px]:h-12 rounded-md cursor-pointer`;

// TODO: EquipDetailCard에 공통화
const commonDetailStyle = { position: "absolute", zIndex: 1000, top: 10, left: 10 } as CSSProperties;

const AndroidImage = ({ icon }: { icon: AndroidEquipment["android_icon"] }) => (
  <Image src={icon as string} alt={"안드로이드"} unoptimized width={52} height={60} style={{ width: "auto", height: "auto" }} />
);

export const AndroidEquipIcon = memo(({ equipData, isSelected }: { equipData: AndroidEquipment | undefined; isSelected: boolean }) => {
  const setSelectedEquipName = useContext(EquipActionContext);
  const equipDetailRef = useRef<HTMLDivElement>(null);
  useClickOutside(equipDetailRef, () => setSelectedEquipName(""));

  return (
    <div id={"안드로이드"} className={`${commonEquipStyle}`}>
      {equipData?.android_icon && <AndroidImage icon={equipData.android_icon} />}
      {isSelected && (
        <div ref={equipDetailRef} className="equip_detail_card">
          <EquipDetailCard equipName={"안드로이드"} />
        </div>
      )}
    </div>
  );
});

AndroidEquipIcon.displayName = "AndroidEquipIcon";
