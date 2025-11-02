import Link from "next/link";
import type { SideBarItemType } from "./SideBar";
import { usePathname } from "next/navigation";

type Props = {
  icon: string;
  title: string;
  src: string;
  isUpdated: boolean;
  className?: string;
};

export const SideBarItem = ({ icon, title, src, isUpdated, className }: Props) => {
  // 빈 src인 경우 비활성화된 상태로 표시
  const isDisabled = !src || src === "";
  const pathname = usePathname();
  const sidebarPath = new URL(`${window.location.origin}${src}`).pathname;
  const isCurrentPage = pathname === sidebarPath;

  if (isDisabled) {
    return (
      <li
        className={`flex gap-3 items-center my-1 px-4 py-3 rounded-xl cursor-not-allowed opacity-50 bg-white/30 dark:bg-black/30 ${className}`}
      >
        <div className="text-black/50 dark:text-white/50">{icon}</div>
        <span className="font-bold text-black/70 dark:text-white/50">{title}</span>
        {isUpdated && <span className="ml-auto px-2 py-0.5 text-xs font-bold text-white bg-red-400 rounded-full">UPDATED</span>}
      </li>
    );
  }

  return (
    <Link href={src}>
      <li
        className={`flex gap-3 items-center my-1 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200
          ${isCurrentPage ? "bg-white/90 ring-2 ring-inset ring-slate-600 dark:ring-2 dark:ring-inset dark:ring-sky-200" : ""}
       bg-white/50 hover:bg-white/90 dark:bg-black/40 dark:hover:bg-black/60 hover:shadow-sm group ${className}`}
      >
        <div className="text-slate-600 dark:text-slate-300">{icon}</div>
        <span className="font-bold text-black dark:text-white transition-colors duration-200">{title}</span>
        {isUpdated && (
          <span className="ml-auto px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm group-hover:bg-red-600 transition-colors duration-200">
            UPDATED
          </span>
        )}
      </li>
    </Link>
  );
};
