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
  {
    id: "union-autoplace-2026-04",
    text: "[주간 보스 정산](/main/boss) 기능이 추가되었습니다. 프리셋 기능으로 여러 캐릭터를 관리해 보세요.",
    date: "2026.04.14",
    type: "update",
  },
  {
    id: "astra-unlock-2026-05",
    text: "[아스트라 보조무기 해방 날짜 계산](/main/weapon) 기능이 추가되었습니다. 격전의 흔적과 에리온의 조각 누적을 시뮬레이션해 단계별 클리어 일자를 계산합니다.",
    date: "2026.05.03",
    type: "update",
  },
];
