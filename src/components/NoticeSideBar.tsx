"use client";

import { useEffect, useState } from "react";
import { NoticeContainer } from "./Container/NoticeContainer";
import { RightIcon } from "./svg/RightIcon";
import { LeftIcon } from "./svg/LeftIcon";

export const NoticeSideBar = () => {
  const [isFold, setFold] = useState<boolean>(true);

  useEffect(() => {
    setFold(localStorage.getItem("foldStatus") === "fold");
  }, []);

  const handleClick = () => {
    const foldStatus = localStorage.getItem("foldStatus");
    if (foldStatus === "fold") {
      setFold(false);
      localStorage.setItem("foldStatus", "unfold");
    } else {
      setFold(true);
      localStorage.setItem("foldStatus", "fold");
    }
  };

  return (
    <div
      className={`flex-shrink-0 relative bg-white dark:bg-[#121212]
      shadow-xl ml-auto
      px-4 ${isFold ? "w-0" : "w-80"} pt-3 pb-3
      font-medium text-lg`}
    >
      <button
        onClick={handleClick}
        className="absolute top-1/2 -left-3 flex justify-center shadow pt-3 pb-3 rounded-lg
        bg-white dark:bg-[#222222] cursor-pointer"
      >
        {!isFold ? <RightIcon /> : <LeftIcon />}
      </button>
      {!isFold && <NoticeContainer />}
    </div>
  );
};
