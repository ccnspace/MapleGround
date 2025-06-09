import { memo } from "react";

interface RecordProps {
  records: string[];
  clearRecords: () => void;
}

export const Record = memo(({ records, clearRecords }: RecordProps) => (
  <div className="flex flex-col">
    <p
      className="flex flex-row justify-between items-center text-sm w-full font-bold mb-1
      bg-white/20 p-1 rounded-md text-white"
    >
      ⏱️ 기록실
      <button
        onClick={clearRecords}
        className="flex justify-center text-xs px-1.5 pt-0.5 pb-0.5
        bg-slate-700 hover:bg-slate-900 rounded-md p-0.5 font-bold"
      >
        ↻초기화
      </button>
    </p>
    <div className="flex break-words overflow-y-scroll h-[180px] flex-col gap-1 bg-black/60 rounded-md p-2 text-xs text-white">
      {records.map((item, idx) => (
        <p key={idx}>·{item}</p>
      ))}
    </div>
  </div>
));

Record.displayName = "Record";
