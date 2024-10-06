"use client";

import { getAllNotices } from "@/apis/getAllNotices";
import { useNoticeStore } from "@/stores/notice";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { NoticeItem } from "./NoticeItem";

const Skeleton = () => (
  <>
    <div className="animate-pulse flex gap-2 flex-col">
      <p className="flex rounded-md bg-[#ebedf1] dark:bg-[#242424] w-24 h-5"></p>
      <p className="flex rounded-md bg-[#ebedf1] dark:bg-[#242424] w-full h-5"></p>
    </div>
  </>
);

export const NoticeContainer = () => {
  const notices = useNoticeStore(useShallow((state) => state.notices));

  useEffect(() => {
    if (notices) return;
    const requestNotices = async () => {
      const response = await getAllNotices();
      useNoticeStore.getState().setNotice(response);
    };
    requestNotices();
  }, [notices]);

  if (!notices) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col rounded-lg px-2 pt-2 pb-2 gap-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {notices?.event.map((item) => (
        <NoticeItem
          key={item.notice_id}
          title={item.title}
          url={item.url}
          date={item.date_event_start}
          endDate={item.date_event_end}
          type="event"
        />
      ))}
      <p className="flex border-b border-b-gray-200 dark:border-b-[#2e2e2e]" />
      {notices?.update.map((item) => (
        <NoticeItem
          key={item.notice_id}
          title={item.title}
          url={item.url}
          date={item.date}
          type="update"
        />
      ))}
      <p className="flex border-b border-b-gray-200 dark:border-b-[#2e2e2e]" />
      {notices?.normal.map((item) => (
        <NoticeItem
          key={item.notice_id}
          title={item.title}
          url={item.url}
          date={item.date}
          type="normal"
        />
      ))}
    </div>
  );
};
