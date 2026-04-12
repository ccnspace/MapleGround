"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { DimmedLayer } from "@/components/DimmedLayer";
import type { UnionRaider, UnionRaiderPreset } from "@/types/Union";
import warriorIcon from "@/images/warrior.png";
import magicianIcon from "@/images/magician.png";
import archerIcon from "@/images/archer.png";
import thiefIcon from "@/images/thief.png";
import pirateIcon from "@/images/pirate.png";
import hybridIcon from "@/images/hybrid.png";
import maplemIcon from "@/images/maplem.png";
import {
  BLOCK_GRADES,
  BLOCK_GRADE_CELL_COUNT,
  flipBlockHorizontal,
  flipBlockVertical,
  levelToBlockGrade,
  rotateBlockClockwise,
  rotateBlockCounterClockwise,
  type BlockGrade,
} from "@/constants/unionBlockShapes";

const BLOCK_ICONS: Record<string, StaticImageData> = {
  전사: warriorIcon,
  마법사: magicianIcon,
  궁수: archerIcon,
  도적: thiefIcon,
  해적: pirateIcon,
  하이브리드: hybridIcon,
  "메이플 M 캐릭터": maplemIcon,
};

// ── 편집 다이얼로그용 그리드 범위 (UnionRaiderGrid와 동일) ──
const MIN_X = -11;
const MAX_X = 10;
const MIN_Y = -9;
const MAX_Y = 10;
const COLS = MAX_X - MIN_X + 1;
const ROWS = MAX_Y - MIN_Y + 1;

const CENTER_X = -0.5;
const CENTER_Y = 0.5;

const INNER_MIN_X = -6;
const INNER_MAX_X = 5;
const INNER_MIN_Y = -4;
const INNER_MAX_Y = 5;
const isInnerArea = (x: number, y: number) => x >= INNER_MIN_X && x <= INNER_MAX_X && y >= INNER_MIN_Y && y <= INNER_MAX_Y;

// 내부 8분할 sector (UnionRaiderGrid와 동일)
const getInnerRegion = (x: number, y: number): number | null => {
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

const getOuterRegion = (x: number, y: number): number | null => {
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

const INNER_LABEL_POS: Record<number, { x: number; y: number }> = {
  0: { x: -2, y: 4 },
  1: { x: 1, y: 4 },
  2: { x: 4, y: 2 },
  3: { x: 4, y: -2 },
  4: { x: 1, y: -3 },
  5: { x: -2, y: -3 },
  6: { x: -5, y: -2 },
  7: { x: -5, y: 2 },
};

const OUTER_LABELS: { name: string; x: number; y: number }[] = [
  { name: "상태이상내성", x: -5, y: 8 },
  { name: "획득경험치", x: 4, y: 8 },
  { name: "크리티컬 확률", x: 8, y: 4 },
  { name: "보스데미지", x: 8, y: -4 },
  { name: "일반데미지", x: 3, y: -7 },
  { name: "버프지속시간", x: -5, y: -7 },
  { name: "방어율무시", x: -9, y: -4 },
  { name: "크리티컬 데미지", x: -9, y: 4 },
];

const BLOCK_BASE = "bg-[#bb996f]";
const BLOCK_TYPE_STYLES: Record<string, { overlay: string }> = {
  전사: { overlay: "bg-red-500/30" },
  마법사: { overlay: "bg-blue-500/30" },
  궁수: { overlay: "bg-green-500/30" },
  도적: { overlay: "bg-purple-500/30" },
  해적: { overlay: "bg-gray-700/30" },
  하이브리드: { overlay: "bg-cyan-500/30" },
  "메이플 M 캐릭터": { overlay: "bg-orange-500/30" },
};

// 등급 선택 영역에 나열할 직업 순서
const JOB_ORDER = ["전사", "마법사", "궁수", "도적", "해적", "하이브리드", "메이플 M 캐릭터"] as const;

type Props = {
  raider: UnionRaider;
  presetNo: number;
  onClose: () => void;
};

// 편집 가능한 블록 로컬 타입
type EditableBlock = UnionRaiderPreset["union_block"][number];

const ContextMenuButton = ({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    className="w-7 h-7 flex items-center justify-center rounded-md text-[15px] font-bold
      text-gray-700 dark:text-gray-200
      hover:bg-sky-100 dark:hover:bg-sky-900/40
      transition-colors"
  >
    {children}
  </button>
);

// 프리셋 번호 → 데이터 (0 = 현재 적용 중)
const getPresetData = (raider: UnionRaider, presetNo: number) => {
  if (presetNo === 0) {
    return {
      union_block: raider.union_block,
      union_inner_stat: raider.union_inner_stat,
    } as Pick<UnionRaiderPreset, "union_block" | "union_inner_stat">;
  }
  const preset = raider[`union_raider_preset_${presetNo}` as keyof UnionRaider] as UnionRaiderPreset | undefined;
  if (!preset) return null;
  return { union_block: preset.union_block, union_inner_stat: preset.union_inner_stat };
};

export const UnionRaiderEditDialog = ({ raider, presetNo, onClose }: Props) => {
  const presetData = useMemo(() => getPresetData(raider, presetNo), [raider, presetNo]);

  // 로컬 블록 상태 (편집 대상). presetData 기준 깊은 복사
  const [localBlocks, setLocalBlocks] = useState<EditableBlock[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const src = presetData?.union_block ?? [];
    setLocalBlocks(src.map((b) => ({ ...b, block_position: b.block_position ? b.block_position.map((p) => ({ ...p })) : null })));
    setSelectedBlockIndex(null);
  }, [presetData]);

  const innerStatMap = useMemo(() => {
    const map = new Map<number, string>();
    presetData?.union_inner_stat?.forEach((s) => map.set(parseInt(s.stat_field_id), s.stat_field_effect.replace("유니온 ", "")));
    return map;
  }, [presetData]);

  // 셀 단위 블록 맵 + 라벨 맵 + 겹침 셀 집합 (로컬 블록 기반)
  const { grid, iconCells, gradeCountMap, allLabels, overlapCells } = useMemo(() => {
    const cellMap = new Map<string, { blockType: string; blockIndex: number }>();
    const icons = new Set<string>();
    const counts = new Map<string, number>();
    const labels = new Map<string, string>();
    const cellCounts = new Map<string, number>();

    localBlocks.forEach((block, blockIndex) => {
      const level = parseInt(block.block_level, 10);
      const grade = levelToBlockGrade(level);
      if (grade) {
        const key = `${block.block_type}:${grade}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      if (!block.block_position) return;
      block.block_position.forEach((pos) => {
        const k = `${pos.x},${pos.y}`;
        cellMap.set(k, { blockType: block.block_type, blockIndex });
        cellCounts.set(k, (cellCounts.get(k) ?? 0) + 1);
      });
      const last = block.block_position[block.block_position.length - 1];
      icons.add(`${last.x},${last.y}`);
    });

    const overlaps = new Set<string>();
    cellCounts.forEach((n, k) => {
      if (n > 1) overlaps.add(k);
    });

    for (const [regionId, pos] of Object.entries(INNER_LABEL_POS)) {
      const effect = innerStatMap.get(parseInt(regionId));
      if (effect) labels.set(`${pos.x},${pos.y}`, effect);
    }
    OUTER_LABELS.forEach((l) => labels.set(`${l.x},${l.y}`, l.name));

    return { grid: cellMap, iconCells: icons, gradeCountMap: counts, allLabels: labels, overlapCells: overlaps };
  }, [localBlocks, innerStatMap]);

  // 선택된 블록의 메뉴 위치(그리드 컨테이너 기준 top-left)
  const menuAnchor = useMemo(() => {
    if (selectedBlockIndex === null) return null;
    const block = localBlocks[selectedBlockIndex];
    if (!block?.block_position?.length) return null;
    const xs = block.block_position.map((p) => p.x);
    const ys = block.block_position.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const centerCol = (minX + maxX) / 2 - MIN_X; // 그리드 내 열 인덱스 (0-based, 소수 가능)
    const topRow = MAX_Y - maxY; // 블록 최상단 행
    return { centerCol, topRow };
  }, [selectedBlockIndex, localBlocks]);

  const applyTransform = (
    transformer: (positions: { x: number; y: number }[], pivot: { x: number; y: number }) => { x: number; y: number }[],
  ) => {
    if (selectedBlockIndex === null) return;
    setLocalBlocks((prev) => {
      const next = [...prev];
      const b = next[selectedBlockIndex];
      if (!b.block_position) return prev;
      next[selectedBlockIndex] = {
        ...b,
        block_position: transformer(b.block_position, b.block_control_point),
      };
      return next;
    });
  };

  const handleCellClick = (x: number, y: number) => {
    const cell = grid.get(`${x},${y}`);
    if (!cell) {
      setSelectedBlockIndex(null);
      return;
    }
    setSelectedBlockIndex((prev) => (prev === cell.blockIndex ? null : cell.blockIndex));
  };

  // 경계선 스타일 (UnionRaiderGrid와 동일)
  const borderStyles = useMemo(() => {
    const map = new Map<string, React.CSSProperties>();
    const sectorLine = "2px dashed rgba(200,210,220,0.5)";
    const outerLine = "2px dashed rgba(200,210,220,0.5)";

    for (let y = MIN_Y; y <= MAX_Y; y++) {
      for (let x = MIN_X; x <= MAX_X; x++) {
        const style: React.CSSProperties = {};

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
  }, []);

  const rows = useMemo(() => {
    const r: number[] = [];
    for (let y = MAX_Y; y >= MIN_Y; y--) r.push(y);
    return r;
  }, []);
  const cols = useMemo(() => {
    const c: number[] = [];
    for (let x = MIN_X; x <= MAX_X; x++) c.push(x);
    return c;
  }, []);

  const getCount = (job: string, grade: BlockGrade) => gradeCountMap.get(`${job}:${grade}`) ?? 0;

  // 모든 블록의 칸 수 총합
  const totalCells = useMemo(() => {
    let sum = 0;
    for (const job of JOB_ORDER) {
      for (const grade of BLOCK_GRADES) {
        sum += getCount(job, grade) * BLOCK_GRADE_CELL_COUNT[grade];
      }
    }
    return sum;
  }, [gradeCountMap]);

  const totalBlocks = useMemo(() => {
    let sum = 0;
    for (const job of JOB_ORDER) {
      for (const grade of BLOCK_GRADES) sum += getCount(job, grade);
    }
    return sum;
  }, [gradeCountMap]);

  return (
    <>
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 overflow-auto">
        <div
          className="relative w-full max-w-[880px] my-auto flex flex-col gap-4
            bg-white dark:bg-[#2c2e38] rounded-2xl shadow-2xl
            border border-slate-200/80 dark:border-white/10
            p-5 max-h-[92vh] overflow-y-auto"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-extrabold text-lg">공격대 편집</p>
              <span
                className="text-[11px] font-semibold text-sky-600 dark:text-sky-400
                  bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full"
              >
                {presetNo === 0 ? "적용 중" : `프리셋 ${presetNo}`}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-sm font-bold bg-slate-400/20 hover:bg-slate-400/40
                dark:bg-white/10 dark:hover:bg-white/20 rounded-md px-3 py-1.5"
            >
              닫기
            </button>
          </div>

          {/* 그리드 (편집 모드) */}
          <div className="flex justify-center">
            <div
              ref={gridContainerRef}
              className="relative w-full max-w-[624px] grid
                border border-[#c0c4cc] dark:border-[#3a3e48] rounded-lg overflow-visible"
              style={{
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              }}
            >
              {rows.map((y) =>
                cols.map((x) => {
                  const key = `${x},${y}`;
                  const cell = grid.get(key);
                  const isCenter = (x === 0 && y === 0) || (x === -1 && y === 0) || (x === 0 && y === 1) || (x === -1 && y === 1);
                  const overlay = cell ? BLOCK_TYPE_STYLES[cell.blockType]?.overlay ?? "bg-slate-500/30" : "";
                  const borderStyle = borderStyles.get(key) ?? {};
                  const label = allLabels.get(key);
                  const isSelected = cell && cell.blockIndex === selectedBlockIndex;
                  const isOverlap = overlapCells.has(key);
                  return (
                    <div
                      key={key}
                      onClick={() => handleCellClick(x, y)}
                      className={`relative aspect-square border border-[rgba(255,255,255,0.06)]
                        ${cell ? `${BLOCK_BASE} cursor-pointer` : ""}
                        ${!cell && isCenter ? "bg-[#4a5060]" : ""}
                        ${!cell && !isCenter ? "bg-[#2e3038]" : ""}
                      `}
                      style={borderStyle}
                    >
                      {cell && <div className={`absolute inset-0 ${overlay} pointer-events-none`} />}
                      {isSelected && (
                        <div className="absolute inset-0 ring-2 ring-sky-400 ring-inset bg-sky-300/20 pointer-events-none z-20" />
                      )}
                      {isOverlap && (
                        <div className="absolute inset-0 ring-2 ring-red-500 ring-inset bg-red-500/40 pointer-events-none z-[25]" />
                      )}
                      {cell && iconCells.has(key) && BLOCK_ICONS[cell.blockType] && (
                        <div className="absolute inset-[3px] max-[600px]:inset-[2px] pointer-events-none z-10 flex items-center justify-center">
                          <Image
                            src={BLOCK_ICONS[cell.blockType]}
                            alt={cell.blockType}
                            width={18}
                            height={18}
                            className="w-full h-full object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                      {label && (
                        <span
                          className="absolute z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap
                            text-[11px] max-[600px]:text-[8px] font-bold text-white pointer-events-none
                            bg-black/30 px-1.5 rounded-md opacity-80"
                        >
                          {label}
                        </span>
                      )}
                    </div>
                  );
                })
              )}

              {/* 선택된 블록 컨텍스트 메뉴 */}
              {menuAnchor && (
                <div
                  className="absolute z-40 -translate-x-1/2 -translate-y-[calc(100%+6px)]
                    flex items-center gap-0.5 px-1 py-1 rounded-lg
                    bg-white/95 dark:bg-[#2c2e38]/95 border border-slate-200 dark:border-white/10
                    shadow-lg backdrop-blur-sm"
                  style={{
                    left: `${((menuAnchor.centerCol + 0.5) / COLS) * 100}%`,
                    top: `${(menuAnchor.topRow / ROWS) * 100}%`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ContextMenuButton label="좌우 대칭" onClick={() => applyTransform(flipBlockHorizontal)}>
                    ↔
                  </ContextMenuButton>
                  <ContextMenuButton label="상하 대칭" onClick={() => applyTransform(flipBlockVertical)}>
                    ↕
                  </ContextMenuButton>
                  <ContextMenuButton label="반시계 90°" onClick={() => applyTransform(rotateBlockCounterClockwise)}>
                    ↺
                  </ContextMenuButton>
                  <ContextMenuButton label="시계 90°" onClick={() => applyTransform(rotateBlockClockwise)}>
                    ↻
                  </ContextMenuButton>
                </div>
              )}
            </div>
          </div>

          {/* 직업 × 등급 블록 개수 선택 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3 text-md">
                <span className="text-gray-500 dark:text-gray-400">
                  총 블록 수 <span className="font-bold text-gray-800 dark:text-gray-100">{totalBlocks}</span>개
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  총 칸 수 <span className="font-extrabold text-sky-600 dark:text-sky-400">{totalCells}</span>
                  <span className="ml-0.5">칸</span>
                </span>
              </div>
            </div>
            <div
              className="rounded-xl border border-slate-200/80 dark:border-white/10
                bg-slate-50 dark:bg-color-950/40 overflow-x-auto"
            >
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/10">
                    <th className="text-left px-3 py-2 text-[12px] font-bold text-gray-500 dark:text-gray-400 w-[140px]">직업</th>
                    {BLOCK_GRADES.map((g) => (
                      <th key={g} className="px-2 py-2 text-[12px] font-bold text-center">
                        <span>{g}</span>
                        <span className="ml-1 text-[10px] font-medium text-gray-400">({BLOCK_GRADE_CELL_COUNT[g]}칸)</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {JOB_ORDER.map((job, i) => (
                    <tr key={job} className={i < JOB_ORDER.length - 1 ? "border-b border-slate-100 dark:border-white/5" : ""}>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {BLOCK_ICONS[job] && <Image src={BLOCK_ICONS[job]} alt={job} width={16} height={16} unoptimized />}
                          <span className="font-bold text-[13px]">{job}</span>
                        </div>
                      </td>
                      {BLOCK_GRADES.map((grade) => {
                        const count = getCount(job, grade);
                        return (
                          <td key={grade} className="px-2 py-2 text-center">
                            <select
                              value={count}
                              onChange={() => {
                                /* 현재는 동작 없음 */
                              }}
                              className="w-[56px] text-center rounded-md border text-[12px] font-semibold
                                bg-white dark:bg-color-900 border-slate-300 dark:border-white/10
                                text-gray-700 dark:text-gray-200
                                focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-600
                                py-1"
                            >
                              {Array.from({ length: 11 }).map((_, n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 하단 버튼 (추후 동작 연결) */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-[13px] font-semibold rounded-md
                bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20"
            >
              취소
            </button>
            <button
              disabled
              className="px-3 py-1.5 text-[13px] font-semibold rounded-md text-white
                bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              저장
            </button>
          </div>
        </div>
      </div>

      <DimmedLayer style={{ zIndex: 10000 }} />
    </>
  );
};
