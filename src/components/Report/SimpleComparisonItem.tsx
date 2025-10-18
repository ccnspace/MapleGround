interface SimpleComparisonItemProps {
  name: string;
  firstPerson: string;
  secondPerson: string;
  isWinner: "first" | "second" | "draw";
}

export const SimpleComparisonItem = ({ name, firstPerson, secondPerson, isWinner }: SimpleComparisonItemProps) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 border border-slate-100 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-all duration-300">
      <div className="grid grid-cols-3 items-center gap-2">
        {/* 왼쪽 수치 */}
        <div className="flex flex-col items-center">
          <div
            className={`text-xs font-semibold ${
              isWinner === "first" ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {firstPerson}
          </div>
        </div>

        {/* 중앙 영역 */}
        <div className="flex flex-col items-center gap-1">
          {/* 항목명 */}
          <div className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{name}</div>

          {/* WIN 라벨 */}
          {isWinner === "first" && (
            <div className="px-1.5 py-0.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[10px] font-medium rounded-full">
              과거 WIN
            </div>
          )}
          {isWinner === "second" && (
            <div className="px-1.5 py-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[10px] font-medium rounded-full">
              현재 WIN
            </div>
          )}
        </div>

        {/* 오른쪽 수치 */}
        <div className="flex flex-col items-center">
          <div
            className={`text-xs font-semibold ${
              isWinner === "second" ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {secondPerson}
          </div>
        </div>
      </div>
    </div>
  );
};
