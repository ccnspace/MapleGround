/**
 * 메인 화면 상단 전광판에 표시되는 공지 목록.
 * 여기에 객체를 추가/수정하면 전광판 내용이 바뀐다.
 *
 * 필드
 *  - id: 고유 키 (React key 로 사용)
 *  - text: 본문. `[보여질 텍스트](URL)` 문법으로 인라인 하이퍼링크를 삽입 가능.
 *      예) "유니온 [자동 배치](/main/union) 기능이 추가되었습니다"
 *      URL 이 `http://` 또는 `https://` 로 시작하면 새 탭으로 열리는 외부 링크,
 *      그 외엔 내부 라우팅(Next.js `<Link>`) 으로 처리된다.
 *  - date: (선택) 'YYYY.MM.DD' 형식. 표시될 때 앞에 붙음.
 *  - type: (선택) 'update' | 'info' | 'warning' — 색상 강조용
 *  - link: (선택) 공지 전체를 클릭했을 때 이동할 URL. 인라인 링크를 쓰는 경우 보통 생략.
 */
export type NoticeType = "update" | "info" | "warning";

export type NoticeItem = {
  id: string;
  text: string;
  date?: string;
  type?: NoticeType;
  link?: string;
};

export const NOTICES: NoticeItem[] = [
  {
    id: "union-autoplace-2026-04",
    text: "[유니온 자동 배치](/main/union) 기능이 추가되었습니다. 인게임 UI처럼 직접 편집도 가능합니다.",
    date: "2026.04.12",
    type: "update",
  },
];
