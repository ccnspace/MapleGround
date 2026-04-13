"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  BLOCK_GRADES,
  BLOCK_GRADE_CELL_COUNT,
  BLOCK_TYPE_TO_CATEGORY,
  UNION_BLOCK_SHAPES,
  flipBlockHorizontal,
  flipBlockVertical,
  levelToBlockGrade,
  rotateBlockClockwise,
  rotateBlockCounterClockwise,
  shapeToOffsets,
} from "@/constants/unionBlockShapes";
import {
  BLOCK_BASE,
  BLOCK_ICONS,
  BLOCK_TYPE_STYLES,
  BORDER_STYLES,
  COLS,
  GRID_COLS,
  GRID_ROWS,
  JOB_ORDER,
  MAX_X,
  MAX_Y,
  MIN_X,
  MIN_Y,
  OUTER_LABELS,
  OUTER_REGION_PER_CELL,
  ROWS,
  getOuterRegion,
  isInnerArea,
  useAllLabels,
  type EditableBlock,
  type PresetData,
} from "@/components/Union/unionRaiderDialogShared";

type Props = {
  presetData: PresetData | null;
  hidden: boolean;
};

const ContextMenuButton = ({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) => (
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

export const UnionRaiderPresetEditor = ({ presetData, hidden }: Props) => {
  // 로컬 블록 상태 (편집 대상). presetData 기준 깊은 복사
  const [localBlocks, setLocalBlocks] = useState<EditableBlock[]>([]);
  // 블록 z-order (앞쪽 = 아래, 뒤쪽 = 위). 같은 셀에 여러 블록이 겹치면 뒤쪽이 우선.
  const [blockOrder, setBlockOrder] = useState<number[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const src = presetData?.union_block ?? [];
    setLocalBlocks(src.map((b) => ({ ...b, block_position: b.block_position ? b.block_position.map((p) => ({ ...p })) : null })));
    setBlockOrder(src.map((_, i) => i));
    setSelectedBlockIndex(null);
  }, [presetData]);

  const bringToTop = (blockIndex: number) => {
    setBlockOrder((prev) => {
      if (prev[prev.length - 1] === blockIndex) return prev;
      return [...prev.filter((i) => i !== blockIndex), blockIndex];
    });
  };

  const allLabels = useAllLabels(presetData);

  // 셀 단위 블록 맵 + 아이콘 칸 + 등급 카운트 + 겹침 셀 집합 (로컬 블록 기반)
  const { grid, iconCells, gradeCountMap, overlapCells } = useMemo(() => {
    const cellMap = new Map<string, { blockType: string; blockIndex: number }>();
    const icons = new Set<string>();
    const counts = new Map<string, number>();
    const cellCounts = new Map<string, number>();

    // 등급 카운트는 배열 순서 기준
    localBlocks.forEach((block) => {
      const level = parseInt(block.block_level, 10);
      const grade = levelToBlockGrade(level);
      if (grade) {
        const key = `${block.block_type}:${grade}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    });

    // cellMap / icons 는 z-order(아래→위) 순서로 쌓아 나중에 set한 값이 위에 오도록
    const orderedIndices = blockOrder.length === localBlocks.length ? blockOrder : localBlocks.map((_, i) => i);
    orderedIndices.forEach((blockIndex) => {
      const block = localBlocks[blockIndex];
      if (!block?.block_position) return;
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

    return { grid: cellMap, iconCells: icons, gradeCountMap: counts, overlapCells: overlaps };
  }, [localBlocks, blockOrder]);

  // 중앙 2x2 (0,0)/(-1,0)/(0,1)/(-1,1) 중 한 칸에 "직업 아이콘 칸" 이 반드시 와야 점령됐다고 본다
  const hasCenterBlock = useMemo(() => {
    const centerKeys = ["0,0", "-1,0", "0,1", "-1,1"];
    return centerKeys.some((k) => iconCells.has(k));
  }, [iconCells]);

  // 끊어진 영역(메인 컴포넌트에 속하지 않는 모든 셀) 계산.
  // 중앙 2x2에 닿은 컴포넌트를 메인으로 선택하고, 중앙이 비었으면 가장 큰 컴포넌트를 메인으로 본다.
  // 컴포넌트가 2개 이상일 때만 끊어진 것으로 간주한다.
  const disconnectedCells = useMemo(() => {
    const result = new Set<string>();
    const occupied = new Set<string>(grid.keys());
    if (occupied.size === 0) return result;

    const visited = new Set<string>();
    const components: Set<string>[] = [];
    occupied.forEach((start) => {
      if (visited.has(start)) return;
      const comp = new Set<string>();
      const queue: string[] = [start];
      visited.add(start);
      comp.add(start);
      while (queue.length) {
        const cur = queue.shift()!;
        const [sx, sy] = cur.split(",").map(Number);
        const neighbors: [number, number][] = [
          [sx + 1, sy],
          [sx - 1, sy],
          [sx, sy + 1],
          [sx, sy - 1],
        ];
        for (const [nx, ny] of neighbors) {
          const nk = `${nx},${ny}`;
          if (occupied.has(nk) && !visited.has(nk)) {
            visited.add(nk);
            comp.add(nk);
            queue.push(nk);
          }
        }
      }
      components.push(comp);
    });

    if (components.length <= 1) return result;

    // 메인 컴포넌트 선정: 중앙 2x2에 닿은 것 우선, 없으면 최대 크기
    const centerKeys = ["0,0", "-1,0", "0,1", "-1,1"];
    let main = components.find((c) => centerKeys.some((k) => c.has(k)));
    if (!main) main = components.reduce((best, c) => (c.size > best.size ? c : best), components[0]);

    components.forEach((c) => {
      if (c === main) return;
      c.forEach((k) => result.add(k));
    });
    return result;
  }, [grid]);

  const hasDisconnected = disconnectedCells.size > 0;

  // 외부 8영역별 점령 칸 수
  const outerRegionCounts = useMemo(() => {
    const counts = new Array<number>(8).fill(0);
    grid.forEach((_, key) => {
      const [x, y] = key.split(",").map(Number);
      if (isInnerArea(x, y)) return;
      const sector = getOuterRegion(x, y);
      if (sector === null) return;
      counts[sector]++;
    });
    return counts;
  }, [grid]);

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
    transformer: (positions: { x: number; y: number }[], pivot: { x: number; y: number }) => { x: number; y: number }[]
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
    bringToTop(selectedBlockIndex);
  };

  // 선택된 블록을 그리드에서 제거 (엔티티 자체는 남기고 block_position만 null)
  const handleDeleteSelected = () => {
    if (selectedBlockIndex === null) return;
    setLocalBlocks((prev) => {
      const next = [...prev];
      const b = next[selectedBlockIndex];
      next[selectedBlockIndex] = { ...b, block_position: null };
      return next;
    });
    setSelectedBlockIndex(null);
  };

  // 미배치 블록을 기본 위치로 되돌림 (원본 위치가 있으면 원본, 없으면 shape 기반 상단 중앙 placement)
  const computeFallbackPlacement = (block: EditableBlock) => {
    const level = parseInt(block.block_level, 10);
    const grade = levelToBlockGrade(level);
    const category = BLOCK_TYPE_TO_CATEGORY[block.block_type];
    const shape = grade && category ? UNION_BLOCK_SHAPES[category][grade] : ["X"];
    const offsets = shapeToOffsets(shape);
    // 상단(y=8 부근)에 왼쪽부터 배치: 그리드 y는 위로 갈수록 +, matrix row 0 = top
    const topY = 8;
    const leftX = -2;
    const positions = offsets.map((o) => ({ x: leftX + o.dx, y: topY - o.dy }));
    return { positions, controlPoint: { x: leftX, y: topY } };
  };

  const handleAddBlock = (index: number) => {
    const original = presetData?.union_block[index];
    setLocalBlocks((prev) => {
      const next = [...prev];
      const b = next[index];
      if (original?.block_position && original.block_position.length > 0) {
        next[index] = {
          ...b,
          block_position: original.block_position.map((p) => ({ ...p })),
          block_control_point: { ...original.block_control_point },
        };
      } else {
        const fb = computeFallbackPlacement(b);
        next[index] = { ...b, block_position: fb.positions, block_control_point: fb.controlPoint };
      }
      return next;
    });
    bringToTop(index);
    setSelectedBlockIndex(index);
  };

  // 미배치 블록 목록
  const unplacedBlocks = useMemo(
    () =>
      localBlocks
        .map((block, index) => ({ block, index }))
        .filter(({ block }) => !block.block_position || block.block_position.length === 0),
    [localBlocks]
  );

  // ── 드래그 이동 ──
  // dragRef에 최신 드래그 정보를 담아 window 이벤트 리스너 재등록을 피한다.
  const dragRef = useRef<{
    blockIndex: number;
    grabCellX: number;
    grabCellY: number;
    offsets: { dx: number; dy: number }[];
    cpOffset: { dx: number; dy: number };
    // 그리드 경계 안에서 잡은 셀이 놓일 수 있는 좌표 범위
    bounds: { minX: number; maxX: number; minY: number; maxY: number };
    moved: boolean;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCellMouseDown = (e: React.MouseEvent, x: number, y: number) => {
    const cell = grid.get(`${x},${y}`);
    if (!cell) {
      setSelectedBlockIndex(null);
      return;
    }
    const block = localBlocks[cell.blockIndex];
    if (!block.block_position) return;
    const offsets = block.block_position.map((p) => ({ dx: p.x - x, dy: p.y - y }));
    const dxs = offsets.map((o) => o.dx);
    const dys = offsets.map((o) => o.dy);
    // 블록의 모든 셀이 밖으로 나가는 것만 금지 (축별로 최소 한 셀이 그리드 안에 남도록)
    const bounds = {
      minX: MIN_X - Math.max(...dxs),
      maxX: MAX_X - Math.min(...dxs),
      minY: MIN_Y - Math.max(...dys),
      maxY: MAX_Y - Math.min(...dys),
    };
    dragRef.current = {
      blockIndex: cell.blockIndex,
      grabCellX: x,
      grabCellY: y,
      offsets,
      cpOffset: { dx: block.block_control_point.x - x, dy: block.block_control_point.y - y },
      bounds,
      moved: false,
    };
    bringToTop(cell.blockIndex);
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag || !gridContainerRef.current) return;
      const rect = gridContainerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const col = Math.floor(((e.clientX - rect.left) / rect.width) * COLS);
      const row = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS);
      const rawX = MIN_X + col;
      const rawY = MAX_Y - row;
      // 블록의 모든 셀이 밖으로 나가지 않도록 클램프 (일부 셀은 밖으로 나갈 수 있음)
      const newCellX = Math.max(drag.bounds.minX, Math.min(drag.bounds.maxX, rawX));
      const newCellY = Math.max(drag.bounds.minY, Math.min(drag.bounds.maxY, rawY));
      if (newCellX === drag.grabCellX && newCellY === drag.grabCellY) return;

      drag.grabCellX = newCellX;
      drag.grabCellY = newCellY;
      drag.moved = true;

      setLocalBlocks((prev) => {
        const next = [...prev];
        const b = next[drag.blockIndex];
        if (!b.block_position) return prev;
        next[drag.blockIndex] = {
          ...b,
          block_position: drag.offsets.map((o) => ({ x: newCellX + o.dx, y: newCellY + o.dy })),
          block_control_point: { x: newCellX + drag.cpOffset.dx, y: newCellY + drag.cpOffset.dy },
        };
        return next;
      });
    };

    const handleUp = () => {
      const drag = dragRef.current;
      if (drag && !drag.moved) {
        // 드래그 없이 눌렀다 뗀 경우 → 선택 토글
        setSelectedBlockIndex((prev) => (prev === drag.blockIndex ? null : drag.blockIndex));
      } else if (drag && drag.moved) {
        // 이동 후에는 해당 블록을 선택 상태로 유지
        setSelectedBlockIndex(drag.blockIndex);
      }
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

  const getCount = (job: string, grade: (typeof BLOCK_GRADES)[number]) => gradeCountMap.get(`${job}:${grade}`) ?? 0;

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
    <div className={hidden ? "hidden" : "flex flex-col gap-4"}>
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
          {GRID_ROWS.map((y) =>
            GRID_COLS.map((x) => {
              const key = `${x},${y}`;
              const cell = grid.get(key);
              const isCenter = (x === 0 && y === 0) || (x === -1 && y === 0) || (x === 0 && y === 1) || (x === -1 && y === 1);
              const overlay = cell ? BLOCK_TYPE_STYLES[cell.blockType]?.overlay ?? "bg-slate-500/30" : "";
              const borderStyle = BORDER_STYLES.get(key) ?? {};
              const label = allLabels.get(key);
              const isSelected = cell && cell.blockIndex === selectedBlockIndex;
              const isOverlap = overlapCells.has(key);
              const isDisconnected = disconnectedCells.has(key);
              return (
                <div
                  key={key}
                  onMouseDown={(e) => handleCellMouseDown(e, x, y)}
                  className={`relative aspect-square border border-[rgba(255,255,255,0.06)] select-none
                ${cell ? `${BLOCK_BASE} cursor-grab active:cursor-grabbing` : ""}
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
                  {isDisconnected && !isOverlap && (
                    <div
                      className="absolute inset-0 ring-2 ring-red-500 ring-inset bg-red-500/30 pointer-events-none z-[24]"
                      style={{ outline: "1px dashed rgba(255,255,255,0.6)", outlineOffset: -4 }}
                    />
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
              <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-0.5" aria-hidden />
              <button
                type="button"
                title="삭제"
                aria-label="삭제"
                onClick={handleDeleteSelected}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[14px] font-bold
              text-red-600 dark:text-red-400
              hover:bg-red-100 dark:hover:bg-red-900/40
              transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 경고 칩 + 총합 (현재 프리셋 편집에서만 노출) */}
      <div className="flex items-center justify-between px-1 gap-2 min-h-[28px]">
        {/* 좌측: 규칙 경고 칩들 (없으면 공간만 차지). 끊어짐이 우선 표시. */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {hasDisconnected && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
            text-sm font-bold
            bg-red-50 dark:bg-red-950/40
            text-red-600 dark:text-red-300
            border border-red-200 dark:border-red-800/60"
              title="중앙 2×2와 이어지지 않은 블록 구역이 존재합니다."
            >
              <span aria-hidden>⚠</span>
              <span>끊어진 영역이 있습니다</span>
            </span>
          )}
          {!hasCenterBlock && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
            text-sm font-bold
            bg-red-50 dark:bg-red-950/40
            text-red-600 dark:text-red-300
            border border-red-200 dark:border-red-800/60"
              title="중앙 2×2 영역 중 최소 한 칸은 블록으로 점유해야 합니다."
            >
              <span aria-hidden>⚠</span>
              <span>중앙 2×2 영역에 직업 아이콘 배치 필수</span>
            </span>
          )}
        </div>
        {/* 우측: 총합 */}
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

      {/* 점령 효과 (외부 8영역) */}
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400 px-1">점령 효과</p>
        <div
          className="grid grid-cols-2 min-[600px]:grid-cols-4 gap-1.5 p-2 rounded-xl
        bg-slate-50 dark:bg-color-950/40 border border-slate-200/80 dark:border-white/10"
        >
          {OUTER_LABELS.map((label, i) => {
            const cells = outerRegionCounts[i] ?? 0;
            const per = OUTER_REGION_PER_CELL[i];
            const value = cells * per.value;
            const active = cells > 0;
            return (
              <div
                key={label.name}
                className={`flex items-center justify-between px-2.5 py-2 rounded-md text-[13px] ${
                  active
                    ? "bg-white dark:bg-color-950/70 border border-slate-200 dark:border-white/10"
                    : "bg-transparent border border-dashed border-slate-200 dark:border-white/10 opacity-60"
                }`}
              >
                <span className="text-gray-600 dark:text-gray-300">{label.name}</span>
                <span
                  className={`font-extrabold ${
                    active ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {active ? "+" : ""}
                  {value}
                  {per.unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 미배치 블록 리스트 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400">미배치 블록</p>
          <span className="text-[11px] text-gray-400">
            {unplacedBlocks.length}개 / 총 {localBlocks.length}개
          </span>
        </div>
        {unplacedBlocks.length === 0 ? (
          <div
            className="px-3 py-2 rounded-lg text-[12px] text-gray-500 dark:text-gray-400
          bg-slate-50 dark:bg-color-950/40 border border-slate-200/80 dark:border-white/10"
          >
            모든 블록이 그리드에 배치되어 있습니다.
          </div>
        ) : (
          <div
            className="flex flex-wrap gap-1.5 p-2 rounded-lg
          bg-slate-50 dark:bg-color-950/40 border border-slate-200/80 dark:border-white/10
          max-h-[140px] overflow-y-auto"
          >
            {unplacedBlocks.map(({ block, index }) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAddBlock(index)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-semibold
              bg-white dark:bg-color-900 border border-slate-200 dark:border-white/10
              hover:bg-sky-50 hover:border-sky-300
              dark:hover:bg-sky-900/30 dark:hover:border-sky-700
              transition-colors"
                title="그리드에 추가"
              >
                {BLOCK_ICONS[block.block_type] && (
                  <Image src={BLOCK_ICONS[block.block_type]} alt="" width={14} height={14} unoptimized />
                )}
                <span>{block.block_class}</span>
                <span className="text-[10px] text-gray-400">Lv.{block.block_level}</span>
                <span className="text-sky-500 dark:text-sky-400 ml-0.5">＋</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
