import type { SymbolOption } from "@/types/SymbolEquipment";
import { EquipDescription } from "../normal/EquipDescription";
import { Divider } from "../Divider";

type Props = {
  type: "arcane" | "authentic";
  item: SymbolOption;
};
export const SymbolContainer = ({ type, item }: Props) => {
  const {
    symbol_name,
    symbol_icon,
    symbol_str,
    symbol_int,
    symbol_luk,
    symbol_dex,
    symbol_force,
    symbol_level,
    symbol_growth_count,
    symbol_require_growth_count,
    symbol_exp_rate,
    symbol_meso_rate,
    symbol_drop_rate,
    symbol_hp,
    symbol_description,
  } = item;

  const maxLevel = type === "arcane" ? 20 : 11;
  const isMaxLevel = symbol_level === maxLevel;
  const growthRatio = `${Math.round(
    (symbol_growth_count / symbol_require_growth_count) * 100
  )}%`;
  const growthInfo = isMaxLevel
    ? "MAX"
    : `${symbol_growth_count} / ${symbol_require_growth_count} (${growthRatio})`;
  const forceLabel = type === "arcane" ? "ARC" : "AUT";

  return (
    <>
      <EquipDescription item_icon={symbol_icon} item_name={symbol_name} />
      <Divider />
      <div className="flex flex-col text-xs font-medium gap-0.5">
        {symbol_level && (
          <p className="text-yellow-500">
            성장 레벨: {symbol_level}/{maxLevel}
          </p>
        )}
        {symbol_level && (
          <p className="text-yellow-500">성장치: {growthInfo}</p>
        )}
        {symbol_exp_rate !== "0%" && (
          <p className="text-white">경험치 획득량 : +{symbol_exp_rate}</p>
        )}
        {symbol_meso_rate !== "0%" && (
          <p className="text-white">메소 획득량 : +{symbol_meso_rate}</p>
        )}
        {symbol_drop_rate !== "0%" && (
          <p className="text-white">아이템 드롭률 : +{symbol_drop_rate}</p>
        )}
        {symbol_hp !== "0" && <p className="text-white">HP: +{symbol_hp}</p>}
        {symbol_str !== "0" && <p className="text-white">STR: +{symbol_str}</p>}
        {symbol_int !== "0" && <p className="text-white">INT: +{symbol_int}</p>}
        {symbol_dex !== "0" && <p className="text-white">DEX: +{symbol_dex}</p>}
        {symbol_luk !== "0" && <p className="text-white">LUK: +{symbol_luk}</p>}
        {symbol_force !== "0" && (
          <p className="text-white">{`${forceLabel} : +${symbol_force}`}</p>
        )}
      </div>
      <Divider />
      <div className="flex text-xs font-light whitespace-pre-wrap text-white">
        {symbol_description}
      </div>
    </>
  );
};
