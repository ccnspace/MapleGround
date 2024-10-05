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
};

export type DatePiece = Date | null;
export type SelectedDate = DatePiece | [DatePiece, DatePiece];

export const CharacterCard = ({ type, direction }: Props) => {
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

  const alignStyle = direction === "right" ? "ml-auto" : "";
  const absoluteStyle = direction === "right" ? "right-3" : "";

  const checkFutureDate = (value: Date | null) => {
    if (value && value > new Date(Date.now())) return true;
    return false;
  };

  useEffect(() => {
    setPersonDate(type, dayjs(selectedDate as Date).format("YYYY-MM-DD"));
  }, [selectedDate, type]);

  return (
    <div
      style={{
        background:
          "conic-gradient(#dfe6ee 25%, #e6ebf1 25% 50%, #dfe6ee 50% 75%, #e6ebf1 75%)",
        backgroundSize: "30px 30px",
      }}
      className="flex flex-col px-3 pt-3 pb-3 w-full h-full relative 
   bg-slate-300 border-2 border-slate-400
   rounded-lg"
    >
      <div
        onClick={() => setCalendar((prev) => !prev)}
        className={`flex justify-center gap-1 rounded-lg bg-slate-500
    border border-slate-400 px-2 pt-2 pb-2 w-64 cursor-pointer
    hover:bg-slate-600 transition-colors ${alignStyle}`}
      >
        <CalendarIcon />
        <span className="flex text-lg text-white font-bold">
          {displayedDate}
        </span>
      </div>
      {showCalendar && (
        <div className={`absolute top-[64px] z-10 ${absoluteStyle}`}>
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
      <Image
        className={alignStyle}
        style={direction === "left" ? { transform: "scale(-1, 1)" } : {}}
        src={pesronShadow}
        alt="person"
        unoptimized
        width={256}
      />
    </div>
  );
};
