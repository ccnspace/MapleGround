/**
 * matchesAutoResetTarget 단위 테스트 스크립트.
 *
 * 별도 테스트 러너 없이 즉시 실행 가능하도록 자체 어설션 + 카운트 출력만으로 구성.
 * 실행:
 *   npx tsx bench/cube_matcher_test.ts
 *
 * 실패가 있으면 비-제로 종료 코드로 빠져나간다.
 */

import { matchesAutoResetTarget } from "../src/utils/cubeOptionMatcher";

type Case = {
  name: string;
  user: string[];
  rolled: string[];
  expected: boolean;
};

const CASES: Case[] = [
  // ── 기존 동작이 보존되는 케이스 (정확 일치 / 순서 무관) ──
  {
    name: "동일 옵션 동일 수치, 순서 같음 → 매칭",
    user: ["STR +13%", "STR +10%", "STR +10%"],
    rolled: ["STR +13%", "STR +10%", "STR +10%"],
    expected: true,
  },
  {
    name: "동일 옵션 동일 수치, 순서 다름 → 매칭 (순서 무관)",
    user: ["STR +13%", "STR +10%", "STR +10%"],
    rolled: ["STR +10%", "STR +13%", "STR +10%"],
    expected: true,
  },
  {
    name: "다른 베이스 같은 수치는 매칭 안 됨",
    user: ["STR +10%"],
    rolled: ["DEX +10%"],
    expected: false,
  },

  // ── 핵심 개선: 같은 종류, 더 좋은 수치 ──
  {
    name: "STR 13/10/10 요청에 STR 13/13/10 결과 → 매칭 (개선된 동작)",
    user: ["STR +13%", "STR +10%", "STR +10%"],
    rolled: ["STR +13%", "STR +13%", "STR +10%"],
    expected: true,
  },
  {
    name: "모든 슬롯이 더 좋은 수치 → 매칭",
    user: ["STR +13%", "STR +10%", "STR +10%"],
    rolled: ["STR +13%", "STR +12%", "STR +11%"],
    expected: true,
  },
  {
    name: "사용자 단일 STR +10% 요청, 결과 [STR +13%, DEX +10%, INT +10%] → 매칭 (1개만 충족하면 OK)",
    user: ["STR +10%"],
    rolled: ["STR +13%", "DEX +10%", "INT +10%"],
    expected: true,
  },
  {
    name: "혼합 베이스, 각 옵션이 같은 종류로 더 좋거나 같은 수치 → 매칭",
    user: ["STR +13%", "DEX +10%", "INT +10%"],
    rolled: ["STR +13%", "DEX +13%", "INT +10%"],
    expected: true,
  },

  // ── 매칭 실패 케이스 ──
  {
    name: "수치가 하나라도 부족하면 실패",
    user: ["STR +13%", "STR +10%", "STR +10%"],
    rolled: ["STR +13%", "STR +9%", "STR +10%"],
    expected: false,
  },
  {
    name: "사용자 STR 13 요청, 결과에 ≥13 STR 없음 → 실패",
    user: ["STR +13%", "STR +10%", "STR +10%"],
    rolled: ["STR +12%", "STR +12%", "STR +12%"],
    expected: false,
  },
  {
    name: "사용자 옵션 개수 > 결과 슬롯 수 → 실패",
    user: ["STR +10%", "DEX +10%", "INT +10%", "LUK +10%"],
    rolled: ["STR +10%", "DEX +10%", "INT +10%"],
    expected: false,
  },
  {
    name: "필요한 종류가 결과에 부족 → 실패 (STR 2개 요청, 결과는 1개)",
    user: ["STR +10%", "STR +10%", "DEX +10%"],
    rolled: ["STR +13%", "DEX +13%", "INT +13%"],
    expected: false,
  },

  // ── 단위 구분 (% vs flat) ──
  {
    name: "% 와 flat 은 다른 옵션으로 취급, 매칭 안 됨",
    user: ["STR +5%"],
    rolled: ["STR +12"],
    expected: false,
  },
  {
    name: "flat 옵션도 같은 단위 내에서 더 좋은 수치 매칭",
    user: ["STR +6", "STR +6"],
    rolled: ["STR +12", "STR +6"],
    expected: true,
  },

  // ── 비수치 옵션 (정확 일치만) ──
  {
    name: "비수치 옵션은 동일 문자열 매칭",
    user: ["공격 시 20% 확률로 240의 HP 회복"],
    rolled: ["공격 시 20% 확률로 240의 HP 회복", "STR +12", "DEX +12"],
    expected: true,
  },
  {
    name: "비수치 옵션은 다른 문자열이면 매칭 안 됨",
    user: ["공격 시 20% 확률로 240의 HP 회복"],
    rolled: ["공격 시 20% 확률로 120의 MP 회복", "STR +12", "DEX +12"],
    expected: false,
  },
  {
    name: "수치 옵션이 비수치 옵션을 매칭할 수는 없음",
    user: ["STR +10%"],
    rolled: ["공격 시 20% 확률로 240의 HP 회복"],
    expected: false,
  },

  // ── 다양한 베이스 형태 ──
  {
    name: "공백이 들어간 베이스 ('최대 HP') 매칭",
    user: ["최대 HP +60", "최대 HP +60"],
    rolled: ["최대 HP +120", "최대 HP +60", "DEX +12"],
    expected: true,
  },
  {
    name: "긴 베이스명 ('몬스터 방어율 무시') 매칭",
    user: ["몬스터 방어율 무시 +15%"],
    rolled: ["몬스터 방어율 무시 +15%", "STR +12", "DEX +12"],
    expected: true,
  },

  // ── 엣지 케이스 ──
  {
    name: "사용자 옵션이 비어 있으면 매칭 실패 (자동재설정 의미 없음)",
    user: [],
    rolled: ["STR +12", "DEX +12", "INT +12"],
    expected: false,
  },
  {
    name: "1:1 매칭이 백트래킹으로만 풀리는 케이스",
    user: ["STR +13%", "STR +10%"],
    rolled: ["STR +10%", "STR +13%"],
    // greedy 가 user STR 13 → rolled STR 13 을 먼저 잡지 못해도, backtracking 으로 회복 가능해야 함
    expected: true,
  },
  {
    name: "백트래킹 필요 — 첫 후보가 더 큰 결과를 소비하면 실패하는 케이스",
    user: ["STR +13%", "STR +10%"],
    rolled: ["STR +13%", "STR +13%"],
    // 둘 다 ≥ 사용자 수치이므로 매칭 가능
    expected: true,
  },
];

let passed = 0;
let failed = 0;
const failures: { name: string; user: string[]; rolled: string[]; expected: boolean; actual: boolean }[] = [];

for (const c of CASES) {
  const actual = matchesAutoResetTarget(c.user, c.rolled);
  if (actual === c.expected) {
    passed++;
    console.log(`  PASS  ${c.name}`);
  } else {
    failed++;
    failures.push({ ...c, actual });
    console.log(`  FAIL  ${c.name}`);
  }
}

console.log("");
console.log(`Total: ${CASES.length}  Passed: ${passed}  Failed: ${failed}`);

if (failed > 0) {
  console.log("");
  console.log("실패 상세:");
  for (const f of failures) {
    console.log(`  - ${f.name}`);
    console.log(`      user:     ${JSON.stringify(f.user)}`);
    console.log(`      rolled:   ${JSON.stringify(f.rolled)}`);
    console.log(`      expected: ${f.expected}  actual: ${f.actual}`);
  }
  process.exit(1);
}
