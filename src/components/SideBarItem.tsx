import Link from "next/link";
import type { SideBarItemType } from "./SideBar";

type Props = {
  icon: string;
  title: string;
  src: string;
  isUpdated: boolean;
};

export const SideBarItem = ({ icon, title, src, isUpdated }: Props) => {
  // 빈 src인 경우 비활성화된 상태로 표시
  const isDisabled = !src || src === "";

  if (isDisabled) {
    return (
      <li className="flex gap-3 items-center mx-4 my-1 px-4 py-3 rounded-xl cursor-not-allowed opacity-50 bg-slate-100 dark:bg-slate-800/40">
        <div className="text-slate-400 dark:text-slate-500">{icon}</div>
        <span className="font-bold text-slate-400 dark:text-slate-500">{title}</span>
        {isUpdated && <span className="ml-auto px-2 py-0.5 text-xs font-bold text-white bg-red-400 rounded-full">UPDATED</span>}
      </li>
    );
  }

  return (
    <Link href={src}>
      <li className="flex gap-3 items-center mx-4 my-1 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800/60 hover:shadow-sm group">
        <div className="text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors duration-200">
          {icon}
        </div>
        <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200">
          {title}
        </span>
        {isUpdated && (
          <span className="ml-auto px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm group-hover:bg-red-600 transition-colors duration-200">
            UPDATED
          </span>
        )}
      </li>
    </Link>
  );
};
