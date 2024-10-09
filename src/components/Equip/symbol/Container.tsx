import type { SymbolOption } from "@/types/SymbolEquipment";

type Props = {
  item: SymbolOption;
};
export const SymbolContainer = ({ item }: Props) => {
  const { symbol_name } = item;

  return <div>{symbol_name}</div>;
};
