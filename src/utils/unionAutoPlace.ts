/**
 * 유니온 자동 배치 솔버.
 *
 * 폴리오미노 exact-cover 문제. Algorithm X (MRV 휴리스틱) 기반.
 *  - 매 단계에서 "남은 자유 셀 중 그 셀을 덮을 수 있는 배치 후보가 가장 적은 셀"을 선택
 *  - 해당 셀을 덮는 후보들만 분기 → 탐색 트리가 기하급수적으로 작아진다
 *  - cellValidCount 를 incremental 로 갱신해 MRV 스캔 자체도 O(painted)
 *
 * 내부 비트보드는 Uint32Array 14워드(= 448비트, 440셀 사용) 를 쓴다.
 */

// ── 그리드 크기 ──
export const MIN_X = -11;
export const MAX_X = 10;
export const MIN_Y = -9;
export const MAX_Y = 10;
export const COLS = MAX_X - MIN_X + 1; // 22
export const ROWS = MAX_Y - MIN_Y + 1; // 20
export const TOTAL_CELLS = COLS * ROWS; // 440
const WORDS = (TOTAL_CELLS + 31) >>> 5; // 14

export const cellToBitIdx = (x: number, y: number): number => (y - MIN_Y) * COLS + (x - MIN_X);
export const bitIdxToCell = (idx: number): { x: number; y: number } => ({
  x: (idx % COLS) + MIN_X,
  y: Math.floor(idx / COLS) + MIN_Y,
});

// ── 비트보드 헬퍼 ──
type BitBoard = Uint32Array;
const boardNew = (): BitBoard => new Uint32Array(WORDS);
const boardSetBit = (b: BitBoard, idx: number) => {
  b[idx >>> 5] |= 1 << (idx & 31);
};
const boardHasBit = (b: BitBoard, idx: number): boolean => (b[idx >>> 5] & (1 << (idx & 31))) !== 0;

// ── 타입 정의 ──
export type Orientation = {
  id: number;
  cells: Array<{ dx: number; dy: number }>;
  /** cells 배열에서 "아이콘이 위치한 셀" 의 인덱스. shape 문자열의 "$" 셀을 추적. */
  iconCellIdx: number;
};

export type SolverClass = {
  key: string;
  count: number;
  orientations: Orientation[];
};

export type SolverInput = {
  paintedKeys: string[];
  classes: SolverClass[];
  timeoutMs?: number;
  /** true 면 "어떤 배치에서든 적어도 하나의 블록 아이콘이 중앙 2×2 에 있어야 한다" 는 제약을 적용 */
  requireCenterIcon?: boolean;
};

export type Placement = {
  classKey: string;
  orientationId: number;
  anchor: { x: number; y: number };
};

export type SolverResult =
  | { status: "ok"; placements: Placement[]; nodes: number; elapsedMs: number }
  | { status: "unsolvable"; nodes: number; elapsedMs: number }
  | { status: "timeout"; nodes: number; elapsedMs: number };

// ── Orientation 생성 & 캐노니컬화 ──
type Cell = { dx: number; dy: number };

const normalizeCells = (cells: Cell[]): Cell[] => {
  const minDx = Math.min(...cells.map((c) => c.dx));
  const minDy = Math.min(...cells.map((c) => c.dy));
  return cells
    .map((c) => ({ dx: c.dx - minDx, dy: c.dy - minDy }))
    .sort((a, b) => (a.dy !== b.dy ? a.dy - b.dy : a.dx - b.dx));
};
const canonicalKey = (cells: Cell[]): string => cells.map((c) => `${c.dx},${c.dy}`).join("|");
const rotateCW = (cells: Cell[]): Cell[] => cells.map((c) => ({ dx: c.dy, dy: -c.dx }));
const flipH = (cells: Cell[]): Cell[] => cells.map((c) => ({ dx: -c.dx, dy: c.dy }));

// 단일 Cell 에 같은 변환을 적용하는 헬퍼 (아이콘 셀 추적용)
const rotateCWCell = (c: Cell): Cell => ({ dx: c.dy, dy: -c.dx });
const flipHCell = (c: Cell): Cell => ({ dx: -c.dx, dy: c.dy });

export const generateOrientations = (shape: string[]): Orientation[] => {
  // matrix row 0 = top = 가장 큰 y → grid y = -row
  // "X" 와 "$" 모두 색칠된 칸으로 인정하고, "$" 는 아이콘 위치로 추가 기록.
  const base: Cell[] = [];
  let baseIcon: Cell | null = null;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      const ch = shape[r][c];
      if (ch === "X" || ch === "$") {
        const cell = { dx: c, dy: -r };
        base.push(cell);
        if (ch === "$") baseIcon = cell;
      }
    }
  }

  const variants: Array<{ cells: Cell[]; icon: Cell | null }> = [];
  let currCells = base;
  let currIcon = baseIcon;
  for (let rot = 0; rot < 4; rot++) {
    variants.push({ cells: currCells, icon: currIcon });
    variants.push({ cells: currCells.map(flipHCell), icon: currIcon ? flipHCell(currIcon) : null });
    currCells = currCells.map(rotateCWCell);
    currIcon = currIcon ? rotateCWCell(currIcon) : null;
  }

  const seen = new Set<string>();
  const result: Orientation[] = [];
  for (const v of variants) {
    // 이동 정규화
    const minDx = Math.min(...v.cells.map((c) => c.dx));
    const minDy = Math.min(...v.cells.map((c) => c.dy));
    const shifted = v.cells.map((c) => ({ dx: c.dx - minDx, dy: c.dy - minDy }));
    const shiftedIcon = v.icon ? { dx: v.icon.dx - minDx, dy: v.icon.dy - minDy } : null;
    const sorted = [...shifted].sort((a, b) => (a.dy !== b.dy ? a.dy - b.dy : a.dx - b.dx));
    const key = canonicalKey(sorted);
    if (seen.has(key)) continue;
    seen.add(key);
    // pivot = grid scan-order 첫 셀 = (y desc, x asc) = (dy desc, dx asc)
    let pivot = sorted[0];
    for (const c of sorted) {
      if (c.dy > pivot.dy || (c.dy === pivot.dy && c.dx < pivot.dx)) pivot = c;
    }
    const cells = sorted.map((c) => ({ dx: c.dx - pivot.dx, dy: c.dy - pivot.dy }));
    // iconCellIdx: shiftedIcon 을 pivot 기준 좌표로 바꿔 cells 에서 같은 위치 찾기
    let iconCellIdx = 0;
    if (shiftedIcon) {
      const iconRel = { dx: shiftedIcon.dx - pivot.dx, dy: shiftedIcon.dy - pivot.dy };
      const found = cells.findIndex((c) => c.dx === iconRel.dx && c.dy === iconRel.dy);
      if (found >= 0) iconCellIdx = found;
    }
    result.push({ id: result.length, cells, iconCellIdx });
  }
  return result;
};

// ── 솔버 입력 유틸 ──
const paintedKeysToBoard = (keys: string[]): BitBoard => {
  const b = boardNew();
  for (const k of keys) {
    const [xs, ys] = k.split(",");
    boardSetBit(b, cellToBitIdx(parseInt(xs, 10), parseInt(ys, 10)));
  }
  return b;
};

// ── 솔버 본체 (Algorithm X + MRV) ──
type Row = {
  classIdx: number;
  orientationId: number;
  anchor: { x: number; y: number };
  cells: number[]; // bit indices
  iconBit: number; // 이 배치의 아이콘 셀 비트 인덱스 (cells 중 하나)
};

// 중앙 2×2 비트 인덱스 집합
const CENTER_BITS: ReadonlySet<number> = new Set<number>([
  cellToBitIdx(0, 0),
  cellToBitIdx(-1, 0),
  cellToBitIdx(0, 1),
  cellToBitIdx(-1, 1),
]);

export const solve = (input: SolverInput): SolverResult => {
  const timeoutMs = input.timeoutMs ?? 60_000;
  const { classes } = input;
  const painted = paintedKeysToBoard(input.paintedKeys);

  // painted 셀 목록 (bitIdx)
  const paintedCells: number[] = [];
  for (let i = 0; i < TOTAL_CELLS; i++) if (boardHasBit(painted, i)) paintedCells.push(i);

  // 모든 valid 배치(row) 나열: 각 painted 셀을 pivot 으로 하는 각 (class, orientation)
  const rows: Row[] = [];
  const cellRows: number[][] = new Array(TOTAL_CELLS);
  const classRows: number[][] = new Array(classes.length);
  for (let i = 0; i < TOTAL_CELLS; i++) cellRows[i] = [];
  for (let i = 0; i < classes.length; i++) classRows[i] = [];

  for (const anchorBit of paintedCells) {
    const anchor = bitIdxToCell(anchorBit);
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
          // 아이콘 셀(shape 의 "$") 의 비트 인덱스 계산
          const iconOff = ori.cells[ori.iconCellIdx] ?? ori.cells[0];
          const iconBit = cellToBitIdx(anchor.x + iconOff.dx, anchor.y + iconOff.dy);
          rows.push({ classIdx, orientationId: ori.id, anchor, cells, iconBit });
          for (const b of cells) cellRows[b].push(rowIdx);
          classRows[classIdx].push(rowIdx);
        }
      }
    }
  }

  // 런타임 상태
  const rowActive = new Uint8Array(rows.length);
  rowActive.fill(1);
  const remaining = classes.map((c) => c.count);
  const cellCovered = new Uint8Array(TOTAL_CELLS); // 1 = 이미 덮인 셀
  const cellValidCount = new Int32Array(TOTAL_CELLS); // 해당 셀을 덮을 수 있는 active row 수

  for (const r of rows) {
    for (const b of r.cells) cellValidCount[b]++;
  }

  // 클래스 remaining 이 0 인 경우 해당 클래스 row 모두 비활성 (count=0 사전 대응)
  for (let c = 0; c < classes.length; c++) {
    if (remaining[c] <= 0) {
      for (const rIdx of classRows[c]) {
        if (rowActive[rIdx]) {
          rowActive[rIdx] = 0;
          for (const b of rows[rIdx].cells) cellValidCount[b]--;
        }
      }
    }
  }

  const placements: Placement[] = [];
  const startTime = Date.now();
  let nodes = 0;
  let timedOut = false;

  /**
   * 배치(Row) 적용. 덮인 셀과 연관된 row 들을 비활성화.
   * 반환: undo 정보(비활성화된 row 인덱스 배열). class remaining 은 +1/-1 대칭이라 따로 저장 불필요.
   */
  const applyRow = (rowIdx: number): number[] => {
    const row = rows[rowIdx];
    const deactivated: number[] = [];

    // 1) piece 셀들을 덮인 것으로 표기
    for (const b of row.cells) cellCovered[b] = 1;

    // 2) 덮인 셀을 사용하는 모든 active row 비활성 (자기 자신 포함)
    for (const b of row.cells) {
      const users = cellRows[b];
      for (let i = 0; i < users.length; i++) {
        const rIdx = users[i];
        if (!rowActive[rIdx]) continue;
        rowActive[rIdx] = 0;
        deactivated.push(rIdx);
        // 이 row 가 덮던 (다른) 셀들의 validCount 감소
        const otherRow = rows[rIdx];
        for (let j = 0; j < otherRow.cells.length; j++) {
          cellValidCount[otherRow.cells[j]]--;
        }
      }
    }

    // 3) 클래스 remaining 감소. 0 이 되면 해당 클래스의 남은 active row 모두 비활성
    remaining[row.classIdx]--;
    if (remaining[row.classIdx] === 0) {
      const list = classRows[row.classIdx];
      for (let i = 0; i < list.length; i++) {
        const rIdx = list[i];
        if (!rowActive[rIdx]) continue;
        rowActive[rIdx] = 0;
        deactivated.push(rIdx);
        const otherRow = rows[rIdx];
        for (let j = 0; j < otherRow.cells.length; j++) {
          cellValidCount[otherRow.cells[j]]--;
        }
      }
    }
    return deactivated;
  };

  const undoRow = (rowIdx: number, deactivated: number[]) => {
    const row = rows[rowIdx];
    remaining[row.classIdx]++;
    // reactivate in reverse order
    for (let i = deactivated.length - 1; i >= 0; i--) {
      const rIdx = deactivated[i];
      rowActive[rIdx] = 1;
      const otherRow = rows[rIdx];
      for (let j = 0; j < otherRow.cells.length; j++) {
        cellValidCount[otherRow.cells[j]]++;
      }
    }
    for (const b of row.cells) cellCovered[b] = 0;
  };

  const requireCenter = input.requireCenterIcon ?? false;
  let iconsInCenter = 0;

  const recurse = (): boolean => {
    if (timedOut) return false;
    nodes++;
    if ((nodes & 0xfff) === 0 && Date.now() - startTime > timeoutMs) {
      timedOut = true;
      return false;
    }

    // MRV: 덮이지 않은 painted 셀 중 cellValidCount 가 가장 작은 셀 선택
    let bestCell = -1;
    let bestCount = Infinity;
    for (let i = 0; i < paintedCells.length; i++) {
      const c = paintedCells[i];
      if (cellCovered[c]) continue;
      const cnt = cellValidCount[c];
      if (cnt < bestCount) {
        bestCount = cnt;
        bestCell = c;
        if (cnt <= 1) break; // 0 이면 fail, 1 이면 forced — 더 볼 필요 없음
      }
    }
    if (bestCell === -1) {
      // 모두 덮임 → 성공. 단, requireCenter 라면 중앙 2×2 에 아이콘이 있어야 함.
      if (requireCenter && iconsInCenter === 0) return false;
      return true;
    }
    if (bestCount === 0) return false; // 덮을 방법 없음 → fail

    // 후보 row 들 시도. 큰 피스 먼저(제약 강함 → 실패 빠름).
    const users = cellRows[bestCell];
    // 미리 필터링 + 정렬 (그 노드에서만 유효)
    const candidates: number[] = [];
    for (let i = 0; i < users.length; i++) {
      if (rowActive[users[i]]) candidates.push(users[i]);
    }
    candidates.sort((a, b) => rows[b].cells.length - rows[a].cells.length);

    for (let i = 0; i < candidates.length; i++) {
      const rowIdx = candidates[i];
      if (!rowActive[rowIdx]) continue; // 내부 분기로 비활성 됐을 수 있음 (같은 루프 내 다른 iter 에선 불가지만 안전)
      const row = rows[rowIdx];
      placements.push({ classKey: classes[row.classIdx].key, orientationId: row.orientationId, anchor: row.anchor });
      const undo = applyRow(rowIdx);
      const isIconInCenter = CENTER_BITS.has(row.iconBit);
      if (isIconInCenter) iconsInCenter++;
      if (recurse()) return true;
      if (isIconInCenter) iconsInCenter--;
      undoRow(rowIdx, undo);
      placements.pop();
      if (timedOut) return false;
    }
    return false;
  };

  const found = recurse();
  const elapsedMs = Date.now() - startTime;

  if (timedOut) return { status: "timeout", nodes, elapsedMs };
  if (found) return { status: "ok", placements, nodes, elapsedMs };
  return { status: "unsolvable", nodes, elapsedMs };
};
