"use client";

import { CalendarIcon } from "@/components/svg/CalendarIcon";
import Image from "next/image";
import pesronShadow from "@/images/1.png";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { CustomCalendar } from "@/components/CustomCalendar";
import { useVersusStore } from "@/stores/versus";
import { useShallow } from "zustand/shallow";

type Props = {
  type: "first" | "second";
  direction?: "left" | "right";
  characterImageUrl?: string;
};

export type DatePiece = Date | null;
export type SelectedDate = DatePiece | [DatePiece, DatePiece];

export const CharacterCard = ({
  type,
  direction,
  characterImageUrl,
}: Props) => {
  const { setPersonDate } = useVersusStore(
    useShallow((state) => ({
      setPersonDate: state.setPersonDate,
    }))
  );

  const [showCalendar, setCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<SelectedDate>(new Date());
  const displayedDate = dayjs(
    Array.isArray(selectedDate) ? selectedDate[0] : selectedDate
  ).format("YYYY-MM-DD");

  const checkFutureDate = (value: Date | null) => {
    if (value && value > new Date(Date.now())) return true;
    return false;
  };

  const patternStyle = characterImageUrl
    ? "conic-gradient(#d0caeb 25%, #c7c0e7 25% 50%, #d0caeb 50% 75%, #c7c0e7 75%)"
    : "conic-gradient(#dfe6ee 25%, #e6ebf1 25% 50%, #dfe6ee 50% 75%, #e6ebf1 75%)";

  useEffect(() => {
    setPersonDate(type, dayjs(selectedDate as Date).format("YYYY-MM-DD"));
  }, [selectedDate, type]);

  return (
    <div
      style={{
        backgroundImage: patternStyle,
        backgroundSize: "30px 30px",
      }}
      className="flex bg-[length:30px_30px] items-center justify-center flex-col
      px-3 pt-3 pb-3 w-full h-full min-h-[368px] relative 
   bg-slate-300 border-2 border-slate-400
   rounded-lg"
    >
      <div
        onClick={() => setCalendar((prev) => !prev)}
        className={`flex justify-center gap-1 rounded-lg bg-slate-500
    border border-slate-400 px-2 pt-2 pb-2 w-full cursor-pointer
    hover:bg-slate-600 transition-colors`}
      >
        <CalendarIcon />
        <span className="flex text-lg text-white font-bold">
          {displayedDate}
        </span>
      </div>
      {showCalendar && (
        <div className={`absolute top-[64px] z-10`}>
          <CustomCalendar
            calendarType="gregory"
            onChange={(value) => {
              if (checkFutureDate(value as Date)) return;
              setSelectedDate(value);
              setCalendar(false);
            }}
            value={selectedDate}
          />
        </div>
      )}
      <div className="flex mt-2 min-h-[368px] min-w-[360px] justify-center">
        <Image
          className="flex"
          style={{
            imageRendering: "pixelated",
            ...(direction === "left" ? { transform: "scale(-1, 1)" } : {}),
          }}
          src={characterImageUrl ?? pesronShadow}
          alt="person"
          unoptimized
          width={characterImageUrl ? 368 : 240}
          height={368}
        />
      </div>
    </div>
  );
};
