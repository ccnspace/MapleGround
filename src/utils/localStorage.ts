import { type BossConfig as GenesisBossConfig, type MissionBossConfig as GenesisMissionBossConfig } from "./genesis";
import { type BossConfig as DestinyBossConfig, type MissionBossConfig as DestinyMissionBossConfig } from "./destiny";

export type GenesisUnlockData = {
  startDate: string;
  baseTrace: number;
  missionStep: number;
  bossConfig: GenesisBossConfig[];
  missionConfig: GenesisMissionBossConfig[];
};

export type DestinyUnlockData = {
  startDate: string;
  baseTrace: number;
  missionStep: number;
  bossConfig: DestinyBossConfig[];
  missionConfig: DestinyMissionBossConfig[];
};

export type LocalStorageData = {
  bookmark: string[];
  genesisUnlock: Record<string, Partial<GenesisUnlockData>>;
  destinyUnlock: Record<string, Partial<DestinyUnlockData>>;
};

export type LocalStorageKey = keyof LocalStorageData;

export const getLocalStorage = <T extends LocalStorageKey>(key: T): LocalStorageData[T] | null => {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

export const setLocalStorage = <T extends LocalStorageKey>(key: T, value: LocalStorageData[T]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeLocalStorage = (key: LocalStorageKey) => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
};
