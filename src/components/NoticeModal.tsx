"use client";

import { useNoticeModalStore } from "@/stores/noticeModal";
import { DimmedLayer } from "./DimmedLayer";
import { useShallow } from "zustand/shallow";
import { NewLabel } from "./NewLabel";

const NOTICE_DATA = [
  {
    date: "2026.01.25",
    data: `전반적인 사이트 디자인을 심플하게 개선하였습니다.
    경험치 효율 계산기는 닉네임을 입력하지 않아도 사용할 수 있게 수정했습니다.`,
  },
  {
    date: "2026.01.21",
    data: `경험치 효율 계산기의 데이터를 업데이트했습니다. (25.12.18 업데이트 기준)`,
  },
  {
    date: "2025.10.10",
    data: `전반적인 사이트 디자인이 개선되었습니다.`,
  },
  {
    date: "2025.10.09",
    data: `적용 중인 세트 효과를 보여주는 영역이 추가되었습니다.
      경험치 효율 계산기에 악몽선경 데이터가 추가되었습니다.
      경험치 효율 계산기와 무기 해방 날짜 계산기를 페이지로 분리하였습니다. 사이드바에서 만나보세요!`,
  },
  {
    date: "2025.10.08",
    data: `캐릭터 이미지 크기가 전반적으로 어색하게 출력되는 문제를 수정했습니다.`,
  },
  {
    date: "2025.06.29",
    data: `과거 vs 현재 비교 시 아이템 옵션 가중치가 잘못 적용되는 문제를 수정했습니다.`,
  },
  {
    date: "2025.06.25",
    data: `[신규] 과거 vs 현재 비교 컨텐츠가 추가되었습니다!`,
  },
  {
    date: "2025.06.23",
    data: `에픽던전 2단계 배수가 잘못 적혀 있는 문제를 수정했습니다.
      제네시스 해방 날짜 계산의 보유 어둠의 흔적을 입력하다가 지울 때 발생하는 버그를 수정했습니다.`,
  },
  {
    date: "2025.06.20",
    data: `엠블렘 잠재능력 데이터를 업데이트했습니다. 잠재능력 시뮬레이터에서 즐겨 주세요!
      잠재능력 데이터의 표기 방식을 최신화했습니다.`,
  },
  {
    date: "2025.06.15",
    data: `스타포스 시뮬레이터 자동 모드 체크 해제 시에도 종료되도록 수정됩니다.
      스타포스 시뮬레이터 자동 모드에서 성공했는데도 가끔 Success 라벨이 나오지 않는 이슈를 수정했습니다.`,
  },
  {
    date: "2025.06.13",
    data: `모바일에서 시뮬레이터가 제대로 보이지 않는 이슈를 수정했습니다.`,
  },
] as const;

export const NoticeModal = () => {
  const isModalOpen = useNoticeModalStore(useShallow((state) => state.isModalOpen));
  const closeNoticeModal = useNoticeModalStore(useShallow((state) => state.closeNoticeModal));

  if (!isModalOpen) return null;

  return (
    <>
      <div className="modal_container">
        <div
          className="modal flex shrink-0 w-[520px] max-[600px]:w-[320px] absolute left-[45%] top-[25%] flex-col
         bg-white/90 dark:bg-[#2c2e38]/80 shadow rounded-lg gap-2 px-3 pt-3 pb-6
         backdrop-blur-sm
         "
        >
          <div className="flex justify-between items-center">
            <p className="text-md font-bold">📢 업데이트 공지사항</p>
            <button
              className="text-sm font-bold bg-slate-400/40 hover:bg-slate-400/60 rounded-md px-2 py-1"
              onClick={() => closeNoticeModal()}
            >
              닫기
            </button>
          </div>
          <div
            className="flex whitespace-pre-wrap text-[16px] pt-2 pb-2 font-medium max-h-[500px]
          max-[600px]:max-h-[400px] overflow-y-scroll"
          >
            <ul className="flex flex-col gap-4 items-baseline w-full">
              {NOTICE_DATA.map((item, index) => (
                <li key={item.data} className="flex flex-col gap-1">
                  <div className="flex gap-1 text-xs rounded-md font-bold p-1 bg-slate-800/10 dark:bg-slate-400/20 w-fit">
                    {item.date}
                    {index === 0 && <NewLabel />}
                  </div>
                  <div className="text-sm max-[600px]:text-xs">
                    {item.data.split("\n").map((line) => (
                      <p key={line}>{`· ${line.trim()}`}</p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <DimmedLayer style={{ zIndex: 10000 }} />
    </>
  );
};
