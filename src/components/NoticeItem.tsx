import dayjs from "dayjs";
import Link from "next/link";

type Props = {
  title: string;
  url: string;
  date: string;
  endDate?: string;
  type: "normal" | "event" | "update";
};

const badgeColor = {
  normal: "bg-sky-300",
  event: "bg-pink-300",
  update: "bg-lime-300",
};

const typeInitial = {
  normal: "N",
  event: "E",
  update: "U",
};

export const NoticeItem = (props: Props) => {
  const { title, url, date, endDate = "", type } = props;
  const formattedStartDate = dayjs(new Date(date)).format("YYYY-MM-DD");
  const formattedEndDate = !!endDate
    ? dayjs(new Date(endDate)).format("YYYY-MM-DD")
    : "";
  const formattedDate = !!formattedEndDate
    ? `${formattedStartDate} ~ ${formattedEndDate}`
    : `${formattedStartDate}`;

  return (
    <Link href={url} target="_blank">
      <div
        className="flex flex-row items-center rounded-lg gap-2 px-2 pt-2 pb-2 cursor-pointer
        hover:bg-slate-100
      dark:bg-[#1f2024] dark:hover:bg-[#292a30]"
      >
        <div
          className={`flex px-1 text-black pt-0.25 pb-0.25 font-bold rounded-md text-xs ${badgeColor[type]}`}
        >
          {typeInitial[type]}
        </div>
        <div className="flex flex-col gap-1">
          <p className="flex text-sm font-medium">{title}</p>
          <p className="flex text-xs opacity-55">{formattedDate}</p>
        </div>
      </div>
    </Link>
  );
};
