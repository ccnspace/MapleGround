"use client";

import { useMemo, type CSSProperties } from "react";
import type { StaticImageData } from "next/image";
import type { UnionRaider, UnionRaiderPreset } from "@/types/Union";
import warriorIcon from "@/images/warrior.png";
import magicianIcon from "@/images/magician.png";
import archerIcon from "@/images/archer.png";
import thiefIcon from "@/images/thief.png";
import pirateIcon from "@/images/pirate.png";
import hybridIcon from "@/images/hybrid.png";
import maplemIcon from "@/images/maplem.png";

export const BLOCK_ICONS: Record<string, StaticImageData> = {
  전사: warriorIcon,
  마법사: magicianIcon,
  궁수: archerIcon,
  도적: thiefIcon,
  해적: pirateIcon,
  하이브리드: hybridIcon,
  "메이플 M 캐릭터": maplemIcon,
};

// ── 편집 다이얼로그용 그리드 범위 (UnionRaiderGrid와 동일) ──
export const MIN_X = -11;
export const MAX_X = 10;
export const MIN_Y = -9;
export const MAX_Y = 10;
export const COLS = MAX_X - MIN_X + 1;
export const ROWS = MAX_Y - MIN_Y + 1;

export const CENTER_X = -0.5;
export const CENTER_Y = 0.5;

export const INNER_MIN_X = -6;
export const INNER_MAX_X = 5;
export const INNER_MIN_Y = -4;
export const INNER_MAX_Y = 5;
export const isInnerArea = (x: number, y: number) => x >= INNER_MIN_X && x <= INNER_MAX_X && y >= INNER_MIN_Y && y <= INNER_MAX_Y;

// 내부 8분할 sector (UnionRaiderGrid와 동일)
export const getInnerRegion = (x: number, y: number): number | null => {
  if (!isInnerArea(x, y)) return null;
  if (x === -1 && y === 1) return 0;
  if (x === 0 && y === 1) return 1;
  if (x === -1 && y === 0) return 5;
  if (x === 0 && y === 0) return 4;

  const dx = x - CENTER_X;
  let adjustedY: number;
  if (x <= -1) adjustedY = y - 1;
  else adjustedY = y > 0 ? y + 1 : y;
  const dy = adjustedY - CENTER_Y;
  const mathAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  const clockAngle = (90 - mathAngle + 360) % 360;
  const sectorAngle = (clockAngle - 315 + 360) % 360;
  let sector = Math.floor(sectorAngle / 45);
  if (x <= -1 && (y === 3 || y === 2 || y === 1) && sector === 6) sector = 7;
  if (x <= -1 && y === -x && sector === 7) sector = 0;
  return sector;
};

export const getOuterRegion = (x: number, y: number): number | null => {
  if (isInnerArea(x, y)) return null;
  const dx = x - CENTER_X;
  let adjustedY: number;
  if (x <= -1) adjustedY = y - 1;
  else adjustedY = y > 0 ? y + 1 : y;
  const dy = adjustedY - CENTER_Y;
  const mathAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  const clockAngle = (90 - mathAngle + 360) % 360;
  const sectorAngle = (clockAngle - 315 + 360) % 360;
  let sector = Math.floor(sectorAngle / 45);
  if (x <= -1 && (y === 3 || y === 2 || y === 1) && sector === 6) sector = 7;
  if (x <= -1 && y === -x && sector === 7) sector = 0;
  return sector;
};

export const INNER_LABEL_POS: Record<number, { x: number; y: number }> = {
  0: { x: -2, y: 4 },
  1: { x: 1, y: 4 },
  2: { x: 4, y: 2 },
  3: { x: 4, y: -2 },
  4: { x: 1, y: -3 },
  5: { x: -2, y: -3 },
  6: { x: -5, y: -2 },
  7: { x: -5, y: 2 },
};

export const OUTER_LABELS: { name: string; x: number; y: number }[] = [
  { name: "상태이상내성", x: -5, y: 8 },
  { name: "획득경험치", x: 4, y: 8 },
  { name: "크리티컬 확률", x: 8, y: 4 },
  { name: "보스데미지", x: 8, y: -4 },
  { name: "일반데미지", x: 3, y: -7 },
  { name: "버프지속시간", x: -5, y: -7 },
  { name: "방어율무시", x: -9, y: -4 },
  { name: "크리티컬 데미지", x: -9, y: 4 },
];

// 외부 영역 1칸 당 부여되는 효과 값 (인덱스 = sector id)
export const OUTER_REGION_PER_CELL: { value: number; unit: string }[] = [
  { value: 1, unit: "%" }, // 상태이상내성
  { value: 1, unit: "%" }, // 획득경험치
  { value: 1, unit: "%" }, // 크리티컬 확률
  { value: 1, unit: "%" }, // 보스데미지
  { value: 1, unit: "%" }, // 일반데미지
  { value: 1, unit: "%" }, // 버프지속시간
  { value: 1, unit: "%" }, // 방어율무시
  { value: 1, unit: "%" }, // 크리티컬 데미지
];

export const BLOCK_BASE = "bg-[#bb996f]";
export const BLOCK_TYPE_STYLES: Record<string, { overlay: string }> = {
  전사: { overlay: "bg-red-600/30" },
  마법사: { overlay: "bg-cyan-600/40" },
  궁수: { overlay: "bg-lime-300/30" },
  도적: { overlay: "bg-purple-500/30" },
  해적: { overlay: "bg-gray-600/40" },
  하이브리드: { overlay: "bg-purple-500/30" },
  "메이플 M 캐릭터": { overlay: "bg-orange-500/30" },
};

// 등급 선택 영역에 나열할 직업 순서
export const JOB_ORDER = ["전사", "마법사", "궁수", "도적", "해적", "하이브리드", "메이플 M 캐릭터"] as const;

export type EditDialogTab = "edit" | "new";

export type PresetData = Pick<UnionRaiderPreset, "union_block" | "union_inner_stat">;

// 편집 가능한 블록 로컬 타입
export type EditableBlock = UnionRaiderPreset["union_block"][number];

// 프리셋 번호 → 데이터 (0 = 현재 적용 중)
export const getPresetData = (raider: UnionRaider, presetNo: number): PresetData | null => {
  if (presetNo === 0) {
    return {
      union_block: raider.union_block,
      union_inner_stat: raider.union_inner_stat,
    };
  }
  const preset = raider[`union_raider_preset_${presetNo}` as keyof UnionRaider] as UnionRaiderPreset | undefined;
  if (!preset) return null;
  return { union_block: preset.union_block, union_inner_stat: preset.union_inner_stat };
};

// rows/cols 는 렌더 시점에 불변이라 모듈 로드 시 한 번만 계산한다.
export const GRID_ROWS: number[] = (() => {
  const r: number[] = [];
  for (let y = MAX_Y; y >= MIN_Y; y--) r.push(y);
  return r;
})();

export const GRID_COLS: number[] = (() => {
  const c: number[] = [];
  for (let x = MIN_X; x <= MAX_X; x++) c.push(x);
  return c;
})();

// 경계선 스타일 (UnionRaiderGrid와 동일). 좌표에만 의존하는 순수 계산이므로 모듈 단 1회 계산.
export const BORDER_STYLES: Map<string, CSSProperties> = (() => {
  const map = new Map<string, CSSProperties>();
  const sectorLine = "2px dashed rgba(200,210,220,0.5)";
  const outerLine = "2px dashed rgba(200,210,220,0.5)";

  for (let y = MIN_Y; y <= MAX_Y; y++) {
    for (let x = MIN_X; x <= MAX_X; x++) {
      const style: CSSProperties = {};

      if (isInnerArea(x, y)) {
        const myRegion = getInnerRegion(x, y);
        if (x < INNER_MAX_X && isInnerArea(x + 1, y) && getInnerRegion(x + 1, y) !== myRegion) {
          style.borderRight = sectorLine;
        }
        if (y > INNER_MIN_Y && isInnerArea(x, y - 1) && getInnerRegion(x, y - 1) !== myRegion) {
          style.borderBottom = sectorLine;
        }
        if (x === INNER_MIN_X) style.borderLeft = outerLine;
        if (x === INNER_MAX_X) style.borderRight = outerLine;
        if (y === INNER_MAX_Y) style.borderTop = outerLine;
        if (y === INNER_MIN_Y) style.borderBottom = outerLine;
      } else {
        const mySector = getOuterRegion(x, y);
        if (x < MAX_X && !isInnerArea(x + 1, y)) {
          const rightSector = getOuterRegion(x + 1, y);
          if (mySector !== rightSector) style.borderRight = sectorLine;
        }
        if (y > MIN_Y && !isInnerArea(x, y - 1)) {
          const belowSector = getOuterRegion(x, y - 1);
          if (mySector !== belowSector) style.borderBottom = sectorLine;
        }
      }

      if (Object.keys(style).length > 0) map.set(`${x},${y}`, style);
    }
  }
  return map;
})();

// 프리셋 내부 stat + 외부 라벨을 (x,y) → 표시 텍스트 Map 으로 합친다.
export const useAllLabels = (presetData: PresetData | null) => {
  const innerStatMap = useMemo(() => {
    const map = new Map<number, string>();
    presetData?.union_inner_stat?.forEach((s) => map.set(parseInt(s.stat_field_id), s.stat_field_effect.replace("유니온 ", "")));
    return map;
  }, [presetData]);

  return useMemo(() => {
    const labels = new Map<string, string>();
    for (const [regionId, pos] of Object.entries(INNER_LABEL_POS)) {
      const effect = innerStatMap.get(parseInt(regionId));
      if (effect) labels.set(`${pos.x},${pos.y}`, effect);
    }
    OUTER_LABELS.forEach((l) => labels.set(`${l.x},${l.y}`, l.name));
    return labels;
  }, [innerStatMap]);
};
