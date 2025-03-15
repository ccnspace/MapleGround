import Image from "next/image";
import { useCharacterInfo } from "@/hooks/useCharacterInfo";
import { SymbolOption } from "@/types/SymbolEquipment";
import { CSSProperties, memo, type MouseEvent, useContext, useRef } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { EquipActionContext, EquipContext } from "../../EquipContainer";
import { EquipDetailCard } from "../EquiqDetailCard";

const MaxBadge = () => (
  <div className={`absolute flex shadow top-0 left-0 font-bold text-white rounded-sm text-[10px] px-0.5 pt-0.25 pb-0.25 bg-purple-400/80`}>
    {"MAX"}
  </div>
);
const commonDetailStyle = { position: "absolute", zIndex: 1000, top: 10, left: 10 } as CSSProperties;

export const SymbolEquipIcon = memo(
  ({
    symbol,
    type,
    onClick,
    isSelected,
  }: {
    symbol: SymbolOption | undefined;
    type: "arcane" | "authentic";
    onClick: (e: MouseEvent) => void;
    isSelected: boolean;
  }) => {
    const symbolLevel = symbol?.symbol_level ?? 0;
    const isMaxLevel = type === "arcane" ? symbolLevel === 20 : symbolLevel === 11;

    const setSelectedEquipName = useContext(EquipActionContext);
    const equipDetailRef = useRef<HTMLDivElement>(null);

    useClickOutside(equipDetailRef, () => setSelectedEquipName(""));

    if (!symbol) return null;

    return (
      <div
        id={symbol?.symbol_name}
        className={`symbol_wrapper flex hover:bg-slate-400/60 dark:hover:bg-white/40 relative
         justify-center items-center gap-1 w-[54px] h-[60px] cursor-pointer
         bg-slate-300 dark:bg-[#4f515a] px-2 pt-1 pb-1 rounded-md
        ${isMaxLevel ? "border-2 border-purple-300/50" : ""}`}
        onClick={onClick}
      >
        {!!symbol?.symbol_icon && (
          <div className="flex flex-col items-center">
            {isMaxLevel && <MaxBadge />}
            <Image src={symbol.symbol_icon} unoptimized width={30} height={30} alt={symbol?.symbol_name ?? ""} />
            <p
              className={`rounded-sm font-bold px-0.5 pt-0.25 pb-0.25
              text-xs text-slate-800 dark:text-white `}
            >
              {`LV.${symbol?.symbol_level}`}
            </p>
          </div>
        )}
        {isSelected && (
          <div ref={equipDetailRef} style={commonDetailStyle}>
            <EquipDetailCard equipName={symbol.symbol_name} />
          </div>
        )}
      </div>
    );
  }
);

SymbolEquipIcon.displayName = "SymbolEquipIcon";
