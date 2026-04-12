/**
 * 유니온 자동 배치 Web Worker.
 * 메인 스레드에서 postMessage 로 전달한 입력을 솔버에 넘기고 결과를 돌려준다.
 */

import { solve, type Orientation, type SolverResult } from "./unionAutoPlace";

type WorkerInput = {
  paintedKeys: string[];
  classes: Array<{
    key: string;
    count: number;
    orientations: Orientation[];
  }>;
  timeoutMs?: number;
  requireCenterIcon?: boolean;
};

type WorkerOutput = SolverResult;

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { paintedKeys, classes, timeoutMs, requireCenterIcon } = e.data;
  try {
    const result = solve({ paintedKeys, classes, timeoutMs, requireCenterIcon });
    (self as unknown as Worker).postMessage(result satisfies WorkerOutput);
  } catch (err) {
    (self as unknown as Worker).postMessage({
      status: "unsolvable",
      nodes: 0,
      elapsedMs: 0,
      error: err instanceof Error ? err.message : String(err),
    } as WorkerOutput);
  }
};
