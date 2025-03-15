import Link from "next/link";
import type { SideBarItemType } from "./SideBar";

type Props = {
  item: SideBarItemType;
};

export const SideBarItem = ({ item }: Props) => {
  const { icon, title, src } = item;
  return (
    <Link href={src}>
      <li
        className="flex gap-2 text-base dark:text-white/80 items-center mx-5 mt-4 mb-4 px-3 pt-2 pb-2 
      rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/30"
      >
        {icon}
        <span className="font-medium">{title}</span>
      </li>
    </Link>
  );
};
