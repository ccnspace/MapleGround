// 자동 재설정 모드의 매칭 판정 유틸.
//
// 사용자가 선택한 잠재 옵션이 결과 옵션에 "충족"되었는지 검사한다.
// 충족 = 사용자 옵션 각각을 서로 다른 결과 옵션 슬롯에 1:1 매칭할 수 있고,
//   - 수치형(예: "STR +13%") 은 같은 베이스 + 같은 단위(%여부) 에 결과 수치가 사용자 수치 이상
//   - 비수치형(예: "공격 시 20% 확률로 240의 HP 회복") 은 문자열 정확 일치
//
// 예: 사용자 [STR +13%, STR +10%, STR +10%] vs 결과 [STR +13%, STR +13%, STR +10%]
//   → STR 13 → 결과 STR 13(첫째), STR 10 → 결과 STR 13(둘째), STR 10 → 결과 STR 10
//   → 1:1 매칭 가능 → 매칭으로 판정 (기존 multiset containment 로는 실패였던 케이스).

type ParsedOption = {
  raw: string;
  base: string; // "STR", "최대 HP", "공격력" 등
  value: number | null; // null = 비수치 옵션
  isPercent: boolean;
};

// 옵션 문자열의 마지막 "+숫자(%)" 토큰만 수치로 본다. 끝에 매칭되지 않으면 비수치 옵션으로 간주.
const NUMERIC_TAIL = /^(.+?)\s*\+(\d+(?:\.\d+)?)(%?)$/;

const parseOption = (raw: string): ParsedOption => {
  const trimmed = raw.trim();
  const m = trimmed.match(NUMERIC_TAIL);
  if (!m) return { raw: trimmed, base: trimmed, value: null, isPercent: false };
  return { raw: trimmed, base: m[1].trim(), value: Number(m[2]), isPercent: m[3] === "%" };
};

const isAtLeastAsGood = (user: ParsedOption, rolled: ParsedOption): boolean => {
  // 비수치 옵션은 정확히 같은 문자열만 매칭.
  if (user.value === null || rolled.value === null) return user.raw === rolled.raw;
  // 베이스 옵션 종류와 단위(%여부) 가 같아야 비교 가능.
  if (user.base !== rolled.base) return false;
  if (user.isPercent !== rolled.isPercent) return false;
  return rolled.value >= user.value;
};

/**
 * 자동 재설정 매칭 판정. 사용자가 선택한 옵션 문자열들이 결과 옵션 문자열들에 "충족"되면 true.
 * 같은 종류 옵션의 더 높은 수치도 매칭으로 인정한다.
 */
export const matchesAutoResetTarget = (userOptions: string[], rolledOptions: string[]): boolean => {
  if (userOptions.length === 0) return false;
  if (userOptions.length > rolledOptions.length) return false;

  const users = userOptions.map(parseOption);
  const rolled = rolledOptions.map(parseOption);
  const used = new Array(rolled.length).fill(false);

  // 옵션 수가 최대 3개 이므로 단순 백트래킹으로 충분.
  const tryMatch = (i: number): boolean => {
    if (i === users.length) return true;
    for (let j = 0; j < rolled.length; j++) {
      if (used[j]) continue;
      if (!isAtLeastAsGood(users[i], rolled[j])) continue;
      used[j] = true;
      if (tryMatch(i + 1)) return true;
      used[j] = false;
    }
    return false;
  };

  return tryMatch(0);
};
