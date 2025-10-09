import { type MissionBossConfig } from "@/utils/genesis";

type Props = {
  bossName: string;
  config: MissionBossConfig;
  onChange: (newConfig: MissionBossConfig) => void;
};

export const GenesisMissionBossSelector: React.FC<Props> = ({ bossName, config, onChange }) => {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md bg-slate-400/30 dark:bg-white/20 hover:bg-slate-300/70 dark:hover:bg-white/10 transition-colors text-xs">
      <p className="min-w-[64px] font-bold text-gray-900 dark:text-gray-100">{bossName}</p>
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
    </div>
  );
};
