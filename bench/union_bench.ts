/**
 * Union 자동 배치 솔버 벤치마크.
 *
 * 세 가지 변종을 동일 입력에 대해 비교한다 (requireCenterIcon=true 고정):
 *   - baseline: 현재 프로덕션 로직 (unit propagation 포함)
 *   - earlyCenterGuard: MRV 스캔 시, 중앙 2x2 에 아이콘이 아직 없는데 center 에
 *     아이콘을 놓을 수 있는 active row 가 전무하면 즉시 fail
 *   - centerFirstRoot: 최초 재귀에서만 후보를 "iconBit ∈ 중앙 2x2" 인 row 로 제한
 *     (이후 재귀는 평소대로)
 *
 * 실행:
 *   npx tsx bench/union_bench.ts
 */

import { UNION_BLOCK_SHAPES, type BlockJobCategory, type BlockGrade } from "../src/constants/unionBlockShapes";
import {
  generateOrientations,
  cellToBitIdx,
  MIN_X,
  MAX_X,
  MIN_Y,
  MAX_Y,
  TOTAL_CELLS,
  solve as solveProduction,
  type Orientation,
  type SolverClass,
  type SolverInput,
  type SolverResult,
  type Placement,
} from "../src/utils/unionAutoPlace";

// ── 내부 헬퍼 (프로덕션 코드엔 non-export 라서 로컬 재구현) ──
const WORDS = (TOTAL_CELLS + 31) >>> 5;
type BitBoard = Uint32Array;
const boardNew = (): BitBoard => new Uint32Array(WORDS);
const boardSetBit = (b: BitBoard, idx: number) => {
  b[idx >>> 5] |= 1 << (idx & 31);
};
const boardHasBit = (b: BitBoard, idx: number) => (b[idx >>> 5] & (1 << (idx & 31))) !== 0;
const paintedKeysToBoard = (keys: string[]): BitBoard => {
  const b = boardNew();
  for (const k of keys) {
    const [xs, ys] = k.split(",");
    boardSetBit(b, cellToBitIdx(parseInt(xs, 10), parseInt(ys, 10)));
  }
  return b;
};
const CENTER_BIT_IDS = [cellToBitIdx(0, 0), cellToBitIdx(-1, 0), cellToBitIdx(0, 1), cellToBitIdx(-1, 1)];
// 빠른 O(1) 룩업용 Uint8Array. Set.has() 보다 오버헤드 작음.
const centerBitMask = new Uint8Array(TOTAL_CELLS);
for (const b of CENTER_BIT_IDS) centerBitMask[b] = 1;

type Row = { classIdx: number; orientationId: number; anchor: { x: number; y: number }; cells: number[]; iconBit: number };

type Mode = "baseline" | "earlyCenterGuard" | "centerFirstRoot";

const solveVariant = (input: SolverInput, mode: Mode): SolverResult => {
  const timeoutMs = input.timeoutMs ?? 60_000;
  const { classes } = input;
  const painted = paintedKeysToBoard(input.paintedKeys);

  const paintedCells: number[] = [];
  for (let i = 0; i < TOTAL_CELLS; i++) if (boardHasBit(painted, i)) paintedCells.push(i);

  const rows: Row[] = [];
  const cellRows: number[][] = new Array(TOTAL_CELLS);
  const classRows: number[][] = new Array(classes.length);
  for (let i = 0; i < TOTAL_CELLS; i++) cellRows[i] = [];
  for (let i = 0; i < classes.length; i++) classRows[i] = [];

  for (const anchorBit of paintedCells) {
    const anchor = { x: (anchorBit % 22) + MIN_X, y: Math.floor(anchorBit / 22) + MIN_Y };
    for (let classIdx = 0; classIdx < classes.length; classIdx++) {
      for (const ori of classes[classIdx].orientations) {
        const cells: number[] = [];
        let valid = true;
        for (const c of ori.cells) {
          const x = anchor.x + c.dx;
          const y = anchor.y + c.dy;
          if (x < MIN_X || x > MAX_X || y < MIN_Y || y > MAX_Y) {
            valid = false;
            break;
          }
          const bit = cellToBitIdx(x, y);
          if (!boardHasBit(painted, bit)) {
            valid = false;
            break;
          }
          cells.push(bit);
        }
        if (valid) {
          const rowIdx = rows.length;
          const iconOff = ori.cells[ori.iconCellIdx] ?? ori.cells[0];
          const iconBit = cellToBitIdx(anchor.x + iconOff.dx, anchor.y + iconOff.dy);
          rows.push({ classIdx, orientationId: ori.id, anchor, cells, iconBit });
          for (const b of cells) cellRows[b].push(rowIdx);
          classRows[classIdx].push(rowIdx);
        }
      }
    }
  }

  for (let i = 0; i < TOTAL_CELLS; i++) {
    const list = cellRows[i];
    if (list.length > 1) list.sort((a, b) => rows[b].cells.length - rows[a].cells.length);
  }

  const rowActive = new Uint8Array(rows.length);
  rowActive.fill(1);
  const remaining = classes.map((c) => c.count);
  const cellCovered = new Uint8Array(TOTAL_CELLS);
  const cellValidCount = new Int32Array(TOTAL_CELLS);
  for (const r of rows) for (const b of r.cells) cellValidCount[b]++;

  // earlyCenterGuard 모드 전용: iconBit ∈ center 인 active row 수 incremental
  let centerCapableCount = 0;
  if (mode === "earlyCenterGuard") {
    for (let i = 0; i < rows.length; i++) {
      if (rowActive[i] && centerBitMask[rows[i].iconBit] === 1) centerCapableCount++;
    }
  }

  for (let c = 0; c < classes.length; c++) {
    if (remaining[c] <= 0) {
      for (const rIdx of classRows[c]) {
        if (rowActive[rIdx]) {
          rowActive[rIdx] = 0;
          for (const b of rows[rIdx].cells) cellValidCount[b]--;
          if (mode === "earlyCenterGuard" && centerBitMask[rows[rIdx].iconBit] === 1) centerCapableCount--;
        }
      }
    }
  }

  const placements: Placement[] = [];
  const startTime = Date.now();
  let nodes = 0;
  let timedOut = false;
  const requireCenter = input.requireCenterIcon ?? false;
  let iconsInCenter = 0;

  const applyRow = (rowIdx: number): number[] => {
    const row = rows[rowIdx];
    const deactivated: number[] = [];
    for (const b of row.cells) cellCovered[b] = 1;
    for (const b of row.cells) {
      const users = cellRows[b];
      for (let i = 0; i < users.length; i++) {
        const rIdx = users[i];
        if (!rowActive[rIdx]) continue;
        rowActive[rIdx] = 0;
        deactivated.push(rIdx);
        const otherRow = rows[rIdx];
        for (let j = 0; j < otherRow.cells.length; j++) cellValidCount[otherRow.cells[j]]--;
        if (mode === "earlyCenterGuard" && centerBitMask[otherRow.iconBit] === 1) centerCapableCount--;
      }
    }
    remaining[row.classIdx]--;
    if (remaining[row.classIdx] === 0) {
      const list = classRows[row.classIdx];
      for (let i = 0; i < list.length; i++) {
        const rIdx = list[i];
        if (!rowActive[rIdx]) continue;
        rowActive[rIdx] = 0;
        deactivated.push(rIdx);
        const otherRow = rows[rIdx];
        for (let j = 0; j < otherRow.cells.length; j++) cellValidCount[otherRow.cells[j]]--;
        if (mode === "earlyCenterGuard" && centerBitMask[otherRow.iconBit] === 1) centerCapableCount--;
      }
    }
    return deactivated;
  };

  const undoRow = (rowIdx: number, deactivated: number[]) => {
    const row = rows[rowIdx];
    remaining[row.classIdx]++;
    for (let i = deactivated.length - 1; i >= 0; i--) {
      const rIdx = deactivated[i];
      rowActive[rIdx] = 1;
      const otherRow = rows[rIdx];
      for (let j = 0; j < otherRow.cells.length; j++) cellValidCount[otherRow.cells[j]]++;
      if (mode === "earlyCenterGuard" && centerBitMask[otherRow.iconBit] === 1) centerCapableCount++;
    }
    for (const b of row.cells) cellCovered[b] = 0;
  };

  const recurse = (): boolean => {
    const forcedRows: number[] = [];
    const forcedDeacts: number[][] = [];
    const forcedIcons: boolean[] = [];

    const undoForcedChain = () => {
      for (let k = forcedRows.length - 1; k >= 0; k--) {
        if (forcedIcons[k]) iconsInCenter--;
        undoRow(forcedRows[k], forcedDeacts[k]);
        placements.pop();
      }
    };

    let bestCell = -1;
    let bestCount = 0;

    while (true) {
      if (timedOut) {
        undoForcedChain();
        return false;
      }
      nodes++;
      if ((nodes & 0xfff) === 0 && Date.now() - startTime > timeoutMs) {
        timedOut = true;
        undoForcedChain();
        return false;
      }

      // earlyCenterGuard: requireCenter 충족 불가 확정이면 즉시 fail
      if (mode === "earlyCenterGuard" && requireCenter && iconsInCenter === 0 && centerCapableCount === 0) {
        undoForcedChain();
        return false;
      }

      bestCell = -1;
      bestCount = Infinity;
      for (let i = 0; i < paintedCells.length; i++) {
        const c = paintedCells[i];
        if (cellCovered[c]) continue;
        const cnt = cellValidCount[c];
        if (cnt < bestCount) {
          bestCount = cnt;
          bestCell = c;
          if (cnt <= 1) break;
        }
      }

      if (bestCell === -1) {
        if (requireCenter && iconsInCenter === 0) {
          undoForcedChain();
          return false;
        }
        return true;
      }
      if (bestCount === 0) {
        undoForcedChain();
        return false;
      }
      if (bestCount > 1) break;

      const fUsers = cellRows[bestCell];
      let fRowIdx = -1;
      for (let i = 0; i < fUsers.length; i++) {
        if (rowActive[fUsers[i]]) {
          fRowIdx = fUsers[i];
          break;
        }
      }
      const fRow = rows[fRowIdx];
      placements.push({ classKey: classes[fRow.classIdx].key, orientationId: fRow.orientationId, anchor: fRow.anchor });
      const fDeac = applyRow(fRowIdx);
      const fIconCenter = centerBitMask[fRow.iconBit] === 1;
      if (fIconCenter) iconsInCenter++;
      forcedRows.push(fRowIdx);
      forcedDeacts.push(fDeac);
      forcedIcons.push(fIconCenter);
    }

    // 분기 (표준 MRV). centerFirstRoot 의 루트 처리는 recurse 바깥에서 수행.
    const users = cellRows[bestCell];
    for (let i = 0; i < users.length; i++) {
      const rowIdx = users[i];
      if (!rowActive[rowIdx]) continue;
      const row = rows[rowIdx];
      placements.push({ classKey: classes[row.classIdx].key, orientationId: row.orientationId, anchor: row.anchor });
      const undo = applyRow(rowIdx);
      const isIconInCenter = centerBitMask[row.iconBit] === 1;
      if (isIconInCenter) iconsInCenter++;
      if (recurse()) return true;
      if (isIconInCenter) iconsInCenter--;
      undoRow(rowIdx, undo);
      placements.pop();
      if (timedOut) {
        undoForcedChain();
        return false;
      }
    }

    undoForcedChain();
    return false;
  };

  // centerFirstRoot: 루트에서 MRV 대신 "iconBit ∈ center 인 active row" 를 직접 열거.
  // 각 후보를 첫 배치로 적용한 뒤 표준 MRV 재귀로 나머지를 푼다.
  let found: boolean;
  if (mode === "centerFirstRoot") {
    const centerRows: number[] = [];
    for (let i = 0; i < rows.length; i++) {
      if (rowActive[i] && centerBitMask[rows[i].iconBit] === 1) centerRows.push(i);
    }
    centerRows.sort((a, b) => rows[b].cells.length - rows[a].cells.length);
    found = false;
    for (const rowIdx of centerRows) {
      if (!rowActive[rowIdx]) continue;
      const row = rows[rowIdx];
      placements.push({ classKey: classes[row.classIdx].key, orientationId: row.orientationId, anchor: row.anchor });
      const undo = applyRow(rowIdx);
      iconsInCenter++;
      nodes++;
      if (recurse()) {
        found = true;
        break;
      }
      iconsInCenter--;
      undoRow(rowIdx, undo);
      placements.pop();
      if (timedOut) break;
    }
  } else {
    found = recurse();
  }
  const elapsedMs = Date.now() - startTime;
  if (timedOut) return { status: "timeout", nodes, elapsedMs };
  if (found) return { status: "ok", placements, nodes, elapsedMs };
  return { status: "unsolvable", nodes, elapsedMs };
};

// ── 테스트 입력 생성 ──
const makeClass = (cat: BlockJobCategory, grade: BlockGrade, count: number): SolverClass => ({
  key: `${cat}:${grade}`,
  count,
  orientations: generateOrientations(UNION_BLOCK_SHAPES[cat][grade]),
});

const rect = (w: number, h: number, cx = 0, cy = 0): string[] => {
  const keys: string[] = [];
  const x0 = cx - Math.floor(w / 2);
  const y0 = cy - Math.floor(h / 2);
  for (let dx = 0; dx < w; dx++) for (let dy = 0; dy < h; dy++) keys.push(`${x0 + dx},${y0 + dy}`);
  return keys;
};

const plus = (arm: number): string[] => {
  // 중앙 2x2 를 중심으로 십자 팔 (길이 arm)
  const set = new Set<string>();
  const core = [
    [0, 0],
    [-1, 0],
    [0, 1],
    [-1, 1],
  ];
  for (const [x, y] of core) set.add(`${x},${y}`);
  for (let i = 1; i <= arm; i++) {
    set.add(`${i},0`);
    set.add(`${i},1`);
    set.add(`${-1 - i},0`);
    set.add(`${-1 - i},1`);
    set.add(`${-1},${1 + i}`);
    set.add(`${0},${1 + i}`);
    set.add(`${-1},${-i}`);
    set.add(`${0},${-i}`);
  }
  return Array.from(set);
};

const tests: { name: string; input: SolverInput }[] = [
  {
    name: "T1_tight_16cell",
    input: {
      paintedKeys: rect(4, 4),
      classes: [makeClass("전사", "SS", 2), makeClass("마법사", "SS", 2)],
      requireCenterIcon: true,
      timeoutMs: 30_000,
    },
  },
  {
    name: "T2_30cell_mixed",
    input: {
      paintedKeys: rect(6, 5),
      classes: [
        makeClass("전사", "SS", 2),
        makeClass("마법사", "SS", 1),
        makeClass("궁수_메이플M", "S", 3),
        makeClass("도적", "A", 2),
        makeClass("해적", "B", 3),
      ],
      requireCenterIcon: true,
      timeoutMs: 30_000,
    },
  },
  {
    name: "T3_plus_44cell",
    input: {
      paintedKeys: plus(5),
      classes: [
        makeClass("전사", "SSS", 2),
        makeClass("마법사", "SSS", 2),
        makeClass("궁수_메이플M", "SS", 3),
        makeClass("도적", "SS", 2),
        makeClass("해적", "S", 3),
        makeClass("하이브리드", "A", 2),
      ],
      requireCenterIcon: true,
      timeoutMs: 30_000,
    },
  },
  {
    name: "T4_60cell_heavy",
    input: {
      paintedKeys: rect(8, 8, 0, 1),
      classes: [
        makeClass("전사", "SSS", 3),
        makeClass("마법사", "SSS", 2),
        makeClass("궁수_메이플M", "SS", 3),
        makeClass("도적", "SS", 3),
        makeClass("해적", "S", 4),
        makeClass("하이브리드", "S", 3),
        makeClass("전사", "A", 2),
        makeClass("마법사", "B", 3),
      ],
      requireCenterIcon: true,
      timeoutMs: 30_000,
    },
  },
];

// ── 러너 ──
const REPEATS = 3;

const runOne = (input: SolverInput, mode: Mode) => {
  const runs: SolverResult[] = [];
  for (let i = 0; i < REPEATS; i++) runs.push(solveVariant(input, mode));
  runs.sort((a, b) => a.elapsedMs - b.elapsedMs);
  const med = runs[Math.floor(runs.length / 2)];
  return { status: med.status, nodes: med.nodes, elapsedMs: med.elapsedMs };
};

console.log("=".repeat(70));
console.log("Union 솔버 벤치마크 (requireCenterIcon=true, median of 3 runs)");
console.log("=".repeat(70));

for (const test of tests) {
  const cellCount = test.input.paintedKeys.length;
  const classSum = test.input.classes.reduce((s, c) => s + c.count * c.orientations[0].cells.length, 0);
  console.log(`\n[${test.name}] painted=${cellCount} expectedSum=${classSum}`);

  const base = runOne(test.input, "baseline");
  const guard = runOne(test.input, "earlyCenterGuard");

  // 프로덕션 솔버(= earlyCenterGuard 적용된 src/utils/unionAutoPlace.ts) 비교
  const prodRuns: SolverResult[] = [];
  for (let i = 0; i < REPEATS; i++) prodRuns.push(solveProduction(test.input));
  prodRuns.sort((a, b) => a.elapsedMs - b.elapsedMs);
  const prod = prodRuns[Math.floor(prodRuns.length / 2)];

  const fmt = (r: { status: string; nodes: number; elapsedMs: number }) =>
    `${r.status.padEnd(11)} nodes=${String(r.nodes).padStart(8)} ms=${String(r.elapsedMs).padStart(6)}`;
  console.log(`  baseline(old)    : ${fmt(base)}`);
  console.log(`  earlyCenterGuard : ${fmt(guard)}  Δ=${(((guard.elapsedMs - base.elapsedMs) / base.elapsedMs) * 100).toFixed(1)}%`);
  console.log(`  production(new)  : ${fmt(prod)}  Δ=${(((prod.elapsedMs - base.elapsedMs) / base.elapsedMs) * 100).toFixed(1)}%`);
}
