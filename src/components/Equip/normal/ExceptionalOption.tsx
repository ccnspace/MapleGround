import type { ExceptionalOption } from "@/types/Equipment";
import { Divider } from "../Divider";
import { useEffect } from "react";
import { useState } from "react";

const isAllValidStat = (...args: string[]) => {
  return args.every((item) => item !== "0");
};

export const ExceptionalOptionComponent = ({ options }: { options: ExceptionalOption }) => {
  const { str, dex, int, luk, max_hp, max_mp, attack_power, magic_power } = options;
  const [optionDescription, setOptionDescription] = useState<string[]>([]);

  useEffect(() => {
    if (isAllValidStat(str, dex, int, luk) && [str, dex, int, luk].every((item) => item === str)) {
      setOptionDescription((prev) => [...prev, `올스탯 : +${str}`]);
    } else if (isAllValidStat(str, dex, int, luk)) {
      setOptionDescription((prev) => [...prev, `STR : +${str}`, `DEX : +${dex}`, `INT : +${int}`, `LUK : +${luk}`]);
    }

    if (isAllValidStat(max_hp, max_mp) && [max_hp, max_mp].every((item) => item === max_hp)) {
      setOptionDescription((prev) => [...prev, `최대 HP / 최대 MP: +${max_mp}`]);
    } else if (isAllValidStat(max_hp, max_mp)) {
      setOptionDescription((prev) => [...prev, `최대 HP : +${max_hp}`, `최대 MP : +${max_mp}`]);
    }

    if (isAllValidStat(attack_power, magic_power) && [attack_power, magic_power].every((item) => item === attack_power)) {
      setOptionDescription((prev) => [...prev, `공격력 / 마력 : +${magic_power}`]);
    } else if (isAllValidStat(attack_power, magic_power)) {
      setOptionDescription((prev) => [...prev, `공격력 : +${attack_power}`, `마력 : +${magic_power}`]);
    }
  }, [options]);

  return (
    <>
      <Divider />
      <div className="flex flex-col text-xs font-medium text-white whitespace-pre-wrap gap-[1px]">
        <p className={`text-red-600 text-xs flex gap-1`}>
          <span className="text-[10px] text-white bg-red-600/70 rounded-md px-1">EX</span>익셉셔널
        </p>
        {optionDescription.map((item, i) => (
          <p key={i}>{item}</p>
        ))}
      </div>
    </>
  );
};
