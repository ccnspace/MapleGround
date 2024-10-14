"use client";

export const AbilityContainer = () => {
  const getActivePresetStyle = (_preset: number) => {
    // if (preset === _preset)
    //   return `text-black dark:text-white underline decoration-2 underline-offset-4 decoration-black/60 dark:decoration-white/80
    // `;
    return `text-slate-500 underline decoration-2 underline-offset-4 decoration-transparent
    hover:decoration-slate-400
    `;
  };

  return (
    <div
      className="flex shrink-0 min-w-96 flex-col bg-slate-100 dark:bg-[#1f2024] px-3 pt-3 pb-3
    border-2 border-slate-200 dark:border-[#1f2024] rounded-lg gap-1"
    >
      <div className="flex justify-between mb-2">
        <p
          className="flex font-extrabold text-base mb-2 px-2 pb-0.5 pt-0.5 
              border-l-4 border-l-green-400/80
             "
        >
          어빌리티
        </p>
        <div
          className="flex font-bold flex-row gap-3 text-sm mb-2 px-1 pb-1 pt-1
            rounded-md bg-slate-200 dark:bg-[#121212]/60"
        >
          <button
            onClick={() => {}}
            className={`flex text-xs px-1 pt-0.5 pb-0.5 ${getActivePresetStyle(
              1
            )}`}
          >
            1번 프리셋
          </button>
          <button
            onClick={() => {}}
            className={`flex rounded-md text-xs px-1 pt-0.5 pb-0.5 ${getActivePresetStyle(
              2
            )}`}
          >
            2번 프리셋
          </button>
          <button
            onClick={() => {}}
            className={`flex rounded-md text-xs px-1 pt-0.5 pb-0.5 text-slate-500 ${getActivePresetStyle(
              3
            )}`}
          >
            3번 프리셋
          </button>
        </div>
      </div>
    </div>
  );
};
