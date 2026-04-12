/**
 * 등급/직업별 유니온 블록 모양 정의
 *
 * - 칸 수: B=1, A=2, S=3, SS=4, SSS=5
 * - 모양은 문자열 매트릭스로 표현: "X"=차지, "."=빈칸
 * - 배열 첫 번째 요소가 윗행, 마지막 요소가 아랫행 (top-to-bottom)
 * - 각 문자열의 좌측이 좌측, 우측이 우측 (left-to-right)
 */

export type BlockGrade = "B" | "A" | "S" | "SS" | "SSS";

/** 직업 카테고리 (궁수와 메이플스토리 M은 동일 모양, 하이브리드는 SS까지 도적과 동일하고 SSS 만 다름) */
export type BlockJobCategory = "전사" | "마법사" | "궁수_메이플M" | "도적" | "해적" | "하이브리드";

export const BLOCK_GRADES: BlockGrade[] = ["B", "A", "S", "SS", "SSS"];

/** 등급별 차지 칸 수 */
export const BLOCK_GRADE_CELL_COUNT: Record<BlockGrade, number> = {
  B: 1,
  A: 2,
  S: 3,
  SS: 4,
  SSS: 5,
};

/**
 * 직업 카테고리별 × 등급별 블록 모양 매트릭스
 *
 * 예) 전사 S =
 *   X .
 *   X X
 * → 좌상단 1칸 + 좌하단 1칸 + 우하단 1칸 (L자)
 */
export const UNION_BLOCK_SHAPES: Record<BlockJobCategory, Record<BlockGrade, string[]>> = {
  // 전사: 뭉쳐있는 정사각/계단형
  전사: {
    B: ["X"],
    A: ["XX"],
    S: ["X.", "XX"],
    SS: ["XX", "XX"],
    SSS: ["XX.", "XXX"],
  },

  // 마법사: 가로 직선 → T자 → 십자(+)
  마법사: {
    B: ["X"],
    A: ["XX"],
    S: ["XXX"],
    SS: ["XXX", ".X."],
    SSS: [".X.", "XXX", ".X."],
  },

  // 궁수 / 메이플스토리 M: 일자(가로 직선) 고정
  궁수_메이플M: {
    B: ["X"],
    A: ["XX"],
    S: ["XXX"],
    SS: ["XXXX"],
    SSS: ["XXXXX"],
  },

  // 도적: 가로 직선 → L자(우측 하단 돌출)
  도적: {
    B: ["X"],
    A: ["XX"],
    S: ["XXX"],
    SS: ["XXX", "..X"],
    SSS: ["..X", "XXX", "..X"],
  },

  // 해적: 세로 L / Z 형태
  해적: {
    B: ["X"],
    A: ["XX"],
    S: ["X.", "X.", "XX"],
    SS: ["X.", "XX", ".X"],
    SSS: [".X", ".X", "XX", "X."],
  },

  // 하이브리드(제논 등): B~SS 는 도적과 동일 모양 / SSS 만 별도 Z-like 5칸 모양
  하이브리드: {
    B: ["X"],
    A: ["XX"],
    S: ["XXX"],
    SS: ["XXX", "..X"],
    SSS: ["X..", "XXX", "..X"],
  },
};

/** 좌표 오프셋 표현 (좌상단을 원점으로, dx=오른쪽+, dy=아래+) */
export type BlockOffset = { dx: number; dy: number };

/** 모양 매트릭스를 (dx, dy) 오프셋 배열로 변환 */
export const shapeToOffsets = (shape: string[]): BlockOffset[] => {
  const offsets: BlockOffset[] = [];
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] === "X") offsets.push({ dx: col, dy: row });
    }
  }
  return offsets;
};

/**
 * 미리 계산된 오프셋 맵
 * 유니온 그리드의 y축은 위로 갈수록 +인 점에 유의 — 그리드에 배치할 때는 dy의 부호를 반전해야 한다.
 */
export const UNION_BLOCK_OFFSETS: Record<BlockJobCategory, Record<BlockGrade, BlockOffset[]>> = Object.fromEntries(
  (Object.keys(UNION_BLOCK_SHAPES) as BlockJobCategory[]).map((job) => [
    job,
    Object.fromEntries(BLOCK_GRADES.map((grade) => [grade, shapeToOffsets(UNION_BLOCK_SHAPES[job][grade])])) as Record<
      BlockGrade,
      BlockOffset[]
    >,
  ])
) as Record<BlockJobCategory, Record<BlockGrade, BlockOffset[]>>;

/** 좌우 대칭 (각 행을 뒤집음) */
export const flipShapeHorizontal = (shape: string[]): string[] => shape.map((row) => row.split("").reverse().join(""));

/** 상하 대칭 (행 순서를 뒤집음) */
export const flipShapeVertical = (shape: string[]): string[] => [...shape].reverse();

/** 시계방향 90도 회전: new[r][c] = old[rows-1-c][r] */
export const rotateShapeClockwise = (shape: string[]): string[] => {
  const rows = shape.length;
  const cols = Math.max(...shape.map((r) => r.length));
  const padded = shape.map((r) => r.padEnd(cols, "."));
  const result: string[] = [];
  for (let r = 0; r < cols; r++) {
    let line = "";
    for (let c = 0; c < rows; c++) line += padded[rows - 1 - c][r];
    result.push(line);
  }
  return result;
};

/** 반시계방향 90도 회전: new[r][c] = old[c][cols-1-r] */
export const rotateShapeCounterClockwise = (shape: string[]): string[] => {
  const rows = shape.length;
  const cols = Math.max(...shape.map((r) => r.length));
  const padded = shape.map((r) => r.padEnd(cols, "."));
  const result: string[] = [];
  for (let r = 0; r < cols; r++) {
    let line = "";
    for (let c = 0; c < rows; c++) line += padded[c][cols - 1 - r];
    result.push(line);
  }
  return result;
};

/**
 * 블록 셀 좌표 배열에 2D 매트릭스 변환을 적용.
 * - 유니온 그리드는 y가 위로 갈수록 +이므로 matrix의 top row = 가장 큰 y
 * - 변환 후 바운딩박스 중심이 원래와 같도록 재배치
 */
export const transformBlockPositions = (
  positions: { x: number; y: number }[],
  transform: (shape: string[]) => string[]
): { x: number; y: number }[] => {
  if (positions.length === 0) return positions;
  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;

  const matrix: string[][] = Array.from({ length: rows }, () => Array(cols).fill("."));
  positions.forEach((p) => {
    matrix[maxY - p.y][p.x - minX] = "X";
  });
  const shape = matrix.map((r) => r.join(""));
  const newShape = transform(shape);
  const newRows = newShape.length;
  const newCols = Math.max(...newShape.map((r) => r.length));

  // 바운딩박스 중심 유지 (짝수 크기는 반올림)
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const newMinX = Math.round(centerX - (newCols - 1) / 2);
  const newMaxY = Math.round(centerY + (newRows - 1) / 2);

  const result: { x: number; y: number }[] = [];
  for (let r = 0; r < newShape.length; r++) {
    for (let c = 0; c < newShape[r].length; c++) {
      if (newShape[r][c] === "X") result.push({ x: newMinX + c, y: newMaxY - r });
    }
  }
  return result;
};

/**
 * 피벗(정수 좌표) 기준의 직접 좌표 변환.
 * 바운딩박스 중심 기반 변환은 차원 교환 시 반올림 오차가 누적되어
 * 4회 회전 후 원위치로 돌아오지 않지만, 고정 피벗(예: block_control_point)을
 * 사용하면 회전 2회 = 180°, 4회 = 항등이 수학적으로 보장된다.
 *
 * 좌표계: y가 위로 갈수록 증가 (유니온 그리드와 동일)
 */
export const rotateBlockClockwise = (positions: { x: number; y: number }[], pivot: { x: number; y: number }): { x: number; y: number }[] =>
  positions.map((p) => ({ x: pivot.x + (p.y - pivot.y), y: pivot.y - (p.x - pivot.x) }));

export const rotateBlockCounterClockwise = (
  positions: { x: number; y: number }[],
  pivot: { x: number; y: number }
): { x: number; y: number }[] => positions.map((p) => ({ x: pivot.x - (p.y - pivot.y), y: pivot.y + (p.x - pivot.x) }));

export const flipBlockHorizontal = (positions: { x: number; y: number }[], pivot: { x: number; y: number }): { x: number; y: number }[] =>
  positions.map((p) => ({ x: 2 * pivot.x - p.x, y: p.y }));

export const flipBlockVertical = (positions: { x: number; y: number }[], pivot: { x: number; y: number }): { x: number; y: number }[] =>
  positions.map((p) => ({ x: p.x, y: 2 * pivot.y - p.y }));

/** 캐릭터 레벨로 블록 등급 판정 (B: 60~99 / A: 100~139 / S: 140~199 / SS: 200~249 / SSS: 250+) */
export const levelToBlockGrade = (level: number): BlockGrade | null => {
  if (level < 60) return null;
  if (level < 100) return "B";
  if (level < 140) return "A";
  if (level < 200) return "S";
  if (level < 250) return "SS";
  return "SSS";
};

/** API의 block_type(직업군 문자열)을 모양 카테고리로 매핑 */
export const BLOCK_TYPE_TO_CATEGORY: Record<string, BlockJobCategory> = {
  전사: "전사",
  마법사: "마법사",
  궁수: "궁수_메이플M",
  "메이플 M 캐릭터": "궁수_메이플M",
  도적: "도적",
  해적: "해적",
  // 하이브리드(제논 등): SS 까지는 도적과 동일하나 SSS 는 별도 모양 → 독립 카테고리
  하이브리드: "하이브리드",
};
