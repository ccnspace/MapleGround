import { useEffect, useMemo, useRef } from "react";
import type { StarforceRecord } from "@/components/Container/StarforceContainer";
import { formatKoreanNumber } from "@/utils/formatKoreanNum";

export const StarforceRecords = ({
  records,
  clearRecords,
  destroyCount,
}: {
  records: StarforceRecord[];
  clearRecords: () => void;
  destroyCount: number;
}) => {
  const recordContainerRef = useRef<HTMLDivElement>(null);

  const averageDestroyCount = useMemo(() => {
    if (records.length === 0) return "0";
    const totalDestroyCount = records.reduce((acc, curr) => acc + curr.destroyCount, 0);
    return (totalDestroyCount / records.length).toFixed(2);
  }, [records]);

  const averageAccumulatedCost = useMemo(() => {
    if (records.length === 0) return "0";
    const totalAccumulatedCost = records.reduce((acc, curr) => acc + curr.accumulatedCost, 0);
    const averageAccumulatedCost = Math.floor(totalAccumulatedCost / records.length);
    return formatKoreanNumber(averageAccumulatedCost);
  }, [records]);

  const makeRecordString = (record: StarforceRecord) => {
    return `${record.initialStarforce}성 시작 -> ${record.targetStarforce}성 도달 (${record.attempts}번 시도, ${
      record.destroyCount
    }번 파괴, ${formatKoreanNumber(record.accumulatedCost)}메소 소모)`;
  };

  useEffect(() => {
    if (recordContainerRef.current) {
      recordContainerRef.current.scrollTop = recordContainerRef.current.scrollHeight;
    }
  }, [records]);

  return (
    <div
      className={`flex p-2 flex-col gap-1 text-white rounded-lg
bg-black/70 border border-white/30 w-[300px]`}
    >
      <div className="flex flex-col gap-1 h-full">
        <div className="flex flex-col items-center">
          <p
            className="flex flex-row justify-between items-center text-sm w-full font-bold
            mb-1 bg-white/20 p-1 rounded-md text-white"
          >
            ⏱️ 스타포스 기록실
            <button
              onClick={clearRecords}
              className="flex justify-center text-xs px-1.5 pt-0.5 pb-0.5
        bg-slate-700 hover:bg-slate-900 rounded-md p-0.5 font-bold"
            >
              ↻초기화
            </button>
          </p>
        </div>
        <div className="flex flex-col gap-1 bg-slate-900/70 rounded-md p-1 text-[13px] text-white">
          <p>💥 현재 파괴 횟수: {destroyCount}회</p>
          <p>💥 [자동] 평균 파괴: {averageDestroyCount}회</p>
          <p>💸 [자동] 평균 메소: {averageAccumulatedCost}</p>
        </div>
        <div
          ref={recordContainerRef}
          className="flex break-words overflow-y-scroll h-[240px] flex-col gap-1 bg-black/60 rounded-md p-2 text-xs text-white"
        >
          {records.map((item, idx) => (
            <p key={idx}>·{makeRecordString(item)}</p>
          ))}
        </div>
        <div
          className="flex flex-col min-w-[192px] gap-0.5 text-[13px]
        bg-gradient-to-br from-slate-500 to-slate-600 rounded-md p-1.5"
        >
          <p>
            - 파괴방지는 <span className="text-lime-300 text-bold">15~17성</span>일 때만 적용되며{" "}
            <span className="text-lime-300 text-bold">2배의 메소</span>가 필요합니다.
          </p>
          <p>
            - <span className="text-lime-300 text-bold">22성 이상</span>부터는{" "}
            <span className="text-lime-300 text-bold">샤타포스가 적용되지 않습니다.</span>
          </p>
          <p>
            - 스타캐치는 성공 확률을 <span className="text-lime-300 text-bold">1.05배</span> 증가시킵니다.
          </p>
          <p>
            - 자동 모드 상태에서 <b>목표 스타포스 수치를 변경</b>하거나 <b>목표치 달성 시</b> 누적 메소, 시도 횟수, 파괴 횟수가
            초기화됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
