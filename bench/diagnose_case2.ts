/**
 * T_USER_CASE2 케이스 정밀 진단.
 * - 연결성/중앙 셀/topology 분석
 * - 단발 실행으로 실제 소요시간/노드 측정
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
  solve,
  type SolverClass,
  type SolverInput,
} from "../src/utils/unionAutoPlace";

const makeClass = (cat: BlockJobCategory, grade: BlockGrade, count: number): SolverClass => ({
  key: `${cat}:${grade}`,
  count,
  orientations: generateOrientations(UNION_BLOCK_SHAPES[cat][grade]),
});

const input: SolverInput = {
  paintedKeys: ["-11,1","-10,1","-11,2","-10,2","-9,2","-8,2","-7,2","-11,3","-10,3","-9,3","-8,3","-7,3","-11,4","-10,4","-9,4","-8,4","-7,4","-11,5","-10,5","-9,5","-8,5","-7,5","-11,6","-10,6","-9,6","-8,6","-7,6","-11,7","-10,7","-9,7","-8,7","-11,8","-10,8","-9,8","-11,9","-10,9","-11,10","-11,-9","-11,-8","-10,-8","-11,-7","-10,-7","-9,-7","-11,-6","-10,-6","-9,-6","-8,-6","-11,-5","-10,-5","-9,-5","-8,-5","-7,-5","-11,-4","-10,-4","-9,-4","-8,-4","-7,-4","-11,-3","-10,-3","-9,-3","-8,-3","-7,-3","-11,-2","-10,-2","-9,-2","-8,-2","-7,-2","-11,-1","-10,-1","-9,-1","-8,-1","-7,-1","-11,0","-10,0","-9,0","-8,0","-7,0","10,-9","9,-8","10,-8","8,-7","9,-7","10,-7","7,-6","8,-6","9,-6","10,-6","6,-5","7,-5","8,-5","9,-5","10,-5","6,-4","7,-4","8,-4","9,-4","10,-4","6,-3","7,-3","8,-3","9,-3","10,-3","6,-2","7,-2","8,-2","9,-2","10,-2","6,-1","7,-1","8,-1","9,-1","10,-1","6,0","7,0","8,0","9,0","10,0","6,1","7,1","8,1","9,1","10,1","6,2","7,2","8,2","9,2","10,2","6,3","7,3","8,3","9,3","10,3","6,4","7,4","8,4","9,4","10,4","6,5","7,5","8,5","9,5","10,5","6,6","7,6","8,6","9,6","10,6","10,7","9,7","8,7","7,7","-8,1","-7,1","-9,1","-6,0","-5,0","-4,0","-3,0","-2,0","-1,0","0,0","1,0","2,0","3,0","4,0","5,0"],
  classes: [
    makeClass("마법사","SS",6),makeClass("해적","SS",5),makeClass("전사","SS",8),
    makeClass("궁수_메이플M","SS",4),makeClass("궁수_메이플M","SSS",3),
    makeClass("도적","SSS",1),makeClass("도적","SS",5),makeClass("마법사","SSS",4),
    makeClass("해적","SSS",2),makeClass("하이브리드","SS",1),
  ],
  requireCenterIcon: true,
  timeoutMs: 60_000,
};

// ─ 입력 기본 통계 ─
const paintedSet = new Set(input.paintedKeys);
const paintedCount = paintedSet.size;
const blockSum = input.classes.reduce((s, c) => s + c.count * c.orientations[0].cells.length, 0);
console.log("=== 입력 통계 ===");
console.log(`painted 셀: ${paintedCount}`);
console.log(`블록 총 셀: ${blockSum} (슬랙 = ${blockSum - paintedCount})`);

// 연결 컴포넌트 분석 (painted 그대로)
const COLS = MAX_X - MIN_X + 1;
const inPainted = (x: number, y: number) => paintedSet.has(`${x},${y}`);
const visited = new Set<string>();
const components: { size: number; sample: string }[] = [];
for (const key of input.paintedKeys) {
  if (visited.has(key)) continue;
  const [x0, y0] = key.split(",").map(Number);
  const q = [[x0, y0]];
  visited.add(key);
  let size = 0;
  while (q.length) {
    const [x, y] = q.pop()!;
    size++;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      const k = `${nx},${ny}`;
      if (inPainted(nx, ny) && !visited.has(k)) {
        visited.add(k);
        q.push([nx, ny]);
      }
    }
  }
  components.push({ size, sample: key });
}
console.log(`\n=== 초기 연결 컴포넌트 ===`);
components.forEach((c) => console.log(`  size=${c.size} (sample=${c.sample})`));

// 중앙 2×2 painted 여부
const centerCells = ["0,0", "-1,0", "0,1", "-1,1"];
const centerPaintedCount = centerCells.filter((k) => paintedSet.has(k)).length;
console.log(`\n=== 중앙 2×2 ===`);
console.log(`painted 된 center 셀 수: ${centerPaintedCount}/4`);
centerCells.forEach((k) => console.log(`  ${k}: ${paintedSet.has(k) ? "painted" : "UNpainted"}`));

// centerCapable 리스트: 각 클래스의 각 orientation 에서 iconBit 이 중앙 2×2 에 들어가면서
// 모든 cells 이 painted 인 placement 를 세어본다.
let totalCenterCapable = 0;
const centerCapablePerClass: Record<string, number> = {};
for (const cls of input.classes) {
  let cnt = 0;
  for (const ori of cls.orientations) {
    const iconOff = ori.cells[ori.iconCellIdx] ?? ori.cells[0];
    for (const cBit of [cellToBitIdx(0, 0), cellToBitIdx(-1, 0), cellToBitIdx(0, 1), cellToBitIdx(-1, 1)]) {
      // anchor = iconBit - iconOff
      const iy = Math.floor(cBit / COLS) + MIN_Y;
      const ix = (cBit % COLS) + MIN_X;
      const ax = ix - iconOff.dx;
      const ay = iy - iconOff.dy;
      let valid = true;
      for (const c of ori.cells) {
        const x = ax + c.dx, y = ay + c.dy;
        if (!paintedSet.has(`${x},${y}`)) { valid = false; break; }
      }
      if (valid) cnt++;
    }
  }
  centerCapablePerClass[cls.key] = cnt;
  totalCenterCapable += cnt;
}
console.log(`\n=== center-capable placement (iconBit ∈ center & cells all painted) ===`);
console.log(`총합: ${totalCenterCapable}`);
Object.entries(centerCapablePerClass).forEach(([k, v]) => {
  if (v > 0) console.log(`  ${k}: ${v}`);
});

// ─ 실제 솔버 실행 ─
console.log(`\n=== 솔버 실행 (original, timeout 60s) ===`);
const t0 = Date.now();
const result = solve({ ...input, timeoutMs: 60_000 });
const dt = Date.now() - t0;
console.log(`status=${result.status} nodes=${result.nodes} wallclock=${dt}ms`);

// ─ Same-shape 병합 실험 ─
// 도적 SS 와 하이브리드 SS 는 같은 L-shape. 두 클래스를 하나로 병합해서 탐색.
console.log(`\n=== 솔버 실행 (도적+하이브리드 SS 병합, timeout 60s) ===`);
const mergedClasses: SolverClass[] = input.classes
  .filter((c) => c.key !== "하이브리드:SS")
  .map((c) => (c.key === "도적:SS" ? { ...c, count: c.count + 1 } : c));
const t1 = Date.now();
const result2 = solve({ ...input, classes: mergedClasses, timeoutMs: 60_000 });
const dt2 = Date.now() - t1;
console.log(`status=${result2.status} nodes=${result2.nodes} wallclock=${dt2}ms`);
