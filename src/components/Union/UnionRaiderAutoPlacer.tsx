"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  BLOCK_GRADES,
  BLOCK_GRADE_CELL_COUNT,
  BLOCK_TYPE_TO_CATEGORY,
  UNION_BLOCK_SHAPES,
  levelToBlockGrade,
  type BlockGrade,
} from "@/constants/unionBlockShapes";
import { generateOrientations, type Orientation, type SolverResult } from "@/utils/unionAutoPlace";
import { openModal } from "@/utils/openModal";
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
  ROWS,
  getInnerRegion,
  getOuterRegion,
  isInnerArea,
  useAllLabels,
  type PresetData,
} from "@/components/Union/unionRaiderDialogShared";

const TIMEOUT_MS = 90_000;
const TIMEOUT_MESSAGE = `⏱ 시간 초과 (${TIMEOUT_MS / 1000}s). 구역이나 블록 구성을 조금 바꿔 다시 시도해 주세요.`;

// 색칠 구역 저장 (localStorage). 탭 전환/세션 간 재사용 목적.
const SAVED_PAINTS_KEY = "unionAutoPlacer.savedPaints.v1";
const MAX_SAVED_PAINTS = 5;

type SavedPaint = {
  cells: string[]; // "x,y" 키 배열
  savedAt: number; // epoch ms
};

const loadSavedPaints = (): SavedPaint[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_PAINTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e): e is SavedPaint => !!e && Array.isArray(e.cells) && typeof e.savedAt === "number")
      .slice(0, MAX_SAVED_PAINTS);
  } catch {
    return [];
  }
};

const persistSavedPaints = (list: SavedPaint[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVED_PAINTS_KEY, JSON.stringify(list));
  } catch {
    // storage full / disabled — 무시
  }
};

type Props = {
  presetData: PresetData | null;
  presetNo: number;
  hidden: boolean;
};

export const UnionRaiderAutoPlacer = ({ presetData, presetNo, hidden }: Props) => {
  const allLabels = useAllLabels(presetData);

  // 블록의 "실제 등급" — block의 고유 레벨 우선.
  // 메이플 M 캐릭터처럼 레벨→등급 규칙이 일반 직업과 다른 타입도 올바르게 반영된다.
  const gradeForBlock = (b: { block_level: string; block_class: string }): BlockGrade | null => {
    return levelToBlockGrade(parseInt(b.block_level, 10), b.block_class);
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

  const [useManual, setUseManual] = useState(false);
  const [manualCounts, setManualCounts] = useState<Map<string, number>>(new Map());
  const [paintedCells, setPaintedCells] = useState<Set<string>>(new Set());
  const [groupMode, setGroupMode] = useState(false);
  const paintModeRef = useRef<"add" | "remove" | null>(null);
  const [isPainting, setIsPainting] = useState(false);

  // 저장된 색칠 구역 (localStorage). 최초 마운트 시에만 읽어서 state 로 관리한다.
  const [savedPaints, setSavedPaints] = useState<SavedPaint[]>([]);
  useEffect(() => {
    setSavedPaints(loadSavedPaints());
  }, []);
  // 보유 블록 목록 섹션 펼침 상태 (기본: 접힘, useManual 전환 시 자동 펼침)
  const [isBlockListExpanded, setIsBlockListExpanded] = useState(false);
  const prevUseManualRef = useRef(useManual);
  useEffect(() => {
    if (prevUseManualRef.current !== useManual) {
      setIsBlockListExpanded(true);
      prevUseManualRef.current = useManual;
    }
  }, [useManual]);

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

  // ── 자동 배치 솔버 실행 상태 / Worker 관리 ──
  type SolveStatus = "idle" | "running" | "timeout" | "unsolvable" | "ok" | "error";
  const [solveStatus, setSolveStatus] = useState<SolveStatus>("idle");
  const [solveElapsedMs, setSolveElapsedMs] = useState<number>(0);
  const workerRef = useRef<Worker | null>(null);
  const solveStartRef = useRef<number>(0);
  const solveTickerRef = useRef<number | null>(null);

  const canAutoPlace = paintedCells.size > 0 && hasPaintedCenter && !hasPaintedDisconnected;

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      if (solveTickerRef.current !== null) window.clearInterval(solveTickerRef.current);
    };
  }, []);

  // 자동 배치 결과 (새 탭 그리드에만 시각화, localBlocks 는 건드리지 않음)
  const [autoPlacements, setAutoPlacements] = useState<Array<{
    classKey: string;
    orientationId: number;
    anchor: { x: number; y: number };
  }> | null>(null);

  // 입력이 바뀌면 이전 결과 메시지/배치 초기화 (running 은 유지)
  useEffect(() => {
    setSolveStatus((s) => (s === "running" ? s : "idle"));
    setAutoPlacements(null);
  }, [paintedCells, activeCounts]);

  const handleAutoPlace = () => {
    if (!canAutoPlace || solveStatus === "running") return;
    workerRef.current?.terminate();

    // classKey 는 원본 jobType:grade 로 유지한다. 이렇게 하면 궁수 vs 메이플M 처럼
    // 같은 category("궁수_메이플M") 로 묶이는 jobType 도 결과 렌더 시 서로 다른
    // 아이콘/색상으로 구분할 수 있다. 공유 shape 는 바로 다음의 same-shape 병합 단계에서
    // 탐색 효율을 위해 자동 그룹화된다.
    const classes: Array<{ key: string; count: number; orientations: Orientation[] }> = [];
    activeCounts.forEach((count, key) => {
      if (count <= 0) return;
      const [jobType, grade] = key.split(":");
      const cat = BLOCK_TYPE_TO_CATEGORY[jobType];
      if (!cat) return;
      const shape = UNION_BLOCK_SHAPES[cat]?.[grade as BlockGrade];
      if (!shape) return;
      classes.push({ key: `${jobType}:${grade}`, count, orientations: generateOrientations(shape) });
    });

    // Same-shape 병합: 서로 다른 (카테고리, 등급) 이지만 orientation 집합이 동일한 클래스를
    // 하나로 묶어 count 를 합친다. 솔버 탐색 시 중복 슬롯 순열을 제거해 탐색 공간이 극적으로 줄어든다
    // (예: 도적 SS + 하이브리드 SS 는 동일 L-shape → 6 배 감속).
    // 병합 결과의 대표 key 는 첫 원본 classKey 를 쓰고, 각 원본 (key, count) 리스트를 별도 보관해
    // 솔버 결과 수신 시 placements 를 원래 classKey 로 되돌려준다.
    const fingerprint = (orientations: Orientation[]): string =>
      orientations
        .map((o) => o.cells.map((c) => `${c.dx},${c.dy}`).join(",") + "#" + o.iconCellIdx)
        .sort()
        .join("|");

    type MergeGroup = { repKey: string; count: number; orientations: Orientation[]; originals: Array<{ key: string; count: number }> };
    const mergeMap = new Map<string, MergeGroup>();
    for (const c of classes) {
      const fp = fingerprint(c.orientations);
      const g = mergeMap.get(fp);
      if (g) {
        g.count += c.count;
        g.originals.push({ key: c.key, count: c.count });
      } else {
        mergeMap.set(fp, { repKey: c.key, count: c.count, orientations: c.orientations, originals: [{ key: c.key, count: c.count }] });
      }
    }
    const mergedClasses: Array<{ key: string; count: number; orientations: Orientation[] }> = [];
    // repKey → originals 리스트 매핑 (결과 분배에 사용)
    const mergeMeta = new Map<string, Array<{ key: string; count: number }>>();
    mergeMap.forEach((g) => {
      mergedClasses.push({ key: g.repKey, count: g.count, orientations: g.orientations });
      mergeMeta.set(g.repKey, g.originals);
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
      else if (result.status === "unsolvable") {
        setSolveStatus("unsolvable");
        openModal({ message: "선택한 블록 구성으로는 정확히 채울 수 없습니다.\n색칠한 칸을 조금 바꿔 다시 시도해 주세요." });
      } else if (result.status === "ok") {
        // 병합 대표 key 로 반환된 placements 를 원본 classKey 로 분배한다.
        // 같은 shape 클래스들은 시각적으로 구분 불가하므로 원본 (key, count) 순서대로 소진.
        const perKeyCounter = new Map<string, number>();
        const distributed = result.placements.map((p) => {
          const originals = mergeMeta.get(p.classKey);
          if (!originals || originals.length === 1) return p;
          const used = perKeyCounter.get(p.classKey) ?? 0;
          let cursor = used;
          for (const o of originals) {
            if (cursor < o.count) {
              perKeyCounter.set(p.classKey, used + 1);
              return { ...p, classKey: o.key };
            }
            cursor -= o.count;
          }
          // 폴백 (도달 불가): 마지막 원본
          perKeyCounter.set(p.classKey, used + 1);
          return { ...p, classKey: originals[originals.length - 1].key };
        });
        setAutoPlacements(distributed);
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
    worker.postMessage({
      paintedKeys: Array.from(paintedCells),
      classes: mergedClasses,
      timeoutMs: TIMEOUT_MS,
      // 성공 조건: 어떤 배치에서든 중앙 2×2 에 적어도 하나의 블록 아이콘이 있어야 함
      requireCenterIcon: true,
    });
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
  // classKey 는 "jobType:grade" 형식이며, jobType 이 그대로 blockType (아이콘/색상 키) 로 쓰인다.
  const { autoPlaceGrid, autoPlaceIcons, autoPlaceBorders } = useMemo(() => {
    const cellMap = new Map<string, { blockType: string; blockIdx: number }>();
    const icons = new Set<string>();
    const borders = new Map<string, React.CSSProperties>();
    if (!autoPlacements) return { autoPlaceGrid: cellMap, autoPlaceIcons: icons, autoPlaceBorders: borders };

    autoPlacements.forEach((p, blockIdx) => {
      const [jobType, grade] = p.classKey.split(":") as [string, BlockGrade];
      const cat = BLOCK_TYPE_TO_CATEGORY[jobType];
      if (!cat) return;
      const shape = UNION_BLOCK_SHAPES[cat]?.[grade];
      if (!shape) return;
      const ori = generateOrientations(shape).find((o) => o.id === p.orientationId);
      if (!ori) return;
      const blockType = jobType;
      const cells = ori.cells.map((c) => ({ x: p.anchor.x + c.dx, y: p.anchor.y + c.dy }));

      cells.forEach((c) => cellMap.set(`${c.x},${c.y}`, { blockType, blockIdx }));
      // 아이콘 위치는 shape 의 "$" 셀 (orientation.iconCellIdx 가 가리키는 cells 의 인덱스).
      // 회전/대칭 후에도 정상적으로 "$" 에서 변환된 셀을 추적한다.
      const iconCell = cells[ori.iconCellIdx] ?? cells[0];
      icons.add(`${iconCell.x},${iconCell.y}`);
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

  // ── 색칠 구역 저장/불러오기/삭제 ──
  const canSavePaint = paintedCells.size > 0 && savedPaints.length < MAX_SAVED_PAINTS;

  const handleSavePaint = () => {
    if (!canSavePaint) return;
    openModal({
      type: "confirm",
      message: `현재 색칠한 ${paintedCells.size}칸을 저장하시겠어요?`,
      confirmCallback: () => {
        const entry: SavedPaint = { cells: Array.from(paintedCells), savedAt: Date.now() };
        const next = [...savedPaints, entry];
        setSavedPaints(next);
        persistSavedPaints(next);
      },
    });
  };

  const handleLoadPaint = (idx: number) => {
    const entry = savedPaints[idx];
    if (!entry) return;
    setPaintedCells(new Set(entry.cells));
  };

  const handleDeletePaint = (idx: number) => {
    openModal({
      type: "confirm",
      message: "저장한 색칠 구역을 삭제하시겠어요?",
      confirmCallback: () => {
        const next = savedPaints.filter((_, i) => i !== idx);
        setSavedPaints(next);
        persistSavedPaints(next);
      },
    });
  };

  return (
    <div className={hidden ? "hidden" : "flex flex-col gap-3"}>
      <p className="text-sm text-gray-500 dark:text-gray-400 px-1">원하는 구역을 직접 칠한 뒤, 보유한 블록으로 자동 배치를 실행하세요.</p>

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
          {GRID_ROWS.map((y) =>
            GRID_COLS.map((x) => {
              const key = `${x},${y}`;
              const isCenter = (x === 0 && y === 0) || (x === -1 && y === 0) || (x === 0 && y === 1) || (x === -1 && y === 1);
              const isPainted = paintedCells.has(key);
              const isPaintedDisconnected = paintedDisconnectedCells.has(key);
              // 자동 배치 결과 표시 (solveStatus === "ok" 일 때)
              const placed = solveStatus === "ok" ? autoPlaceGrid.get(key) : null;
              const placedOverlay = placed ? BLOCK_TYPE_STYLES[placed.blockType]?.overlay ?? "bg-slate-500/30" : "";
              // 섹터 경계선 + (배치된 셀이면) 블록 외곽 테두리 병합. 블록 테두리가 우선.
              const borderStyle: React.CSSProperties = {
                ...(BORDER_STYLES.get(key) ?? {}),
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

      {/*
        보유 블록 목록 카드 — 제목/세그먼트/펼침 토글을 한 헤더에 모으고,
        모드 설명·테이블을 본문에 배치한다. "보유 총 칸" 은 상단 그리드 컨트롤에
        이미 노출되므로 여기서는 제거. "탐색 X초" 는 자동 배치 상태줄로 이동.
      */}

      {/* 그리드 컨트롤 (그룹 선택) */}
      <div className="flex flex-wrap items-center gap-3 px-1 py-1 text-md">
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
              bg-violet-100 hover:bg-violet-200 text-violet-700 dark:text-violet-100
              dark:bg-indigo-500/60 dark:hover:bg-indigo-500/50"
            title="자동 배치 결과 되돌리기"
          >
            ⭮ 배치 결과 리셋
          </button>
        )}
        {/* 규칙 경고 칩 — 이 행에 inline 으로 들어가 layout shift 방지. 끊어짐 우선. */}
        {hasPaintedDisconnected && (
          <span
            className="inline-flex items-center gap-1 px-2 rounded-full
              text-sm font-bold
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
            className="inline-flex items-center gap-1 px-2 rounded-full
              text-sm font-bold
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

      {/* 저장된 색칠 구역 (localStorage, 최대 MAX_SAVED_PAINTS 개). 클릭 시 불러오고 ×로 삭제. */}
      <div className="flex flex-wrap items-center gap-2 px-1 py-1 text-sm">
        <p className="font-bold text-gray-500 dark:text-gray-400">저장한 구역</p>
        {savedPaints.length === 0 ? (
          <span className="text-xs text-gray-400 dark:text-gray-500">저장된 구역이 없습니다</span>
        ) : (
          savedPaints.map((entry, idx) => (
            <div
              key={entry.savedAt}
              className="inline-flex items-stretch rounded-md border border-slate-200 dark:border-white/10
                bg-white dark:bg-color-900 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => handleLoadPaint(idx)}
                title={`${entry.cells.length}칸 · ${new Date(entry.savedAt).toLocaleString()} (클릭하여 불러오기)`}
                className="px-2.5 py-0.5 text-sm font-semibold text-sky-700 dark:text-sky-300
                  hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
              >
                #{idx + 1}
                <span className="ml-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">({entry.cells.length}칸)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeletePaint(idx)}
                title="삭제"
                aria-label={`저장 ${idx + 1} 삭제`}
                className="px-1.5 text-gray-400 hover:text-red-500
                  hover:bg-red-50 dark:hover:bg-red-900/20
                  border-l border-slate-200 dark:border-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
          ))
        )}
        <button
          type="button"
          onClick={handleSavePaint}
          disabled={!canSavePaint}
          title={
            paintedCells.size === 0
              ? "먼저 색칠한 칸이 있어야 저장할 수 있습니다"
              : savedPaints.length >= MAX_SAVED_PAINTS
              ? `최대 ${MAX_SAVED_PAINTS}개까지만 저장할 수 있습니다`
              : "현재 색칠한 구역을 저장"
          }
          className="ml-auto px-2 py-0.5 text-sm font-semibold rounded-md
            border border-sky-300 dark:border-sky-700
            text-sky-700 dark:text-sky-300
            bg-sky-50/60 hover:bg-sky-100 dark:bg-sky-900/20 dark:hover:bg-sky-900/40
            disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ＋ 저장 <span className="text-[11px] font-medium opacity-70">({savedPaints.length}/{MAX_SAVED_PAINTS})</span>
        </button>
      </div>

      <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-color-950/40 overflow-hidden">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">보유 블록 목록</p>
          <div className="flex items-center gap-2">
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
            <button
              type="button"
              onClick={() => setIsBlockListExpanded((v) => !v)}
              aria-expanded={isBlockListExpanded}
              title={isBlockListExpanded ? "블록 목록 접기" : "블록 목록 펼치기"}
              className="w-8 h-8 flex items-center justify-center rounded-md
                text-gray-600 dark:text-gray-300
                hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
                className="w-5 h-5 transition-transform"
                style={{ transform: isBlockListExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 모드 설명 (접힘/펼침 상관없이 항상 노출) */}
        <p className="px-3 pb-2 text-xs text-gray-500 dark:text-gray-400">
          {useManual
            ? "ⓘ 직접 선택 — 각 직업/등급별로 사용할 블록 개수를 입력하세요."
            : "ⓘ 프리셋 — 현재 진입한 프리셋에 저장된 블록 구성을 그대로 사용합니다."}
        </p>

        {/* 직업 × 등급 카운트 테이블 (수동 모드에서 편집 가능). 펼침/접힘 가능 */}
        {isBlockListExpanded && (
          <div className="border-t border-slate-200/80 dark:border-white/10 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/10">
                  <th className="text-left px-3 py-2 text-[12px] font-bold text-gray-500 dark:text-gray-400 w-[140px] max-[600px]:w-auto">
                    직업
                  </th>
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
                          <input
                            type="number"
                            min={0}
                            value={count}
                            disabled={!useManual}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const parsed = raw === "" ? 0 : parseInt(raw, 10);
                              if (Number.isNaN(parsed)) return;
                              handleManualCountChange(job, grade, Math.max(0, parsed));
                            }}
                            className={`w-[56px] text-center rounded-md border text-[12px] font-semibold
                            bg-white dark:bg-color-900 border-slate-300 dark:border-white/10
                            text-gray-700 dark:text-gray-200
                            focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-600
                            py-1 ${!useManual ? "opacity-60 cursor-not-allowed" : ""}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 자동 배치 영역 (배지 + 버튼, 중앙정렬) + 상태 메시지 */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-3 flex-wrap">
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

        {/* 솔버 상태 메시지 (시간초과/오류/완료 — unsolvable 은 공통 모달로 표시) */}
        <div className="min-h-[20px] text-[13px] font-bold" aria-live="polite">
          {solveStatus === "running" && solveElapsedMs > 60000 && (
            <span className="text-amber-600 dark:text-amber-400">
              TIP: 시간이 오래 걸리면 색칠한 칸을 조금 바꿔서 시도해 주세요. (90초 이상은 실패 처리)
            </span>
          )}
          {solveStatus === "timeout" && <span className="text-amber-600 dark:text-amber-400">{TIMEOUT_MESSAGE}</span>}
          {solveStatus === "error" && <span className="text-red-600 dark:text-red-400">✕ 자동 배치 실행 중 오류가 발생했습니다.</span>}
          {solveStatus === "ok" && (
            <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
              ✓ 배치 완료 · 탐색 {(solveElapsedMs / 1000).toFixed(2)}초
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
