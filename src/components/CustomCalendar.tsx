"use client";

import dayjs from "dayjs";
import Calendar, { type CalendarProps } from "react-calendar";
import { NextIcon } from "./svg/NextIcon";
import { PrevIcon } from "./svg/PrevIcon";
import { pretendard } from "@/app/fonts/pretendard";

export type DatePiece = Date | null;
export type SelectedDate = DatePiece | [DatePiece, DatePiece];

export const CustomCalendar = (props: CalendarProps) => {
  return (
    <Calendar
      {...props}
      className={pretendard.className}
      prev2Label={null}
      next2Label={null}
      locale="en-us"
      formatMonth={(_locale, date) => dayjs(date).format("MM월")}
      formatMonthYear={(_locale, date) => dayjs(date).format("YYYY년 MM월")}
      nextLabel={<NextIcon />}
      prevLabel={<PrevIcon />}
    />
  );
};
