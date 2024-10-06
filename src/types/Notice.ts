export type NoticeItem = {
  title: string;
  url: string;
  notice_id: number;
  date: string;
};
export type Notice = {
  notice: NoticeItem[];
};
export type UpdateNotice = {
  update_notice: NoticeItem[];
};

export type EventNoticeItem = NoticeItem & {
  date_event_start: string;
  date_event_end: string;
};
export type EventNotice = {
  event_notice: EventNoticeItem[];
};
