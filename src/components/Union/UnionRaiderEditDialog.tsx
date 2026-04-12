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
  BLOCK_TYPE_TO_CATEGORY,
  UNION_BLOCK_SHAPES,
  flipBlockHorizontal,
  flipBlockVertical,
  levelToBlockGrade,
  rotateBlockClockwise,
  rotateBlockCounterClockwise,
  shapeToOffsets,
  type BlockGrade,
  type BlockJobCategory,
} from "@/constants/unionBlockShapes";
import { generateOrientations, type Orientation, type SolverResult } from "@/utils/unionAutoPlace";

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

// 외부 영역 1칸 당 부여되는 효과 값 (인덱스 = sector id)
const OUTER_REGION_PER_CELL: { value: number; unit: string }[] = [
  { value: 1, unit: "%" }, // 상태이상내성
  { value: 1, unit: "%" }, // 획득경험치
  { value: 1, unit: "%" }, // 크리티컬 확률
  { value: 1, unit: "%" }, // 보스데미지
  { value: 1, unit: "%" }, // 일반데미지
  { value: 1, unit: "%" }, // 버프지속시간
  { value: 1, unit: "%" }, // 방어율무시
  { value: 1, unit: "%" }, // 크리티컬 데미지
];

const BLOCK_BASE = "bg-[#bb996f]";
const BLOCK_TYPE_STYLES: Record<string, { overlay: string }> = {
  전사: { overlay: "bg-red-600/30" },
  마법사: { overlay: "bg-cyan-600/40" },
  궁수: { overlay: "bg-lime-300/30" },
  도적: { overlay: "bg-purple-500/30" },
  해적: { overlay: "bg-gray-600/40" },
  하이브리드: { overlay: "bg-purple-500/30" },
  "메이플 M 캐릭터": { overlay: "bg-orange-500/30" },
};

// 등급 선택 영역에 나열할 직업 순서
const JOB_ORDER = ["전사", "마법사", "궁수", "도적", "해적", "하이브리드", "메이플 M 캐릭터"] as const;

export type EditDialogTab = "edit" | "new";

type Props = {
  raider: UnionRaider;
  presetNo: number;
  initialTab?: EditDialogTab;
  onClose: () => void;
};

// 편집 가능한 블록 로컬 타입
type EditableBlock = UnionRaiderPreset["union_block"][number];

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

export const UnionRaiderEditDialog = ({ raider, presetNo, initialTab = "edit", onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<EditDialogTab>(initialTab);
  const presetData = useMemo(() => getPresetData(raider, presetNo), [raider, presetNo]);

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

  // ── 새로 그리드 배치 탭 상태 ──
  const [useManual, setUseManual] = useState(false);
  const [manualCounts, setManualCounts] = useState<Map<string, number>>(new Map());
  const [paintedCells, setPaintedCells] = useState<Set<string>>(new Set());
  const [groupMode, setGroupMode] = useState(false);
  const paintModeRef = useRef<"add" | "remove" | null>(null);
  const [isPainting, setIsPainting] = useState(false);
  // 보유 블록 목록 섹션 펼침 상태 (기본: 접힘, useManual 전환 시 자동 펼침)
  const [isBlockListExpanded, setIsBlockListExpanded] = useState(false);
  const prevUseManualRef = useRef(useManual);
  useEffect(() => {
    if (prevUseManualRef.current !== useManual) {
      setIsBlockListExpanded(true);
      prevUseManualRef.current = useManual;
    }
  }, [useManual]);

  // 블록의 "실제 등급" — 배치 셀 수 우선, 없으면 레벨 폴백.
  // 메이플 M 캐릭터처럼 레벨→등급 규칙이 일반 직업과 다른 타입도 올바르게 반영된다.
  const gradeForBlock = (b: {
    block_type: string;
    block_level: string;
    block_position: Array<{ x: number; y: number }> | null;
  }): BlockGrade | null => {
    if (b.block_position && b.block_position.length > 0) {
      const n = b.block_position.length;
      if (n === 1) return "B";
      if (n === 2) return "A";
      if (n === 3) return "S";
      if (n === 4) return "SS";
      if (n === 5) return "SSS";
      return null;
    }
    return levelToBlockGrade(parseInt(b.block_level, 10));
  };

  // 프리셋 기반 직업×등급 카운트 (union_block 전체)
  const presetBlockCounts = useMemo(() => {
    const counts = new Map<string, number>();
    (presetData?.union_block ?? []).forEach((b) => {
      const grade = gradeForBlock(b);
      if (!grade) return;
      counts.set(`${b.block_type}:${grade}`, (counts.get(`${b.block_type}:${grade}`) ?? 0) + 1);
    });
    return counts;
  }, [presetData]);

  const activeCounts = useManual ? manualCounts : presetBlockCounts;

  const totalAvailableCells = useMemo(() => {
    let sum = 0;
    activeCounts.forEach((n, key) => {
      const g = key.split(":")[1] as BlockGrade;
      sum += n * (BLOCK_GRADE_CELL_COUNT[g] ?? 0);
    });
    return sum;
  }, [activeCounts]);

  // 섹터 키 → 해당 섹터 모든 셀 키 배열
  const regionCellsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (let y = MIN_Y; y <= MAX_Y; y++) {
      for (let x = MIN_X; x <= MAX_X; x++) {
        const sector = isInnerArea(x, y) ? getInnerRegion(x, y) : getOuterRegion(x, y);
        if (sector === null) continue;
        const rk = isInnerArea(x, y) ? `inner-${sector}` : `outer-${sector}`;
        if (!map.has(rk)) map.set(rk, []);
        map.get(rk)!.push(`${x},${y}`);
      }
    }
    return map;
  }, []);

  const getRegionKey = (x: number, y: number): string | null => {
    const sector = isInnerArea(x, y) ? getInnerRegion(x, y) : getOuterRegion(x, y);
    if (sector === null) return null;
    return isInnerArea(x, y) ? `inner-${sector}` : `outer-${sector}`;
  };

  const applyPaint = (x: number, y: number, mode: "add" | "remove") => {
    setPaintedCells((prev) => {
      const next = new Set(prev);
      if (groupMode) {
        const rk = getRegionKey(x, y);
        if (!rk) return prev;
        const cells = regionCellsMap.get(rk) ?? [];
        if (mode === "add") {
          // 보유 총 칸을 초과하지 않는 선에서만 추가 (일부만 들어갈 수도 있음)
          let budget = Math.max(0, totalAvailableCells - prev.size);
          if (budget === 0) return prev;
          for (const c of cells) {
            if (next.has(c)) continue;
            if (budget <= 0) break;
            next.add(c);
            budget--;
          }
        } else {
          cells.forEach((c) => next.delete(c));
        }
      } else {
        const k = `${x},${y}`;
        if (mode === "add") {
          // 이미 보유 총 칸에 도달했으면 더 이상 추가 X
          if (!next.has(k) && prev.size >= totalAvailableCells) return prev;
          next.add(k);
        } else {
          next.delete(k);
        }
      }
      return next;
    });
  };

  const handlePaintCellMouseDown = (e: React.MouseEvent, x: number, y: number) => {
    let currentlyPainted: boolean;
    if (groupMode) {
      const rk = getRegionKey(x, y);
      if (!rk) return;
      const cells = regionCellsMap.get(rk) ?? [];
      // 섹터 전체가 칠해져 있으면 "제거 모드", 아니면 "추가 모드"
      currentlyPainted = cells.length > 0 && cells.every((c) => paintedCells.has(c));
    } else {
      currentlyPainted = paintedCells.has(`${x},${y}`);
    }
    const mode: "add" | "remove" = currentlyPainted ? "remove" : "add";
    paintModeRef.current = mode;
    applyPaint(x, y, mode);
    setIsPainting(true);
    e.preventDefault();
  };

  const handlePaintCellMouseEnter = (x: number, y: number) => {
    if (!isPainting || !paintModeRef.current) return;
    // 그룹 모드에서는 같은 섹터를 중복 적용하지 않도록 개별 셀만 토글 방식으로
    if (groupMode) {
      applyPaint(x, y, paintModeRef.current);
    } else {
      applyPaint(x, y, paintModeRef.current);
    }
  };

  useEffect(() => {
    if (!isPainting) return;
    const up = () => {
      setIsPainting(false);
      paintModeRef.current = null;
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, [isPainting]);

  const handleManualReset = () => {
    setManualCounts(new Map(presetBlockCounts));
    setUseManual(true);
  };
  const handleManualRestore = () => {
    setUseManual(false);
  };

  const handleManualCountChange = (job: string, grade: BlockGrade, n: number) => {
    setManualCounts((prev) => {
      const next = new Map(prev);
      if (n <= 0) next.delete(`${job}:${grade}`);
      else next.set(`${job}:${grade}`, n);
      return next;
    });
  };

  // 카테고리 → 해당 카테고리에 속한 직업타입 목록
  const CATEGORY_TO_JOB_TYPES = useMemo(() => {
    const map = new Map<BlockJobCategory, string[]>();
    for (const [type, cat] of Object.entries(BLOCK_TYPE_TO_CATEGORY)) {
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(type);
    }
    return map;
  }, []);

  // 프리셋 로스터의 (직업타입:등급) → 블록 배열 인덱스 목록
  const rosterIndexByClass = useMemo(() => {
    const m = new Map<string, number[]>();
    (presetData?.union_block ?? []).forEach((b, idx) => {
      const grade = gradeForBlock(b);
      if (!grade) return;
      const key = `${b.block_type}:${grade}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(idx);
    });
    return m;
  }, [presetData]);

  // 색칠한 영역 검증: 중앙 2×2 점유 + 끊어진 영역 없음 (편집 탭과 동일 규칙)
  const hasPaintedCenter = useMemo(() => {
    const centerKeys = ["0,0", "-1,0", "0,1", "-1,1"];
    return centerKeys.some((k) => paintedCells.has(k));
  }, [paintedCells]);

  const paintedDisconnectedCells = useMemo(() => {
    const result = new Set<string>();
    if (paintedCells.size === 0) return result;

    const visited = new Set<string>();
    const components: Set<string>[] = [];
    paintedCells.forEach((start) => {
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
          if (paintedCells.has(nk) && !visited.has(nk)) {
            visited.add(nk);
            comp.add(nk);
            queue.push(nk);
          }
        }
      }
      components.push(comp);
    });

    if (components.length <= 1) return result;

    const centerKeys = ["0,0", "-1,0", "0,1", "-1,1"];
    let main = components.find((c) => centerKeys.some((k) => c.has(k)));
    if (!main) main = components.reduce((best, c) => (c.size > best.size ? c : best), components[0]);
    components.forEach((c) => {
      if (c === main) return;
      c.forEach((k) => result.add(k));
    });
    return result;
  }, [paintedCells]);

  const hasPaintedDisconnected = paintedDisconnectedCells.size > 0;

  const canAutoPlace = paintedCells.size > 0 && hasPaintedCenter && !hasPaintedDisconnected;

  // ── 자동 배치 솔버 실행 상태 / Worker 관리 ──
  type SolveStatus = "idle" | "running" | "timeout" | "unsolvable" | "ok" | "error";
  const [solveStatus, setSolveStatus] = useState<SolveStatus>("idle");
  const [solveElapsedMs, setSolveElapsedMs] = useState<number>(0);
  const workerRef = useRef<Worker | null>(null);
  const solveStartRef = useRef<number>(0);
  const solveTickerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      if (solveTickerRef.current !== null) window.clearInterval(solveTickerRef.current);
    };
  }, []);

  // 입력이 바뀌면 이전 결과 메시지/배치 초기화 (running 은 유지)
  useEffect(() => {
    setSolveStatus((s) => (s === "running" ? s : "idle"));
    setAutoPlacements(null);
  }, [paintedCells, activeCounts]);

  // 자동 배치 결과 (새 탭 그리드에만 시각화, localBlocks 는 건드리지 않음)
  const [autoPlacements, setAutoPlacements] = useState<Array<{
    classKey: string;
    orientationId: number;
    anchor: { x: number; y: number };
  }> | null>(null);

  const handleAutoPlace = () => {
    if (!canAutoPlace || solveStatus === "running") return;
    workerRef.current?.terminate();

    // activeCounts (직업타입:등급) → 카테고리:등급 단위로 합치기
    const byCategoryGrade = new Map<string, number>();
    activeCounts.forEach((cnt, key) => {
      if (cnt <= 0) return;
      const [jobType, grade] = key.split(":");
      const cat = BLOCK_TYPE_TO_CATEGORY[jobType];
      if (!cat) return;
      const k = `${cat}:${grade}`;
      byCategoryGrade.set(k, (byCategoryGrade.get(k) ?? 0) + cnt);
    });

    const classes: Array<{ key: string; count: number; orientations: Orientation[] }> = [];
    byCategoryGrade.forEach((count, key) => {
      const [cat, grade] = key.split(":") as [BlockJobCategory, BlockGrade];
      const shape = UNION_BLOCK_SHAPES[cat]?.[grade];
      if (!shape) return;
      classes.push({ key, count, orientations: generateOrientations(shape) });
    });

    setSolveStatus("running");
    setSolveElapsedMs(0);
    solveStartRef.current = Date.now();
    if (solveTickerRef.current !== null) window.clearInterval(solveTickerRef.current);
    solveTickerRef.current = window.setInterval(() => {
      setSolveElapsedMs(Date.now() - solveStartRef.current);
    }, 100);

    const worker = new Worker(new URL("@/utils/unionAutoPlace.worker.ts", import.meta.url));
    workerRef.current = worker;
    worker.onmessage = (e: MessageEvent<SolverResult>) => {
      const result = e.data;
      if (solveTickerRef.current !== null) {
        window.clearInterval(solveTickerRef.current);
        solveTickerRef.current = null;
      }
      setSolveElapsedMs(Date.now() - solveStartRef.current);
      if (result.status === "timeout") setSolveStatus("timeout");
      else if (result.status === "unsolvable") setSolveStatus("unsolvable");
      else if (result.status === "ok") {
        setAutoPlacements(result.placements);
        setSolveStatus("ok");
      }
      worker.terminate();
      workerRef.current = null;
    };
    worker.onerror = () => {
      setSolveStatus("error");
      if (solveTickerRef.current !== null) {
        window.clearInterval(solveTickerRef.current);
        solveTickerRef.current = null;
      }
      worker.terminate();
      workerRef.current = null;
    };
    worker.postMessage({ paintedKeys: Array.from(paintedCells), classes, timeoutMs: 60_000 });
  };

  const handleCancelAutoPlace = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    if (solveTickerRef.current !== null) {
      window.clearInterval(solveTickerRef.current);
      solveTickerRef.current = null;
    }
    setSolveStatus("idle");
  };

  // 자동 배치 결과(placements) 를 새 탭 그리드에 시각화하기 위한 cellMap + icon set.
  // localBlocks 는 건드리지 않고 오직 새 탭에서만 렌더용으로 사용한다.
  const categoryToBlockType = (cat: BlockJobCategory): string => (cat === "궁수_메이플M" ? "궁수" : cat);

  const { autoPlaceGrid, autoPlaceIcons, autoPlaceBorders } = useMemo(() => {
    const cellMap = new Map<string, { blockType: string; blockIdx: number }>();
    const icons = new Set<string>();
    const borders = new Map<string, React.CSSProperties>();
    if (!autoPlacements) return { autoPlaceGrid: cellMap, autoPlaceIcons: icons, autoPlaceBorders: borders };

    autoPlacements.forEach((p, blockIdx) => {
      const [cat, grade] = p.classKey.split(":") as [BlockJobCategory, BlockGrade];
      const shape = UNION_BLOCK_SHAPES[cat]?.[grade];
      if (!shape) return;
      const ori = generateOrientations(shape).find((o) => o.id === p.orientationId);
      if (!ori) return;
      const blockType = categoryToBlockType(cat);
      const cells = ori.cells.map((c) => ({ x: p.anchor.x + c.dx, y: p.anchor.y + c.dy }));
      cells.forEach((c) => cellMap.set(`${c.x},${c.y}`, { blockType, blockIdx }));
      const last = cells[cells.length - 1];
      icons.add(`${last.x},${last.y}`);
    });

    // 각 셀의 4방향 이웃을 보고, 이웃이 같은 블록이 아니면 그 방향에 테두리를 그림
    const line = "2px solid rgba(255,255,255,0.9)";
    cellMap.forEach((info, key) => {
      const [xs, ys] = key.split(",");
      const x = parseInt(xs, 10);
      const y = parseInt(ys, 10);
      const style: React.CSSProperties = {};
      const sameBlock = (nx: number, ny: number) => {
        const n = cellMap.get(`${nx},${ny}`);
        return !!n && n.blockIdx === info.blockIdx;
      };
      if (!sameBlock(x, y + 1)) style.borderTop = line;
      if (!sameBlock(x, y - 1)) style.borderBottom = line;
      if (!sameBlock(x - 1, y)) style.borderLeft = line;
      if (!sameBlock(x + 1, y)) style.borderRight = line;
      borders.set(key, style);
    });

    return { autoPlaceGrid: cellMap, autoPlaceIcons: icons, autoPlaceBorders: borders };
  }, [autoPlacements]);

  // 자동 배치 결과만 지우고 paintedCells 는 유지 (재실행용)
  const handleResetAutoPlaceResult = () => {
    setAutoPlacements(null);
    setSolveStatus("idle");
    setSolveElapsedMs(0);
  };

  const bringToTop = (blockIndex: number) => {
    setBlockOrder((prev) => {
      if (prev[prev.length - 1] === blockIndex) return prev;
      return [...prev.filter((i) => i !== blockIndex), blockIndex];
    });
  };

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

    for (const [regionId, pos] of Object.entries(INNER_LABEL_POS)) {
      const effect = innerStatMap.get(parseInt(regionId));
      if (effect) labels.set(`${pos.x},${pos.y}`, effect);
    }
    OUTER_LABELS.forEach((l) => labels.set(`${l.x},${l.y}`, l.name));

    return { grid: cellMap, iconCells: icons, gradeCountMap: counts, allLabels: labels, overlapCells: overlaps };
  }, [localBlocks, blockOrder, innerStatMap]);

  // 중앙 2x2 (0,0)/(-1,0)/(0,1)/(-1,1) 중 하나라도 점유되어야 함
  const hasCenterBlock = useMemo(() => {
    const centerKeys = ["0,0", "-1,0", "0,1", "-1,1"];
    return centerKeys.some((k) => grid.has(k));
  }, [grid]);

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
    // 모든 셀이 그리드 안에 들어오도록 잡은 셀이 가질 수 있는 좌표 범위 계산
    const bounds = {
      minX: MIN_X - Math.min(...dxs),
      maxX: MAX_X - Math.max(...dxs),
      minY: MIN_Y - Math.min(...dys),
      maxY: MAX_Y - Math.max(...dys),
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
      // 블록 전체가 그리드 영역 안에 남도록 클램프
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
                {presetNo === 0 ? "기본 프리셋" : `프리셋 ${presetNo}`}
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

          {/* 탭 */}
          <div
            className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-color-950/60
              border border-slate-200 dark:border-white/5 self-start"
          >
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                activeTab === "edit"
                  ? "bg-white dark:bg-color-800 text-black dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              현재 프리셋 편집
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                activeTab === "new"
                  ? "bg-white dark:bg-color-800 text-black dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              유니온 자동 배치
            </button>
          </div>

          {activeTab === "new" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
                아래 그리드에서 원하는 구역을 직접 칠한 뒤, 보유한 블록으로 자동 배치를 실행하세요.
              </p>

              {/* 그리드 컨트롤 (그룹 선택) */}
              <div className="flex flex-wrap items-center gap-3 px-1 text-md">
                <p className="font-bold text-gray-500 dark:text-gray-400">그리드</p>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input type="checkbox" checked={groupMode} onChange={(e) => setGroupMode(e.target.checked)} className="accent-sky-500" />
                  <span className="text-gray-600 dark:text-gray-300 font-semibold">그룹 선택</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPaintedCells(new Set())}
                  disabled={paintedCells.size === 0}
                  className="px-2 py-0.5 text-sm font-semibold rounded-md
                    bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20
                    disabled:opacity-40 disabled:cursor-not-allowed"
                  title="색칠한 칸 전부 해제"
                >
                  전체 해제
                </button>
                {solveStatus === "ok" && (
                  <button
                    type="button"
                    onClick={handleResetAutoPlaceResult}
                    className="px-2 py-0.5 text-sm font-semibold rounded-md
                      bg-amber-100 hover:bg-amber-200 text-amber-700
                      dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:text-amber-300
                      border border-amber-300/60 dark:border-amber-700/60"
                    title="자동 배치 결과 되돌리기"
                  >
                    결과 리셋
                  </button>
                )}
                {/* 규칙 경고 칩 — 이 행에 inline 으로 들어가 layout shift 방지. 끊어짐 우선. */}
                {hasPaintedDisconnected && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                      text-[11px] font-bold
                      bg-red-50 dark:bg-red-950/40
                      text-red-600 dark:text-red-300
                      border border-red-200 dark:border-red-800/60"
                    title="중앙 2×2와 이어지지 않은 색칠 구역이 존재합니다."
                  >
                    <span aria-hidden>⚠</span>
                    <span>끊어진 영역 있음</span>
                  </span>
                )}
                {paintedCells.size > 0 && !hasPaintedCenter && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                      text-[11px] font-bold
                      bg-red-50 dark:bg-red-950/40
                      text-red-600 dark:text-red-300
                      border border-red-200 dark:border-red-800/60"
                    title="중앙 2×2 영역 중 최소 한 칸은 색칠해야 합니다."
                  >
                    <span aria-hidden>⚠</span>
                    <span>중앙 2×2 비어 있음</span>
                  </span>
                )}
                <span className="ml-auto text-md text-gray-500 dark:text-gray-400">
                  칠한 칸{" "}
                  <span
                    className={`font-extrabold ${
                      paintedCells.size >= totalAvailableCells && totalAvailableCells > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-sky-600 dark:text-sky-400"
                    }`}
                  >
                    {paintedCells.size}
                  </span>
                  <span className="text-gray-400 mx-1">/</span>
                  보유 총 칸 <span className="font-bold text-gray-800 dark:text-gray-100">{totalAvailableCells}</span>
                </span>
              </div>

              {/* 페인트 가능한 빈 그리드 */}
              <div className="flex justify-center">
                <div
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
                      const isCenter = (x === 0 && y === 0) || (x === -1 && y === 0) || (x === 0 && y === 1) || (x === -1 && y === 1);
                      const isPainted = paintedCells.has(key);
                      const isPaintedDisconnected = paintedDisconnectedCells.has(key);
                      // 자동 배치 결과 표시 (solveStatus === "ok" 일 때)
                      const placed = solveStatus === "ok" ? autoPlaceGrid.get(key) : null;
                      const placedOverlay = placed ? BLOCK_TYPE_STYLES[placed.blockType]?.overlay ?? "bg-slate-500/30" : "";
                      // 섹터 경계선 + (배치된 셀이면) 블록 외곽 테두리 병합. 블록 테두리가 우선.
                      const borderStyle: React.CSSProperties = {
                        ...(borderStyles.get(key) ?? {}),
                        ...(placed ? autoPlaceBorders.get(key) ?? {} : {}),
                      };
                      const label = allLabels.get(key);
                      return (
                        <div
                          key={key}
                          onMouseDown={(e) => handlePaintCellMouseDown(e, x, y)}
                          onMouseEnter={() => handlePaintCellMouseEnter(x, y)}
                          className={`relative group aspect-square border border-[rgba(255,255,255,0.06)] select-none cursor-crosshair
                            ${placed ? BLOCK_BASE : isPainted ? "bg-sky-400/80" : isCenter ? "bg-[#4a5060]" : "bg-[#2e3038]"}
                          `}
                          style={borderStyle}
                        >
                          {placed && <div className={`absolute inset-0 ${placedOverlay} pointer-events-none`} />}
                          {/* hover 힌트: 그리지 않은 셀에선 살짝 밝아지게, 칠해진 셀에선 살짝 어두워지게 */}
                          <div
                            className={`absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 z-[5]
                              ${isPainted ? "bg-black/20" : "bg-white/15"}`}
                          />
                          {placed && autoPlaceIcons.has(key) && BLOCK_ICONS[placed.blockType] && (
                            <div className="absolute inset-[3px] max-[600px]:inset-[2px] pointer-events-none z-10 flex items-center justify-center">
                              <Image
                                src={BLOCK_ICONS[placed.blockType]}
                                alt={placed.blockType}
                                width={18}
                                height={18}
                                className="w-full h-full object-contain"
                                unoptimized
                              />
                            </div>
                          )}
                          {isPaintedDisconnected && (
                            <div className="absolute inset-0 ring-2 ring-red-500 ring-inset bg-red-500/40 pointer-events-none z-[25]" />
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
                </div>
              </div>

              {/* 블록 목록 컨트롤 (소스 / 리셋·복구) */}
              <div className="flex flex-wrap items-center gap-3 px-1 text-md">
                <button
                  type="button"
                  onClick={() => setIsBlockListExpanded((v) => !v)}
                  aria-expanded={isBlockListExpanded}
                  title={isBlockListExpanded ? "접기" : "펼치기"}
                  className={`group flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-lg border text-sm font-bold transition-colors
                    ${
                      isBlockListExpanded
                        ? "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300"
                        : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-white/10"
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                    className="w-4 h-4 transition-transform"
                    style={{ transform: isBlockListExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>보유 블록 목록</span>
                  <span
                    className={`text-[11px] font-semibold px-1.5 py-0.5 rounded
                      ${
                        isBlockListExpanded
                          ? "bg-sky-100 dark:bg-sky-900/50"
                          : "bg-white/60 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                      }`}
                  >
                    {isBlockListExpanded ? "접기" : "펼치기"}
                  </span>
                </button>
                {/* 세그먼트 컨트롤: 프리셋 ↔ 직접 선택 */}
                <div
                  role="tablist"
                  aria-label="블록 데이터 소스"
                  className="flex gap-0.5 p-0.5 rounded-lg bg-slate-200 dark:bg-color-950/60 border border-slate-200 dark:border-white/5"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={!useManual}
                    onClick={handleManualRestore}
                    className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
                      !useManual
                        ? "bg-white dark:bg-color-800 text-sky-700 dark:text-sky-300 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                    title="현재 진입한 프리셋에 저장된 블록 구성을 사용합니다"
                  >
                    프리셋 ({presetNo === 0 ? "기본" : `${presetNo}번`})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={useManual}
                    onClick={handleManualReset}
                    className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
                      useManual
                        ? "bg-white dark:bg-color-800 text-amber-700 dark:text-amber-300 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                    title="원하는 블록 개수를 직접 입력합니다"
                  >
                    직접 선택
                  </button>
                </div>
                <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                  보유 총 칸 <span className="font-bold text-gray-800 dark:text-gray-100">{totalAvailableCells}</span>
                </span>
              </div>

              {/* 모드 설명 (접힘/펼침 상관없이 항상 노출) */}
              <p className="px-1 text-sm text-gray-500 dark:text-gray-400">
                {useManual
                  ? "ⓘ 직접 선택 — 각 직업/등급별로 사용할 블록 개수를 입력하세요."
                  : "ⓘ 프리셋 — 현재 진입한 프리셋에 저장된 블록 구성을 그대로 사용합니다."}
              </p>

              {/* 직업 × 등급 카운트 테이블 (수동 모드에서 편집 가능). 펼침/접힘 가능 */}
              {isBlockListExpanded && (
                <div
                  className="rounded-xl border border-slate-200/80 dark:border-white/10
                bg-slate-50 dark:bg-color-950/40 overflow-x-auto"
                >
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-white/10">
                        <th className="text-left px-3 py-2 text-[12px] font-bold text-gray-500 dark:text-gray-400 w-[140px] max-[600px]:w-auto">직업</th>
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
                          <td className="px-3 py-2 max-[600px]:px-2">
                            <div className="flex items-center gap-2">
                              {BLOCK_ICONS[job] && <Image src={BLOCK_ICONS[job]} alt={job} width={16} height={16} unoptimized />}
                              <span className="font-bold text-[13px] max-[600px]:hidden">{job}</span>
                            </div>
                          </td>
                          {BLOCK_GRADES.map((grade) => {
                            const count = activeCounts.get(`${job}:${grade}`) ?? 0;
                            return (
                              <td key={grade} className="px-2 py-2 text-center">
                                <select
                                  value={count}
                                  disabled={!useManual}
                                  onChange={(e) => handleManualCountChange(job, grade, parseInt(e.target.value, 10))}
                                  className={`w-[56px] text-center rounded-md border text-[12px] font-semibold
                                  bg-white dark:bg-color-900 border-slate-300 dark:border-white/10
                                  text-gray-700 dark:text-gray-200
                                  focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-600
                                  py-1 ${!useManual ? "opacity-60 cursor-not-allowed" : ""}`}
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
              )}

              {/* 자동 배치 영역 (배지 + 버튼, 중앙정렬) + 상태 메시지 */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {canAutoPlace && (
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full
                        text-[13px] font-extrabold
                        text-emerald-700 dark:text-emerald-300
                        bg-emerald-100 dark:bg-emerald-500/20
                        border border-emerald-400/70 dark:border-emerald-500/60
                        shadow-sm shadow-emerald-500/20
                        animate-pulse"
                    >
                      <span aria-hidden>✓</span>
                      <span>준비 완료</span>
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={!canAutoPlace || solveStatus === "running"}
                    onClick={handleAutoPlace}
                    className={`px-6 py-2.5 rounded-lg text-xl font-extrabold text-white transition-all ${
                      canAutoPlace && solveStatus !== "running"
                        ? "bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600"
                        : solveStatus === "running"
                        ? "bg-gradient-to-r from-sky-500 to-indigo-500 opacity-90 cursor-wait"
                        : "bg-slate-400 dark:bg-slate-600 opacity-50 cursor-not-allowed"
                    }`}
                    title={
                      solveStatus === "running"
                        ? "자동 배치 탐색 중"
                        : canAutoPlace
                        ? "칠한 구역에 블록 자동 배치"
                        : "칠한 칸 수가 보유 총 칸과 일치하고, 중앙 2×2 점유 + 끊어진 영역이 없어야 합니다."
                    }
                  >
                    {solveStatus === "running" ? (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block w-4 h-4 rounded-full border-[3px] border-white/80 border-t-transparent animate-spin"
                          aria-hidden
                        />
                        <span>탐색 중…</span>
                        <span className="tabular-nums text-[14px] font-bold opacity-80">{(solveElapsedMs / 1000).toFixed(1)}s</span>
                      </span>
                    ) : (
                      <>자동 배치 시작!</>
                    )}
                  </button>
                  {solveStatus === "running" && (
                    <button
                      type="button"
                      onClick={handleCancelAutoPlace}
                      className="px-3 py-2 rounded-lg text-[13px] font-semibold
                        bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20
                        text-gray-700 dark:text-gray-200"
                    >
                      취소
                    </button>
                  )}
                </div>

                {/* 솔버 상태 메시지 (실패/시간초과/오류) */}
                {solveStatus === "unsolvable" && (
                  <div className="text-[13px] font-bold text-red-600 dark:text-red-400">
                    ✕ 선택한 블록 구성으로는 이 구역을 정확히 채울 수 없습니다.
                  </div>
                )}
                {solveStatus === "timeout" && (
                  <div className="text-[13px] font-bold text-amber-600 dark:text-amber-400">
                    ⏱ 시간 초과 (60s). 구역이나 블록 구성을 조금 바꿔 다시 시도해 주세요.
                  </div>
                )}
                {solveStatus === "error" && (
                  <div className="text-[13px] font-bold text-red-600 dark:text-red-400">✕ 자동 배치 실행 중 오류가 발생했습니다.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === "edit" && (
            <>
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
                    text-[11px] font-bold
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
                    text-[11px] font-bold
                    bg-red-50 dark:bg-red-950/40
                    text-red-600 dark:text-red-300
                    border border-red-200 dark:border-red-800/60"
                      title="중앙 2×2 영역 중 최소 한 칸은 블록으로 점유해야 합니다."
                    >
                      <span aria-hidden>⚠</span>
                      <span>중앙 2×2 영역이 비어 있음</span>
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
            </>
          )}
        </div>
      </div>

      <DimmedLayer style={{ zIndex: 10000 }} />
    </>
  );
};
