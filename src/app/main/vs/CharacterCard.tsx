"use client";

import { CalendarIcon } from "@/components/svg/CalendarIcon";
import Image from "next/image";
import personShadow from "@/images/1.png";
import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { useVersusStore } from "@/stores/versus";
import { useShallow } from "zustand/shallow";

type Props = {
  type: "first" | "second";
  direction?: "left" | "right";
  characterImageUrl?: string;
  nickname?: string;
  resetReport: () => void;
};

export type DatePiece = Date | null;
export type SelectedDate = DatePiece | [DatePiece, DatePiece];

export const CharacterCard = ({ type, direction, characterImageUrl, nickname, resetReport }: Props) => {
  const { setPersonDate } = useVersusStore(
    useShallow((state) => ({
      setPersonDate: state.setPersonDate,
    }))
  );

  const [selectedDate, setSelectedDate] = useState<SelectedDate>(new Date());
  const displayedDate = dayjs(Array.isArray(selectedDate) ? selectedDate[0] : selectedDate).format("YYYY-MM-DD");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const checkFutureDate = (value: Date | null) => {
    if (value && value > new Date(Date.now())) return true;
    return false;
  };

  useEffect(() => {
    setPersonDate(type, dayjs(selectedDate as Date).format("YYYY-MM-DD"));
  }, [selectedDate, type]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value);
    if (checkFutureDate(newDate)) return;
    setSelectedDate(newDate);
    resetReport();
  };

  const handleDivClick = () => {
    dateInputRef.current?.showPicker();
  };

  return (
    <div
      className="relative w-full h-full min-h-[368px] max-[600px]:min-h-[320px] rounded-2xl overflow-hidden
      bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 
      dark:from-slate-800 dark:via-slate-700 dark:to-slate-600
      border border-white/10
      shadow-xl hover:shadow-2xl transition-all duration-300 group"
    >
      {/* 상단 그라데이션 오버레이 */}
      <div
        className="absolute top-0 left-0 right-0 h-1/3 
        bg-gradient-to-b from-pink-500/20 via-orange-500/10 to-transparent"
      ></div>

      {/* 하단 그라데이션 오버레이 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 
        bg-gradient-to-t from-blue-500/20 via-purple-500/10 to-transparent"
      ></div>

      <div className="relative z-10 flex flex-col h-full p-4">
        {/* 날짜 선택기 */}
        <div
          onClick={handleDivClick}
          className="flex items-center justify-center gap-2 rounded-xl 
          bg-gradient-to-r from-slate-600 to-slate-700
          hover:from-slate-700 hover:to-slate-800
          border border-slate-500 px-3 py-2 w-full cursor-pointer
          transition-all duration-200 shadow-lg hover:shadow-xl
          backdrop-blur-sm bg-opacity-90"
        >
          <CalendarIcon />
          <span className="text-sm text-white font-semibold">{displayedDate}</span>
          <input
            ref={dateInputRef}
            type="date"
            value={displayedDate}
            onChange={handleDateChange}
            max={dayjs().format("YYYY-MM-DD")}
            className="absolute opacity-0 pointer-events-none"
          />
        </div>

        {/* 캐릭터 이미지 컨테이너 */}
        <div className="flex-1 flex flex-col items-center justify-center mt-4 pb-4 relative">
          {/* 이미지 배경 효과 */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent 
            dark:from-white/30 rounded-xl"
          />
          <div className="flex relative z-10 p-2 rounded-xl backdrop-blur-sm">
            {!characterImageUrl && (
              <Image
                className="flex max-[600px]:w-[200px] mt-20 mb-10"
                style={{
                  imageRendering: "pixelated",
                  ...(direction === "left" ? { transform: "scale(-1, 1)" } : {}),
                }}
                src={personShadow}
                alt="person"
                unoptimized
                width={130}
                height={300}
              />
            )}
            {characterImageUrl && (
              <div
                style={{
                  backgroundImage: `url(${characterImageUrl})`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  width: 300,
                  height: 300,
                  backgroundSize: "600px",
                  imageRendering: "pixelated",
                  ...(direction === "left" ? { transform: "scale(-1, 1)" } : {}),
                }}
              />
            )}
          </div>
          {nickname && (
            <div
              className="flex justify-center rounded-xl p-2 
              text-sm font-bold w-[200px] text-white bg-black/30"
            >
              {nickname}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
