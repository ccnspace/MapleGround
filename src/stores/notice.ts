import {
  EventNotice,
  EventNoticeItem,
  Notice,
  NoticeItem,
  UpdateNotice,
} from "@/types/Notice";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface NoticeState {
  notices: {
    normal: NoticeItem[];
    event: EventNoticeItem[];
    update: NoticeItem[];
  } | null;
  setNotice: (notices: {
    normal: Notice;
    event: EventNotice;
    update: UpdateNotice;
  }) => void;
}

export const useNoticeStore = create<NoticeState>()(
  devtools((set) => ({
    notices: null,
    setNotice: (notices) => {
      const { normal, event, update } = notices;
      const newNotices = {
        event: event.event_notice.slice(0, 5),
        update: update.update_notice.slice(0, 4),
        normal: normal.notice.slice(0, 4),
      };
      set({ notices: newNotices });
    },
  }))
);
