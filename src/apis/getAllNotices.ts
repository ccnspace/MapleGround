import { apiFetcher } from "./apiFetcher";
import { EventNotice, Notice, UpdateNotice } from "@/types/Notice";

/** 일반 공지, 업데이트, 이벤트 공지를 불러오는 함수 */
export const getAllNotices = async () => {
  const [normal, update, event] = await Promise.all([
    apiFetcher<Notice>({ url: "/notice/normal" }),
    apiFetcher<UpdateNotice>({ url: "/notice/update" }),
    apiFetcher<EventNotice>({ url: "/notice/event" }),
  ]);

  return { normal, update, event };
};
