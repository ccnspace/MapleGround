import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { BOSS_CRYSTAL_PRICES, getBossMaxPartySize, type BossDifficulty } from "@/constants/bossCrystals";

// 파티원 수 — 메이플 인게임 보스 파티 최대 6명 (솔로 = 1).
export const MIN_PARTY_SIZE = 1;
export const MAX_PARTY_SIZE = 6;

export type BossSelection = {
  enabled: boolean;
  difficulty: BossDifficulty;
  // 파티원 수. 메소가 1/n 로 분배되므로 수익 계산에 사용됨. undefined = 1 (솔로).
  partySize?: number;
};

// `enabled`/`difficulty` 없이 `partySize` 만 들고 있는 부분 객체에도 호출 가능하도록 시그니처는 느슨하게.
// bossName 을 넘기면 그 보스의 인게임 상한(`getBossMaxPartySize`) 으로 clamp 한다 — 기존 저장 데이터에
// 보스 상한보다 큰 값이 있어도 표시/계산 시 자동 보정된다.
export const effectivePartySize = (sel: { partySize?: number } | undefined | null, bossName?: string): number => {
  if (!sel) return 1;
  const n = sel.partySize ?? 1;
  if (!Number.isFinite(n) || n < MIN_PARTY_SIZE) return MIN_PARTY_SIZE;
  const cap = bossName ? getBossMaxPartySize(bossName) : MAX_PARTY_SIZE;
  if (n > cap) return cap;
  return Math.floor(n);
};

export type Selections = Record<string /* boss */, BossSelection>;

export type BossPreset = {
  id: string;
  name: string;
  selections: Selections;
  savedAt: number;
};

// 저장 가능 최대 프리셋 수
export const MAX_BOSS_PRESETS = 12;

type BossIncomeState = {
  // 사용자가 편집 중인 현재 선택 상태 (브라우저 단일 세트).
  current: Selections;
  // 저장된 프리셋 목록 (최신이 뒤쪽).
  presets: BossPreset[];
  // 현재 편집 중인 선택이 기반으로 삼은 프리셋 id. null = 아직 어느 프리셋도 불러온 적 없음.
  activePresetId: string | null;
};

type BossIncomeAction = {
  toggleBoss: (boss: string) => void;
  setDifficulty: (boss: string, difficulty: BossDifficulty) => void;
  // 보스의 파티원 수 변경 (1~6). 활성화되어 있지 않은 보스에도 미리 설정 가능.
  setPartySize: (boss: string, partySize: number) => void;
  // 여러 보스를 한 번에 enable/disable (일괄 선택/해제). difficulty 를 함께 지정하면 난이도도 설정.
  setBossesEnabled: (updates: Array<{ boss: string; enabled: boolean; difficulty?: BossDifficulty }>) => void;
  clearCurrent: () => void;
  savePreset: (name: string) => BossPreset | null;
  // 현재 활성 프리셋에 current 를 덮어쓴다. 활성 프리셋이 없으면 no-op.
  updateActivePreset: () => BossPreset | null;
  // 프리셋 이름 변경. 이름이 비었거나 다른 프리셋과 중복이면 false.
  renamePreset: (id: string, name: string) => boolean;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
};

// 난이도 우선순위 — 처음 활성화 시 기본 선택. 높은 난이도 우선.
const DIFFICULTY_PRIORITY: BossDifficulty[] = ["EXTREME", "CHAOS", "HARD", "NORMAL", "EASY"];

const pickDefaultDifficulty = (boss: string): BossDifficulty => {
  const available = BOSS_CRYSTAL_PRICES[boss] ?? {};
  for (const d of DIFFICULTY_PRIORITY) {
    if (available[d] !== undefined) return d;
  }
  return "NORMAL";
};

const cloneSelections = (selections: Selections): Selections => {
  const out: Selections = {};
  for (const [boss, sel] of Object.entries(selections)) out[boss] = { ...sel };
  return out;
};

// 두 Selections 가 "유의미하게" 같은지 비교. disabled 엔트리는 선택되지 않은 것과 동일하게 취급.
// 파티원 수도 비교에 포함 — 파티원만 바꿔도 "변경됨" 으로 인식되어야 함.
export const selectionsEqual = (a: Selections, b: Selections): boolean => {
  const entriesA = Object.entries(a).filter(([, s]) => s.enabled);
  const entriesB = Object.entries(b).filter(([, s]) => s.enabled);
  if (entriesA.length !== entriesB.length) return false;
  const mapB = new Map(entriesB);
  for (const [boss, sel] of entriesA) {
    const other = mapB.get(boss);
    if (!other || other.difficulty !== sel.difficulty) return false;
    if (effectivePartySize(sel) !== effectivePartySize(other)) return false;
  }
  return true;
};

const makeId = (): string => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const initialState: BossIncomeState = {
  current: {},
  presets: [],
  activePresetId: null,
};

export const useBossIncomeStore = create<BossIncomeState & BossIncomeAction>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        toggleBoss: (boss) => {
          const prev = get().current;
          const cur = prev[boss];
          const next: BossSelection = cur
            ? { ...cur, enabled: !cur.enabled }
            : { enabled: true, difficulty: pickDefaultDifficulty(boss) };
          set({ current: { ...prev, [boss]: next } });
        },
        setDifficulty: (boss, difficulty) => {
          const prev = get().current;
          const cur = prev[boss];
          // 기존 partySize 등 다른 필드는 보존.
          const next: BossSelection = { ...(cur ?? {}), enabled: cur?.enabled ?? true, difficulty };
          set({ current: { ...prev, [boss]: next } });
        },
        setPartySize: (boss, partySize) => {
          const cap = getBossMaxPartySize(boss);
          const clamped = Math.min(cap, Math.max(MIN_PARTY_SIZE, Math.floor(partySize)));
          const prev = get().current;
          const cur = prev[boss];
          const next: BossSelection = cur
            ? { ...cur, partySize: clamped }
            : { enabled: false, difficulty: pickDefaultDifficulty(boss), partySize: clamped };
          set({ current: { ...prev, [boss]: next } });
        },
        setBossesEnabled: (updates) => {
          const prev = get().current;
          const next: Selections = { ...prev };
          for (const { boss, enabled, difficulty } of updates) {
            const existing = next[boss];
            if (enabled) {
              next[boss] = {
                ...(existing ?? {}),
                enabled: true,
                difficulty: difficulty ?? existing?.difficulty ?? pickDefaultDifficulty(boss),
              };
            } else if (existing) {
              next[boss] = { ...existing, enabled: false };
            }
          }
          set({ current: next });
        },
        clearCurrent: () => set({ current: {}, activePresetId: null }),
        savePreset: (name) => {
          const trimmed = name.trim();
          if (!trimmed) return null;
          const { presets, current } = get();
          if (presets.length >= MAX_BOSS_PRESETS) return null;
          const preset: BossPreset = {
            id: makeId(),
            name: trimmed,
            selections: cloneSelections(current),
            savedAt: Date.now(),
          };
          set({ presets: [...presets, preset], activePresetId: preset.id });
          return preset;
        },
        updateActivePreset: () => {
          const { activePresetId, presets, current } = get();
          if (!activePresetId) return null;
          const idx = presets.findIndex((p) => p.id === activePresetId);
          if (idx === -1) return null;
          const updated: BossPreset = {
            ...presets[idx],
            selections: cloneSelections(current),
            savedAt: Date.now(),
          };
          const nextPresets = [...presets];
          nextPresets[idx] = updated;
          set({ presets: nextPresets });
          return updated;
        },
        renamePreset: (id, name) => {
          const trimmed = name.trim();
          if (!trimmed) return false;
          const { presets } = get();
          if (presets.some((p) => p.id !== id && p.name === trimmed)) return false;
          const idx = presets.findIndex((p) => p.id === id);
          if (idx === -1) return false;
          const next = [...presets];
          next[idx] = { ...next[idx], name: trimmed };
          set({ presets: next });
          return true;
        },
        loadPreset: (id) => {
          const preset = get().presets.find((p) => p.id === id);
          if (!preset) return;
          set({ current: cloneSelections(preset.selections), activePresetId: preset.id });
        },
        deletePreset: (id) => {
          const { presets, activePresetId } = get();
          set({
            presets: presets.filter((p) => p.id !== id),
            activePresetId: activePresetId === id ? null : activePresetId,
          });
        },
      }),
      {
        name: "boss-income-v2",
        partialize: (state) => ({
          current: state.current,
          presets: state.presets,
          activePresetId: state.activePresetId,
        }),
      }
    )
  )
);
