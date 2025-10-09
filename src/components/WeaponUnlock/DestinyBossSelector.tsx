import { type Boss, type BossConfig, calculateBossTrace } from "@/utils/destiny";

type Props = {
  boss: Boss;
  config: BossConfig;
  onChange: (newConfig: BossConfig) => void;
};

export const DestinyBossSelector: React.FC<Props> = ({ boss, config, onChange }) => {
  const trace = calculateBossTrace(config, boss);

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-slate-400/30 dark:bg-white/20 hover:bg-slate-300/70 dark:hover:bg-white/10 transition-colors text-xs">
      <input
        type="checkbox"
        checked={config.isSelected}
        onChange={(e) => onChange({ ...config, isSelected: e.target.checked })}
        className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 rounded 
            border-gray-300 dark:border-gray-600 
            focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-1
            bg-white dark:bg-gray-700"
      />
      <p className="min-w-[64px] font-bold text-gray-900 dark:text-gray-100">{boss.name}</p>
      <select
        value={config.difficulty}
        onChange={(e) => onChange({ ...config, difficulty: e.target.value })}
        className="h-6 w-20 px-1 rounded border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
            focus:border-indigo-500 dark:focus:border-indigo-400 
            focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-1"
      >
        {boss.availableDifficulties.map((diff) => (
          <option key={diff} value={diff}>
            {diff}
          </option>
        ))}
      </select>
      <select
        value={config.partySize}
        onChange={(e) => onChange({ ...config, partySize: Number(e.target.value) })}
        className="h-6 w-12 px-1 rounded border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
            focus:border-indigo-500 dark:focus:border-indigo-400 
            focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-1"
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <option key={n} value={n}>
            {n}인
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={config.firstWeekCleared}
          onChange={(e) => onChange({ ...config, firstWeekCleared: e.target.checked })}
          className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 rounded 
              border-gray-300 dark:border-gray-600 
              focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-1
              bg-white dark:bg-gray-700"
        />
        <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">클리어</span>
      </div>
      <div className="ml-auto flex items-center gap-1 text-gray-900 dark:text-gray-100">
        <span className="font-medium text-indigo-600 dark:text-indigo-300">{trace}</span>
      </div>
    </div>
  );
};
