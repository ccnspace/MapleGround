"use client";

import Link from "next/link";
import { useCurrentPage } from "@/hooks/useCurrentPage";

type Props = {
  title: string;
  src: string;
};

export const TabItem = ({ title, src }: Props) => {
  const isCurrentPage = useCurrentPage({ src });

  return (
    <Link href={src}>
      <button
        className={`px-3 py-1.5 text-[15px] rounded-xl border border-black/80 dark:border-white/60
        hover:bg-black/90 hover:text-white dark:hover:bg-white/90 dark:hover:text-black
        font-bold transition-all duration-200
    ${isCurrentPage ? "bg-black/90 text-white dark:bg-white/90 dark:text-black" : "bg-white text-black dark:bg-black/90 dark:text-white"}`}
      >
        <p>{title}</p>
      </button>
    </Link>
  );
};
