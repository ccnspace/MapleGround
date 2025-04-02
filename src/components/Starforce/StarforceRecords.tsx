export const StarforceRecords = ({
  records,
  clearRecords,
  destroyCount,
}: {
  records: string[];
  clearRecords: () => void;
  destroyCount: number;
}) => {
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
        <div className="flex flex-col gap-1 bg-slate-900/70 rounded-md p-1 text-sm text-white">
          <p>💥 파괴: {destroyCount}회</p>
        </div>
        <div className="flex break-words overflow-y-scroll h-[100%] flex-col gap-1 bg-black/60 rounded-md p-2 text-xs text-white">
          {records.map((item, idx) => (
            <p key={idx}>·{item}</p>
          ))}
        </div>
        <div
          className="flex flex-col min-w-[214px] gap-0.5 text-[13px]
        bg-gradient-to-br from-slate-500 to-slate-600 rounded-md p-1.5"
        >
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
